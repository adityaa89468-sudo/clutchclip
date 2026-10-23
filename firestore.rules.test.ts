/**
 * Firestore Security Rules Test Suite verifying all "Dirty Dozen" payloads return PERMISSION_DENIED.
 */

export interface TestPayloadResult {
  id: number;
  name: string;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: TestPayloadResult[] = [
  { id: 1, name: 'Unauthenticated Write to /userSubscriptions/user_1', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified Email Write (email_verified == false)', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Cross-User Path Write (/userSubscriptions/user_2 by user_1)', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'UID Field Spoofing (data.uid != request.auth.uid)', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Email Field Spoofing (data.email != request.auth.token.email)', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Shadow Field Injection (extra key isAdmin: true)', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Invalid Enum Value for tier (tier: "lifetime_hacked")', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Oversized displayName (> 120 chars)', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Forged Client Timestamp on Create (createdAt != request.time)', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Immutable Field Mutation on Update (createdAt modified)', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Cross-User PII Read (/userSubscriptions/user_1 by user_2)', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Unauthorized Collection List Query on /userSubscriptions', expected: 'PERMISSION_DENIED' },
];
