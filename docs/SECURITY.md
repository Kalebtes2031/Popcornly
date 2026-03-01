# Security Notes

## Current Security Priorities

1. Enforce Firestore least-privilege access
2. Prevent cross-user reads/writes for favorites
3. Protect user profile updates
4. Restrict metrics writes to authenticated users

## Firestore Rules Starter (to be adapted)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /favorites/{favoriteId} {
      allow read, create, update, delete: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    match /metrics/{docId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if false;
    }

    match /tvMetrics/{docId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

## Follow-up

1. Add explicit schema checks in rules (`hasOnly`, expected fields/types)
2. Add App Check for abuse mitigation
3. Add rate limiting strategy via backend function if metrics gets abused
