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

test("fetchMovies maps movie payload and query URL correctly", async () => {
  const calls: string[] = [];
  global.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return mkResponse({
      results: [
        {
          id: 1,
          title: "Dune",
          poster_path: "/dune.jpg",
          vote_average: 8.2,
          release_date: "2021-10-22",
          overview: "Test",
          genre_ids: [12, 878],
        },
      ],
    }) as unknown as Response;
  } ) as unknown as typeof fetch;

  const { fetchMovies } = await import("../../services/api");
  const items = await fetchMovies({ query: "Dune", page: 2 });

  assert.equal(calls.length, 1);
  assert.match(calls[0], /\/search\/movie\?/);
  assert.match(calls[0], /query=Dune/);
  assert.match(calls[0], /page=2/);
  assert.equal(items[0]?.type, "movie");
  assert.deepEqual(items[0]?.genres, ["12", "878"]);
});

test("fetchTVShows returns empty array when results is missing", async () => {
  global.fetch = (async () => mkResponse({}) ) as unknown as typeof fetch;
  const { fetchTVShows } = await import("../../services/api");

  const items = await fetchTVShows({ query: "", page: 1 });
  assert.deepEqual(items, []);
});

test("fetchMovieTrailerKey picks official YouTube trailer key", async () => {
  global.fetch = (async () =>
    mkResponse({
      results: [
        { key: "abc", site: "YouTube", type: "Teaser", official: false },
        { key: "best", site: "YouTube", type: "Trailer", official: true },
      ],
    }) ) as unknown as typeof fetch;

  const { fetchMovieTrailerKey } = await import("../../services/api");
  const key = await fetchMovieTrailerKey("123");

  assert.equal(key, "best");
});

test("fetchMovieWatchProviders defaults to empty object when results is missing", async () => {
  global.fetch = (async () => mkResponse({}) ) as unknown as typeof fetch;
  const { fetchMovieWatchProviders } = await import("../../services/api");

  const providers = await fetchMovieWatchProviders("123");
  assert.deepEqual(providers, {});
});

test("fetchMovies throws when upstream fails", async () => {
  global.fetch = (async () => mkResponse({}, false, "Bad Request") ) as unknown as typeof fetch;
  const { fetchMovies } = await import("../../services/api");

  await assert.rejects(() => fetchMovies({ query: "x", page: 1 }), /Failed to fetch movies/);
});

