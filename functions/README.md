# Firebase Functions (OpenAI Recommender)

This folder contains the server-side OpenAI proxy used by the mobile app.

## Why

1. Keep OpenAI API key off the mobile client
2. Enforce controlled prompt/output shape
3. Enable future rate limiting, analytics, and moderation

## Setup

1. Install dependencies

```bash
cd functions
npm install
```

2. Set OpenAI secret for Firebase Functions

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

3. Deploy function

```bash
firebase deploy --only functions
```

4. Copy deployed endpoint URL into app `.env`

```env
EXPO_PUBLIC_RECOMMENDER_ENDPOINT=https://<region>-<project>.cloudfunctions.net/recommendations
```
