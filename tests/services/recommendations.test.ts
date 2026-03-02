import test from "node:test";
import assert from "node:assert/strict";

process.env.EXPO_PUBLIC_FIREBASE_API_KEY = "test";
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = "test";
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
process.env.EXPO_PUBLIC_FIREBASE_APP_ID = "test";
process.env.EXPO_PUBLIC_MOVIE_API_KEY = "test";
process.env.EXPO_PUBLIC_MOVIE_ACCESS_TOKEN = "test";
process.env.EXPO_PUBLIC_RECOMMENDER_ENDPOINT = "";
process.env.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO = "false";
process.env.EXPO_PUBLIC_OPENAI_API_KEY = "";

type MockResponse = {
  ok: boolean;
  statusText: string;
  json: () => Promise<unknown>;
};

const mkResponse = (body: unknown, ok = true, statusText = "OK"): MockResponse => ({
  ok,
  statusText,
  json: async () => body,
});

const loadDeps = async () => {
  const [{ ENV }, { fetchAIRecommendations, fetchRecommendedContent }] = await Promise.all([
    import("../../config/env"),
    import("../../services/recommendations"),
  ]);

  return { ENV, fetchAIRecommendations, fetchRecommendedContent };
};

test("fetchAIRecommendations returns [] when endpoint missing and demo disabled", async () => {
  const { ENV, fetchAIRecommendations } = await loadDeps();
  ENV.EXPO_PUBLIC_RECOMMENDER_ENDPOINT = "";
  ENV.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO = "false";
  ENV.EXPO_PUBLIC_OPENAI_API_KEY = "";

  const items = await fetchAIRecommendations({ favorites: ["Dune"] });
  assert.deepEqual(items, []);
});

test("fetchAIRecommendations parses JSON from OpenAI output_text in demo mode", async () => {
  const { ENV, fetchAIRecommendations } = await loadDeps();
  ENV.EXPO_PUBLIC_RECOMMENDER_ENDPOINT = "";
  ENV.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO = "true";
  ENV.EXPO_PUBLIC_OPENAI_API_KEY = "sk-demo";

  global.fetch = (async () =>
    mkResponse({
      output_text:
        "Here you go:\n{\"recommendations\":[{\"title\":\"Dune\",\"mediaType\":\"movie\",\"reason\":\"Epic sci-fi.\"}]}",
    })) as unknown as typeof fetch;

  const items = await fetchAIRecommendations({ favorites: ["Interstellar"] });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.title, "Dune");
  assert.equal(items[0]?.mediaType, "movie");
});

test("fetchRecommendedContent enriches recommendation with TMDB search", async () => {
  const { ENV, fetchRecommendedContent } = await loadDeps();
  ENV.EXPO_PUBLIC_RECOMMENDER_ENDPOINT = "https://example.test/reco";
  ENV.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO = "false";
  ENV.EXPO_PUBLIC_OPENAI_API_KEY = "";

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "https://example.test/reco") {
      return mkResponse({
        recommendations: [{ title: "Inception", mediaType: "movie", reason: "Mind-bending sci-fi." }],
      }) as unknown as Response;
    }
    if (url.includes("/search/movie?")) {
      return mkResponse({
        results: [
          {
            id: 27205,
            title: "Inception",
            poster_path: "/inception.jpg",
            vote_average: 8.4,
            release_date: "2010-07-16",
            overview: "A thief enters dreams.",
            genre_ids: [28, 878],
          },
        ],
      }) as unknown as Response;
    }
    if (url.includes("/search/tv?")) {
      return mkResponse({ results: [] }) as unknown as Response;
    }
    return mkResponse({}, false, "Unhandled URL") as unknown as Response;
  }) as unknown as typeof fetch;

  const items = await fetchRecommendedContent({ favorites: ["Matrix"], country: "US" });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.title, "Inception");
  assert.equal(items[0]?.reason, "Mind-bending sci-fi.");
  assert.equal(items[0]?.type, "movie");
});

test("fetchRecommendedContent chooses higher score for mediaType any", async () => {
  const { ENV, fetchRecommendedContent } = await loadDeps();
  ENV.EXPO_PUBLIC_RECOMMENDER_ENDPOINT = "https://example.test/reco";
  ENV.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO = "false";
  ENV.EXPO_PUBLIC_OPENAI_API_KEY = "";

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "https://example.test/reco") {
      return mkResponse({
        recommendations: [{ title: "Dark", mediaType: "any", reason: "You like complex stories." }],
      }) as unknown as Response;
    }
    if (url.includes("/search/movie?")) {
      return mkResponse({
        results: [{ id: 1, title: "Dark Movie", vote_average: 7.1, genre_ids: [] }],
      }) as unknown as Response;
    }
    if (url.includes("/search/tv?")) {
      return mkResponse({
        results: [{ id: 2, name: "Dark", vote_average: 8.7, genre_ids: [] }],
      }) as unknown as Response;
    }
    return mkResponse({}, false, "Unhandled URL") as unknown as Response;
  }) as unknown as typeof fetch;

  const items = await fetchRecommendedContent({ favorites: ["Dark"] });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.type, "tv");
});
