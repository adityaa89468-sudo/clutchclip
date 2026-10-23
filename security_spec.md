# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Strict Ownership (`userSubscriptions/{userId}`)**:
   - Every document in `/userSubscriptions/{userId}` represents a single signed-in Google user's account profile and their Google Play Billing subscription status.
   - `userId` path parameter MUST match `^[a-zA-Z0-9_\-]+$` with length `<= 128` (`isValidId(userId)`).
   - Only the authenticated owner (`request.auth.uid == userId`) with a verified email (`request.auth.token.email_verified == true`) can `get`, `create`, or `update` their own `/userSubscriptions/{userId}` document.
   - Cross-user reads (`get` by another user) and collection-wide `list` or `delete` operations are strictly denied (`if false`) to enforce PII isolation of `email`, `displayName`, and billing receipts.
2. **Schema & Volumetric Bounds (`isValidUserSubscription`)**:
   - Required & allowed keys: `['uid', 'email', 'displayName', 'photoURL', 'tier', 'orderId', 'productId', 'amountPaid', 'paymentMethod', 'expiresAtMs', 'createdAt', 'updatedAt']`.
   - `uid` must equal `request.auth.uid` and match `^[a-zA-Z0-9_\-]+$`, size `1..128`.
   - `email` must equal `request.auth.token.email` and have size `3..256`.
   - `displayName` is string, size `1..120`.
   - `photoURL` is string, size `0..1024`.
   - `tier` must be one of `['free', 'pro_2k', 'ultra_4k']`.
   - `orderId` is string, size `0..128`.
   - `productId` is string, size `0..128`.
   - `amountPaid` is string, size `0..32`.
   - `paymentMethod` is string, size `0..64`.
   - `expiresAtMs` is int or number, `>= 0`.
3. **Temporal & Immutable Integrity**:
   - On `create`: `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - On `update`: `incoming().uid == existing().uid && incoming().email == existing().email && incoming().createdAt == existing().createdAt && incoming().updatedAt == request.time`.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Unauthenticated Write)**: `request.auth == null` attempting to create `/userSubscriptions/user_1`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Spoof)**: Authenticated user with `email_verified: false` attempting to create `/userSubscriptions/user_1`. -> `PERMISSION_DENIED`
3. **Payload 3 (Cross-User Identity Spoofing on Path)**: User `user_1` attempting to write `/userSubscriptions/user_2`. -> `PERMISSION_DENIED`
4. **Payload 4 (UID Field Mismatch inside Payload)**: User `user_1` writing to `/userSubscriptions/user_1` with `uid: "user_2"`. -> `PERMISSION_DENIED`
5. **Payload 5 (Email Mismatch inside Payload)**: User `user_1` (`a@gmail.com`) writing `email: "victim@gmail.com"`. -> `PERMISSION_DENIED`
6. **Payload 6 (Shadow / Ghost Field Injection)**: Payload includes an extra unauthorized field `isAdmin: true`. -> `PERMISSION_DENIED`
7. **Payload 7 (Invalid Enum Tier Value)**: Payload sets `tier: "lifetime_hacked"`. -> `PERMISSION_DENIED`
8. **Payload 8 (Oversized String / Denial of Wallet)**: Payload sets `displayName` to a 500-char string (`> 120`). -> `PERMISSION_DENIED`
9. **Payload 9 (Forged Client Timestamp on Create)**: Payload sets `createdAt` to a past timestamp instead of `request.time`. -> `PERMISSION_DENIED`
10. **Payload 10 (Mutating Immutable `createdAt` on Update)**: Update payload alters `createdAt`. -> `PERMISSION_DENIED`
11. **Payload 11 (PII Leak via Cross-User Read)**: User `user_2` attempting `get` on `/userSubscriptions/user_1`. -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized Collection Scraping via `list`)**: Authenticated user attempting to `list` `/userSubscriptions`. -> `PERMISSION_DENIED`
