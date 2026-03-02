# Todo Checklist

## Phase 1: Foundation (Current)

- [x] Feature-complete app flow (auth, browse, search, details, favorites)
- [x] In-app trailer playback with resilient YouTube fallback
- [x] Where-to-watch providers by country on detail pages
- [x] Cohesive UI styling and navigation
- [x] TypeScript + lint baseline
- [x] README upgraded for final presentation
- [x] `.env.example` added

## Phase 2: Fullstack Credibility

- [x] AI recommendation pipeline (client -> Firebase Function -> OpenAI -> TMDB enrichment)
- [x] Firestore security rules hardened
- [ ] Firestore rules emulator tests (`@firebase/rules-unit-testing`)
- [x] Firestore indexes documented
- [ ] Service-layer unit tests
- [ ] Integration test for auth + favorites flow
- [x] CI pipeline (`lint`, `tsc`, tests)

## Phase 3: Production Signals

- [ ] Error monitoring (Sentry/Crashlytics)
- [ ] Product analytics events
- [ ] Offline behavior review
- [ ] Accessibility QA pass
- [ ] Performance profiling + optimization notes

## Phase 4: Final Presentation

- [ ] Add final screenshots to `docs/screenshots`
- [ ] Add 60-90 second demo video link
- [ ] Add architecture diagram image
- [ ] Add "Challenges and Tradeoffs" section in README
- [ ] Add deployment/release notes
