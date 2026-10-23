import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MembershipTier } from '../types/recorder';
import { googlePlayBilling, PlayBillingReceipt } from './googlePlayBilling';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
    ClutchClipAndroid?: {
      getGoogleIdToken?: () => string | null;
      signInWithGoogle?: () => void;
    };
    signInWithNativeGoogleToken?: (
      idToken: string,
      accessToken?: string
    ) => Promise<{ user: User; subscription: UserSubscriptionRecord }>;
    onNativeGoogleAuthFallbackToWeb?: () => void;
  }
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
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
) {
  const uid = (user.uid || '').slice(0, MAX_UID_LEN);
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

/**
 * Fetch a signed-in user's subscription document from Firestore (/userSubscriptions/{uid})
 */
export async function fetchUserSubscriptionFromFirestore(
  user: User
): Promise<UserSubscriptionRecord | null> {
  const path = `userSubscriptions/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'userSubscriptions', user.uid));
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
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
  } catch (error) {
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
      } catch {
        // Handle concurrent creation race by falling back to updateDoc
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
  const path = `userSubscriptions/${user.uid}`;
  const docRef = doc(db, 'userSubscriptions', user.uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate({
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
      });
    },
    (error) => {
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
        // Check if user had a local Play Billing receipt or is the primary owner account
        const savedReceipt = googlePlayBilling.getSavedReceipt();
        const isOwnerEmail = user.email?.toLowerCase() === 'adityaa89468@gmail.com';
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
        // Ensure owner account shows Pro User badge on profile photo after login unless explicitly switched to free
        existing = await saveUserSubscriptionToFirestore(user, 'ultra_4k', null);
      }
      return { user, subscription: existing };
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
  return ensureUserSubscriptionRecord(result.user);
}

// Register global bridge hooks for Android APK WebView (`webView.evaluateJavascript`)
if (typeof window !== 'undefined') {
  window.signInWithNativeGoogleToken = signInWithGoogleIdToken;
  window.onNativeGoogleAuthFallbackToWeb = () => {
    signInWithRedirect(auth, googleProvider).catch((err) => {
      console.error('Web redirect fallback error:', err);
    });
  };
}

/**
 * Check if the app just returned from a `signInWithRedirect` flow
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
    return null;
  } catch (err) {
    console.warn('Redirect sign-in check:', err);
    return null;
  }
}

/**
 * Trigger Google Sign-In:
 * 1. If running inside the Native Android APK with `window.ClutchClipAndroid`, uses Native Google Sign-In
 *    (which passes the Google ID Token to `window.signInWithNativeGoogleToken`, or falls back to Web Redirect).
 * 2. On Web, uses `signInWithPopup` (required for AI Studio iframe & modern browsers),
 *    with automatic fallback to `signInWithRedirect` if popups are blocked by a mobile browser.
 */
export async function signInWithGoogleAccount(): Promise<{
  user: User;
  subscription: UserSubscriptionRecord;
}> {
  if (typeof window !== 'undefined') {
    // Clear any legacy forced redirect mode so web popup always works cleanly
    localStorage.removeItem('clutchclip_apk_auth_mode');

    const nativeIdToken =
      window.AndroidAuth?.getGoogleIdToken?.() ||
      window.ClutchClipAndroid?.getGoogleIdToken?.();
    if (nativeIdToken) {
      return await signInWithGoogleIdToken(nativeIdToken);
    }

    if (window.ClutchClipAndroid?.signInWithGoogle) {
      window.ClutchClipAndroid.signInWithGoogle();
      throw new Error('NATIVE_SIGNIN_INITIATED');
    }
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return await ensureUserSubscriptionRecord(credential.user);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const message = err instanceof Error ? err.message : String(err);

    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      message.includes('popup-blocked') ||
      message.includes('operation-not-supported')
    ) {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('REDIRECT_INITIATED');
    }

    throw err;
  }
}

export async function signOutGoogleAccount(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };
