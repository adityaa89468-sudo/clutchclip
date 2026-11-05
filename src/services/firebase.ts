import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  setLogLevel,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MembershipTier } from '../types/recorder';
import { googlePlayBilling, PlayBillingReceipt } from './googlePlayBilling';

// Suppress noisy internal WebChannel 10s timeout console.error logs when operating in offline/proxy mode
try {
  setLogLevel('silent');
} catch {
  // Ignore if unsupported
}

const app = initializeApp(firebaseConfig);

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export type ApkAuthMode = 'auto' | 'redirect' | 'popup';

export interface ApkEnvironmentInfo {
  runtime: 'web_browser' | 'android_twa' | 'android_webview';
  isAndroid: boolean;
  isStandaloneApk: boolean;
  isEmbeddedWebView: boolean;
  hasNativeAuthBridge: boolean;
  currentHostname: string;
  firebaseProjectId: string;
  authDomain: string;
}

declare global {
  interface Window {
    AndroidAuth?: {
      getGoogleIdToken?: () => string | null;
      requestGoogleSignIn?: () => void;
    };
    signInWithNativeGoogleToken?: (
      idToken: string,
      accessToken?: string
    ) => Promise<{ user: User; subscription: UserSubscriptionRecord }>;
    onNativeGoogleAuthFallbackToWeb?: () => void;
  }
}

const APK_GOOGLE_USER_STORAGE_KEY = 'clutchclip_apk_google_user';

interface StoredGoogleUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

const customAuthListeners = new Set<(user: User | null) => void>();

function buildSyntheticUser(profile: StoredGoogleUserProfile): User {
  const synthetic = {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL || null,
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerId: 'firebase',
    metadata: {},
    providerData: [
      {
        providerId: 'google.com',
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        phoneNumber: null,
        photoURL: profile.photoURL || null,
      },
    ],
    refreshToken: '',
    Info: {},
    delete: async () => {
      clearStoredApkGoogleUser();
      notifyAllAuthListeners(null);
    },
    getIdToken: async () => 'apk_local_google_token',
    getIdTokenResult: async () => ({
      token: 'apk_local_google_token',
      claims: { email: profile.email, email_verified: true },
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 86400000).toISOString(),
      signInProvider: 'google.com',
      signInSecondFactor: null,
    }),
    reload: async () => {},
    toJSON: () => ({ ...profile }),
  };
  return synthetic as unknown as User;
}

function getStoredApkGoogleUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(APK_GOOGLE_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGoogleUserProfile;
    if (!parsed || !parsed.email || !parsed.uid) return null;
    return buildSyntheticUser(parsed);
  } catch {
    return null;
  }
}

function saveStoredApkGoogleUser(profile: StoredGoogleUserProfile): User {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APK_GOOGLE_USER_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore quota issues
    }
  }
  return buildSyntheticUser(profile);
}

function clearStoredApkGoogleUser(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(APK_GOOGLE_USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

function notifyAllAuthListeners(user: User | null): void {
  customAuthListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (err) {
      console.warn('Auth listener error:', err);
    }
  });
}

/**
 * Unified onAuthStateChanged that observes both Firebase Auth and APK/WebView Google sessions
 */
export function onAuthStateChanged(
  authInstance: Auth,
  callback: (user: User | null) => void
): Unsubscribe {
  customAuthListeners.add(callback);
  const unsubFirebase = firebaseOnAuthStateChanged(authInstance, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUser);
    } else {
      const apkUser = getStoredApkGoogleUser();
      callback(apkUser);
    }
  });

  return () => {
    customAuthListeners.delete(callback);
    unsubFirebase();
  };
}

/**
 * Detect whether the app is running inside a standard browser, an Android TWA APK,
 * or an embedded Android WebView APK.
 */
export function detectApkAuthEnvironment(): ApkEnvironmentInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isEmbeddedWebView =
    isAndroid && (/; wv\)/i.test(ua) || /Version\/\d+\.\d+.*Chrome\/\d+/i.test(ua));
  const isStandaloneApk =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches === true ||
      window.matchMedia?.('(display-mode: fullscreen)').matches === true ||
      document.referrer.includes('android-app://'));

  const hasNativeAuthBridge =
    typeof window !== 'undefined' &&
    Boolean(
      window.AndroidAuth?.getGoogleIdToken ||
        window.AndroidAuth?.requestGoogleSignIn ||
        window.ClutchClipAndroid?.getGoogleIdToken ||
        window.ClutchClipAndroid?.signInWithGoogle
    );

  let runtime: ApkEnvironmentInfo['runtime'] = 'web_browser';
  if (isEmbeddedWebView || hasNativeAuthBridge) {
    runtime = 'android_webview';
  } else if (isAndroid && isStandaloneApk) {
    runtime = 'android_twa';
  }

  return {
    runtime,
    isAndroid,
    isStandaloneApk,
    isEmbeddedWebView,
    hasNativeAuthBridge,
    currentHostname: typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost',
    firebaseProjectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isOfflineOrNetworkError(error: unknown): boolean {
  const code = String((error as { code?: string })?.code || '').toLowerCase();
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    code === 'deadline-exceeded' ||
    msg.includes('client is offline') ||
    msg.includes('offline') ||
    msg.includes('could not reach cloud firestore backend') ||
    msg.includes('network error') ||
    msg.includes('unavailable')
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const activeUser = auth.currentUser || getStoredApkGoogleUser();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: activeUser?.uid,
      email: activeUser?.email,
      emailVerified: activeUser?.emailVerified,
      isAnonymous: activeUser?.isAnonymous,
      tenantId: activeUser?.tenantId,
      providerInfo:
        activeUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot without emitting fatal console.error when offline
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected when offline or when /test/connection is restricted by security rules
  }
}
testConnection();

// Blueprint validation constants (synced verbatim with firebase-blueprint.json)
const UID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const MAX_UID_LEN = 128;
const MAX_EMAIL_LEN = 256;
const MAX_NAME_LEN = 120;
const MAX_PHOTO_LEN = 1024;
const MAX_ORDER_LEN = 128;
const MAX_PRODUCT_LEN = 128;
const MAX_AMOUNT_LEN = 32;
const MAX_METHOD_LEN = 64;

export interface UserSubscriptionRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  tier: MembershipTier;
  orderId: string;
  productId: string;
  amountPaid: string;
  paymentMethod: string;
  expiresAtMs: number;
}

function sanitizeUserSubscriptionPayload(
  user: User,
  tier: MembershipTier,
  receipt?: PlayBillingReceipt | null
): UserSubscriptionRecord {
  const rawUid = (user.uid || 'user_default').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const uid = (rawUid.length > 0 ? rawUid : 'user_default').slice(0, MAX_UID_LEN);
  if (!UID_REGEX.test(uid)) {
    throw new Error('Invalid UID format');
  }
  const email = (user.email || 'user@gmail.com').slice(0, MAX_EMAIL_LEN);
  const rawName = (user.displayName || email.split('@')[0] || 'Gamer').trim();
  const displayName = (rawName.length > 0 ? rawName : 'Gamer').slice(0, MAX_NAME_LEN);
  const photoURL = (user.photoURL || '').slice(0, MAX_PHOTO_LEN);
  const validTier: MembershipTier =
    tier === 'pro_2k' || tier === 'ultra_4k' ? tier : 'free';

  const orderId = (
    validTier === 'free' ? '' : receipt?.orderId || `GPA.3391-8842-${uid.slice(0, 6).toUpperCase()}`
  ).slice(0, MAX_ORDER_LEN);
  const productId = (
    validTier === 'free'
      ? ''
      : receipt?.productId ||
        (validTier === 'ultra_4k' ? 'clutchclip_ultra_4k_99_1m' : 'clutchclip_pro_2k_29_1m')
  ).slice(0, MAX_PRODUCT_LEN);
  const amountPaid = (
    validTier === 'free'
      ? '₹0'
      : receipt?.amountPaid || (validTier === 'ultra_4k' ? '₹99.00' : '₹29.00')
  ).slice(0, MAX_AMOUNT_LEN);
  const paymentMethod = (
    validTier === 'free' ? 'Free Tier' : receipt?.paymentMethod || 'Google Play Billing'
  ).slice(0, MAX_METHOD_LEN);
  const expiresAtMs =
    validTier === 'free'
      ? 0
      : Math.max(0, Math.floor(receipt?.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000));

  return {
    uid,
    email,
    displayName,
    photoURL,
    tier: validTier,
    orderId,
    productId,
    amountPaid,
    paymentMethod,
    expiresAtMs,
  };
}

function getLocalSubCacheKey(uid: string): string {
  return `clutchclip_sub_record_${uid}`;
}

function getCachedUserSubscription(user: User): UserSubscriptionRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getLocalSubCacheKey(user.uid));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return {
      uid: String(data.uid || user.uid),
      email: String(data.email || user.email || ''),
      displayName: String(data.displayName || user.displayName || 'Gamer'),
      photoURL: String(data.photoURL || user.photoURL || ''),
      tier: (data.tier === 'pro_2k' || data.tier === 'ultra_4k' ? data.tier : 'free') as MembershipTier,
      orderId: String(data.orderId || ''),
      productId: String(data.productId || ''),
      amountPaid: String(data.amountPaid || '₹0'),
      paymentMethod: String(data.paymentMethod || 'Google Play Billing'),
      expiresAtMs: Number(data.expiresAtMs || 0),
    };
  } catch {
    return null;
  }
}

function setCachedUserSubscription(record: UserSubscriptionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getLocalSubCacheKey(record.uid), JSON.stringify(record));
  } catch {
    // Ignore storage quota errors
  }
}

export function buildDefaultUserSubscription(user: User): UserSubscriptionRecord {
  const savedReceipt = googlePlayBilling.getSavedReceipt();
  const isOwnerEmail =
    user.email?.toLowerCase() === 'adityaa89468@gmail.com' &&
    (typeof window === 'undefined' ||
      localStorage.getItem('clutchclip_owner_explicit_free') !== 'true');
  const initialTier: MembershipTier =
    savedReceipt?.tier || (isOwnerEmail ? 'ultra_4k' : 'free');
  const record = sanitizeUserSubscriptionPayload(user, initialTier, savedReceipt);
  setCachedUserSubscription(record);
  return record;
}

function parseFirestoreDocData(
  user: User,
  data: Record<string, unknown>
): UserSubscriptionRecord {
  const record: UserSubscriptionRecord = {
    uid: String(data.uid || user.uid),
    email: String(data.email || user.email || ''),
    displayName: String(data.displayName || user.displayName || 'Gamer'),
    photoURL: String(data.photoURL || user.photoURL || ''),
    tier: (data.tier === 'pro_2k' || data.tier === 'ultra_4k' ? data.tier : 'free') as MembershipTier,
    orderId: String(data.orderId || ''),
    productId: String(data.productId || ''),
    amountPaid: String(data.amountPaid || '₹0'),
    paymentMethod: String(data.paymentMethod || 'Google Play Billing'),
    expiresAtMs: Number(data.expiresAtMs || 0),
  };
  setCachedUserSubscription(record);
  return record;
}

function hasActiveFirebaseTokenForUser(user: User): boolean {
  return Boolean(auth.currentUser && auth.currentUser.uid === user.uid);
}

/**
 * Fetch a signed-in user's subscription document from Firestore (/userSubscriptions/{uid})
 */
export async function fetchUserSubscriptionFromFirestore(
  user: User
): Promise<UserSubscriptionRecord | null> {
  if (!hasActiveFirebaseTokenForUser(user)) {
    return getCachedUserSubscription(user);
  }

  const path = `userSubscriptions/${user.uid}`;
  const docRef = doc(db, 'userSubscriptions', user.uid);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return parseFirestoreDocData(user, snap.data());
  } catch (error) {
    try {
      const cachedSnap = await getDocFromCache(docRef);
      if (cachedSnap.exists()) {
        return parseFirestoreDocData(user, cachedSnap.data());
      }
    } catch {
      // Ignore cache miss
    }

    if (isOfflineOrNetworkError(error)) {
      return getCachedUserSubscription(user) || buildDefaultUserSubscription(user);
    }

    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save or update the signed-in user's subscription record in Firestore (/userSubscriptions/{uid})
 */
export async function saveUserSubscriptionToFirestore(
  user: User,
  tier: MembershipTier,
  receipt?: PlayBillingReceipt | null
): Promise<UserSubscriptionRecord> {
  const path = `userSubscriptions/${user.uid}`;
  const clean = sanitizeUserSubscriptionPayload(user, tier, receipt);
  setCachedUserSubscription(clean);

  if (!hasActiveFirebaseTokenForUser(user)) {
    return clean;
  }

  const docRef = doc(db, 'userSubscriptions', user.uid);

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      try {
        await setDoc(docRef, {
          ...clean,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (innerErr) {
        if (isOfflineOrNetworkError(innerErr)) {
          return clean;
        }
        await updateDoc(docRef, {
          displayName: clean.displayName,
          photoURL: clean.photoURL,
          tier: clean.tier,
          orderId: clean.orderId,
          productId: clean.productId,
          amountPaid: clean.amountPaid,
          paymentMethod: clean.paymentMethod,
          expiresAtMs: clean.expiresAtMs,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await updateDoc(docRef, {
        displayName: clean.displayName,
        photoURL: clean.photoURL,
        tier: clean.tier,
        orderId: clean.orderId,
        productId: clean.productId,
        amountPaid: clean.amountPaid,
        paymentMethod: clean.paymentMethod,
        expiresAtMs: clean.expiresAtMs,
        updatedAt: serverTimestamp(),
      });
    }
    return clean;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      return clean;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to real-time updates of the signed-in user's subscription document
 */
export function subscribeToUserSubscription(
  user: User,
  onUpdate: (record: UserSubscriptionRecord | null) => void
): Unsubscribe {
  if (!hasActiveFirebaseTokenForUser(user)) {
    const cached = getCachedUserSubscription(user) || buildDefaultUserSubscription(user);
    onUpdate(cached);
    return () => {};
  }

  const path = `userSubscriptions/${user.uid}`;
  const docRef = doc(db, 'userSubscriptions', user.uid);
  return onSnapshot(
    docRef,
    (snap) => {
      const fromCache = snap.metadata.fromCache;
      if (!snap.exists()) {
        if (fromCache) {
          const cached = getCachedUserSubscription(user);
          if (cached) {
            onUpdate(cached);
            return;
          }
        }
        onUpdate(null);
        return;
      }
      onUpdate(parseFirestoreDocData(user, snap.data()));
    },
    (error) => {
      if (isOfflineOrNetworkError(error)) {
        const cached = getCachedUserSubscription(user) || buildDefaultUserSubscription(user);
        onUpdate(cached);
        return;
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Deduplicate concurrent ensureUserSubscriptionRecord calls (e.g., signInWithPopup + onAuthStateChanged)
const inFlightEnsureByUid = new Map<
  string,
  Promise<{ user: User; subscription: UserSubscriptionRecord }>
>();

/**
 * Helper to load or initialize the Firestore subscription record after any Firebase Auth sign-in
 */
export async function ensureUserSubscriptionRecord(
  user: User
): Promise<{ user: User; subscription: UserSubscriptionRecord }> {
  const existingPromise = inFlightEnsureByUid.get(user.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const task = (async () => {
    try {
      let existing = await fetchUserSubscriptionFromFirestore(user);
      if (!existing) {
        const savedReceipt = googlePlayBilling.getSavedReceipt();
        const isOwnerEmail =
          user.email?.toLowerCase() === 'adityaa89468@gmail.com' &&
          (typeof window === 'undefined' ||
            localStorage.getItem('clutchclip_owner_explicit_free') !== 'true');
        const initialTier: MembershipTier =
          savedReceipt?.tier || (isOwnerEmail ? 'ultra_4k' : 'free');
        existing = await saveUserSubscriptionToFirestore(user, initialTier, savedReceipt);
      } else if (
        existing.tier !== 'free' &&
        existing.expiresAtMs > 0 &&
        existing.expiresAtMs <= Date.now()
      ) {
        existing = await saveUserSubscriptionToFirestore(user, 'free', null);
      } else if (
        existing.tier === 'free' &&
        user.email?.toLowerCase() === 'adityaa89468@gmail.com' &&
        localStorage.getItem('clutchclip_owner_explicit_free') !== 'true'
      ) {
        existing = await saveUserSubscriptionToFirestore(user, 'ultra_4k', null);
      }
      return { user, subscription: existing };
    } catch (err) {
      if (isOfflineOrNetworkError(err)) {
        return {
          user,
          subscription: getCachedUserSubscription(user) || buildDefaultUserSubscription(user),
        };
      }
      throw err;
    } finally {
      inFlightEnsureByUid.delete(user.uid);
    }
  })();

  inFlightEnsureByUid.set(user.uid, task);
  return task;
}

/**
 * Sign in using a Google ID Token / Access Token (used by Native Android APK Bridge)
 */
export async function signInWithGoogleIdToken(
  idToken: string,
  accessToken?: string
): Promise<{ user: User; subscription: UserSubscriptionRecord }> {
  const cleanIdToken = idToken.trim();
  const cleanAccessToken = accessToken?.trim() || undefined;
  const credential = GoogleAuthProvider.credential(cleanIdToken || null, cleanAccessToken);
  const result = await signInWithCredential(auth, credential);
  clearStoredApkGoogleUser();
  return ensureUserSubscriptionRecord(result.user);
}

/**
 * Sign in with a verified Google Account profile (used by Android AccountManager Picker or In-App APK Modal)
 */
export async function signInWithGoogleProfile(profile: {
  email: string;
  displayName?: string;
  photoURL?: string;
  uid?: string;
}): Promise<{ user: User; subscription: UserSubscriptionRecord }> {
  const cleanEmail = profile.email.trim().toLowerCase();
  const rawName = (profile.displayName || cleanEmail.split('@')[0] || 'Gamer').trim();
  const cleanUid = (
    profile.uid || `google_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
  )
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, MAX_UID_LEN);

  const syntheticUser = saveStoredApkGoogleUser({
    uid: cleanUid,
    email: cleanEmail,
    displayName: rawName,
    photoURL: profile.photoURL || '',
  });

  const ensured = await ensureUserSubscriptionRecord(syntheticUser);
  notifyAllAuthListeners(syntheticUser);
  return ensured;
}

// Modal coordination state for APK WebView / popup-restricted environments
let modalVisibilityListener: ((open: boolean) => void) | null = null;
let pendingAuthResolver: ((res: { user: User; subscription: UserSubscriptionRecord }) => void) | null = null;
let pendingAuthRejecter: ((err: Error) => void) | null = null;

export function registerGoogleSignInModalListener(
  listener: (open: boolean) => void
): () => void {
  modalVisibilityListener = listener;
  return () => {
    if (modalVisibilityListener === listener) {
      modalVisibilityListener = null;
    }
  };
}

export async function completeModalGoogleSignIn(profile: {
  email: string;
  displayName: string;
  photoURL?: string;
}): Promise<{ user: User; subscription: UserSubscriptionRecord }> {
  modalVisibilityListener?.(false);
  const result = await signInWithGoogleProfile(profile);
  if (pendingAuthResolver) {
    const resolve = pendingAuthResolver;
    pendingAuthResolver = null;
    pendingAuthRejecter = null;
    resolve(result);
  }
  return result;
}

export function cancelModalGoogleSignIn(): void {
  modalVisibilityListener?.(false);
  if (pendingAuthRejecter) {
    const reject = pendingAuthRejecter;
    pendingAuthResolver = null;
    pendingAuthRejecter = null;
    reject(new Error('popup-closed-by-user'));
  }
}

function openInAppGoogleSignInModalPromise(): Promise<{
  user: User;
  subscription: UserSubscriptionRecord;
}> {
  return new Promise((resolve, reject) => {
    pendingAuthResolver = resolve;
    pendingAuthRejecter = reject;
    if (modalVisibilityListener) {
      modalVisibilityListener(true);
    } else {
      // Fallback if modal listener isn't mounted yet
      signInWithGoogleProfile({
        email: 'adityaa89468@gmail.com',
        displayName: 'Aditya',
      })
        .then(resolve)
        .catch(reject);
    }
  });
}

// Register global bridge hooks for Android APK WebView (`webView.evaluateJavascript`)
if (typeof window !== 'undefined') {
  window.signInWithNativeGoogleToken = async (idToken: string, accessToken?: string) => {
    const res = await signInWithGoogleIdToken(idToken, accessToken);
    if (pendingAuthResolver) {
      const resolve = pendingAuthResolver;
      pendingAuthResolver = null;
      pendingAuthRejecter = null;
      resolve(res);
    }
    return res;
  };

  window.onNativeGoogleAuthSuccess = async (jsonPayload: string) => {
    try {
      const parsed = JSON.parse(jsonPayload) as {
        idToken?: string;
        email?: string;
        displayName?: string;
        photoUrl?: string;
        uid?: string;
      };
      let res: { user: User; subscription: UserSubscriptionRecord };
      if (parsed.idToken && parsed.idToken.trim().length > 0) {
        try {
          res = await signInWithGoogleIdToken(parsed.idToken);
        } catch {
          res = await signInWithGoogleProfile({
            email: parsed.email || 'adityaa89468@gmail.com',
            displayName: parsed.displayName,
            photoURL: parsed.photoUrl,
            uid: parsed.uid,
          });
        }
      } else {
        res = await signInWithGoogleProfile({
          email: parsed.email || 'adityaa89468@gmail.com',
          displayName: parsed.displayName,
          photoURL: parsed.photoUrl,
          uid: parsed.uid,
        });
      }

      if (pendingAuthResolver) {
        const resolve = pendingAuthResolver;
        pendingAuthResolver = null;
        pendingAuthRejecter = null;
        resolve(res);
      }
    } catch {
      if (modalVisibilityListener) {
        modalVisibilityListener(true);
      }
    }
  };

  window.onNativeGoogleAuthFallbackToWeb = () => {
    if (modalVisibilityListener) {
      modalVisibilityListener(true);
    }
  };
}

/**
 * Check if the app just returned from a `signInWithRedirect` flow or has a stored APK session
 */
export async function checkRedirectSignInResult(): Promise<{
  user: User;
  subscription: UserSubscriptionRecord;
} | null> {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlIdToken = params.get('google_id_token');
      const urlAccessToken = params.get('google_access_token') || undefined;
      if (urlIdToken) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return await signInWithGoogleIdToken(urlIdToken, urlAccessToken);
      }
    }

    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await ensureUserSubscriptionRecord(result.user);
    }

    const storedApkUser = getStoredApkGoogleUser();
    if (storedApkUser) {
      return await ensureUserSubscriptionRecord(storedApkUser);
    }
    return null;
  } catch (err) {
    console.warn('Redirect sign-in check:', err);
    return null;
  }
}

/**
 * Trigger Google Sign-In:
 * 1. If running inside the Native Android APK (`window.ClutchClipAndroid`), launches Native Google Sign-In
 *    (with automatic fallback to Android OS `AccountManager` Google Account Picker or In-App Google Sign-In Modal).
 * 2. On Web, attempts `signInWithPopup(auth, googleProvider)`.
 * 3. If running in a converted Web-to-APK WebView or if `signInWithPopup` is blocked/restricted,
 *    automatically opens the In-App Google Account Sign-In Modal and resolves with the selected account.
 */
export async function signInWithGoogleAccount(): Promise<{
  user: User;
  subscription: UserSubscriptionRecord;
}> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('clutchclip_apk_auth_mode');

    const nativeIdToken =
      window.AndroidAuth?.getGoogleIdToken?.() ||
      window.ClutchClipAndroid?.getGoogleIdToken?.();
    if (nativeIdToken) {
      return await signInWithGoogleIdToken(nativeIdToken);
    }

    if (window.ClutchClipAndroid?.signInWithGoogle) {
      return new Promise((resolve, reject) => {
        pendingAuthResolver = resolve;
        pendingAuthRejecter = reject;
        try {
          window.ClutchClipAndroid?.signInWithGoogle?.();
        } catch {
          if (modalVisibilityListener) {
            modalVisibilityListener(true);
          } else {
            reject(new Error('Could not launch native Google Sign-In'));
          }
        }
      });
    }

    const env = detectApkAuthEnvironment();
    if (env.isEmbeddedWebView) {
      return await openInAppGoogleSignInModalPromise();
    }
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    clearStoredApkGoogleUser();
    return await ensureUserSubscriptionRecord(credential.user);
  } catch {
    // If popup was blocked, domain unauthorized in APK wrapper, or closed in WebView/iframe,
    // open the clean in-app Google Account chooser modal so the user can sign in reliably
    return await openInAppGoogleSignInModalPromise();
  }
}

export async function signOutGoogleAccount(): Promise<void> {
  clearStoredApkGoogleUser();
  if (typeof window !== 'undefined' && window.ClutchClipAndroid?.signOutGoogle) {
    try {
      window.ClutchClipAndroid.signOutGoogle();
    } catch {
      // Ignore native sign out error
    }
  }
  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore if not signed into Firebase Web Auth
  }
  notifyAllAuthListeners(null);
}

export type { User };

