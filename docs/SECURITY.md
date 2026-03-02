# Security Notes

## Current Security Priorities

1. Enforce least-privilege access for every collection.
2. Prevent cross-user data access and ownership spoofing.
3. Restrict writes to expected schema only.
4. Lock immutable fields and deny unknown collections by default.

## Hardened Firestore Rules (Implemented)

Current `firestore.rules` now enforces:

1. `users` collection:
1. Read only by owner (`request.auth.uid == userId`).
2. Create requires exact keys and type checks (`uid`, `email`, `username`, `createdAt`).
3. Update only allows `username` mutation; `uid`, `email`, `createdAt` are immutable.
4. Delete denied.
2. `favorites` collection:
1. Read/delete only for owner (`resource.data.userId == request.auth.uid`).
2. Create requires strict schema (`userId`, `itemId`, `type`, `title`, `poster`, `savedAt`).
3. `type` limited to `movie` or `tv`.
4. Update denied.
3. `metrics` and `tvMetrics` collections:
1. Public read allowed.
2. Create requires strict schema and `count == 1`.
3. Update only allows `count` increment by exactly `+1`; all other fields immutable.
4. Delete denied.
4. Catch-all deny rule for all undeclared collections.

## Manual Validation (Recommended)

Use Firebase Emulator Suite to validate allow/deny behavior before deploy:

```bash
firebase emulators:start --only firestore
```

Validation matrix to run manually from app or test scripts:

1. `users`:
1. Owner can create/read/update username.
2. Non-owner cannot read or write.
3. Owner cannot change `email`/`uid`/`createdAt`.
2. `favorites`:
1. Auth user can create favorite for own `userId`.
2. Auth user cannot create favorite for another `userId`.
3. Non-owner cannot read/delete other user favorite.
3. `metrics`/`tvMetrics`:
1. Auth user can create metric document with valid fields.
2. Update with `count + 1` succeeds.
3. Update changing title/id/searchTerm fails.
4. Unauthenticated write fails.

## Deployment

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Follow-up

1. Add automated Firestore rules tests in CI (`@firebase/rules-unit-testing`).
2. Add Firebase App Check enforcement for abuse resistance.
3. Move metrics writes to Cloud Functions if stricter anti-abuse controls are needed.
4. Keep OpenAI key only in Firebase Functions secrets (`OPENAI_API_KEY`).
