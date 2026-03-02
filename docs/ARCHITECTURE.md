# Architecture Notes

## 1. System Overview

Popcornly 2 is a mobile app with a BaaS backend and third-party content API.

1. Client: Expo + React Native + Expo Router
2. Auth/Data: Firebase Auth + Firestore
3. Content: TMDB API
4. Data orchestration: React Query

## 2. Runtime Flow

1. User authenticates with Email/Password or Google.
2. Auth state is managed by `AuthContext`.
3. Tabs load content via service layer (`services/api.ts`, `services/firestoreService.ts`).
4. React Query caches responses and coordinates loading/error states.
5. Favorites and metrics persist in Firestore.
6. AI recommendation requests are sent to a Firebase Function, which calls OpenAI and returns structured picks.

## 3. Firestore Collections

1. `users`
2. `favorites`
3. `metrics`
4. `tvMetrics`

## 3.1 Recommendation Backend

1. Endpoint: Firebase Function `recommendations`
2. Input: favorites, recent searches, country
3. Processing: server-side OpenAI call (`gpt-4.1-mini`)
4. Output: normalized recommendation list (`title`, `mediaType`, `reason`)
5. Client enrichment: app resolves titles to TMDB items for posters, IDs, and navigation

## 4. Routing

Primary route groups:

1. `app/(auth)`
2. `app/(tabs)`
3. `app/movie/[id]`
4. `app/tv/[id]`
5. `app/search`
6. AI section in `app/(tabs)/home.tsx`

## 5. State Strategy

1. Server/remote state: React Query
2. Auth/global state: Context
3. Local UI state: screen-level hooks

## 6. Next Architecture Improvements

1. Add query key factory coverage for all features
2. Add DTO validation layer for all external API responses
3. Add repository abstraction for Firestore operations
4. Add analytics and error-monitoring adapter layer
