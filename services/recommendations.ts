import { ENV } from "@/config/env";
import { ContentItem, fetchMovies, fetchTVShows } from "@/services/api";

export type AIRecommendation = {
  title: string;
  mediaType: "movie" | "tv" | "any";
  reason: string;
};

export type RecommendedContentItem = ContentItem & {
  reason: string;
};

type RecommendationPayload = {
  favorites: string[];
  recentSearches?: string[];
  country?: string;
};

const normalizeMediaType = (value: unknown): "movie" | "tv" | "any" => {
  if (value === "movie" || value === "tv" || value === "any") return value;
  return "any";
};

const asRecommendations = (value: unknown): AIRecommendation[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      if (!title) return null;
      return {
        title,
        mediaType: normalizeMediaType(record.mediaType),
        reason: typeof record.reason === "string" ? record.reason : "Recommended for you.",
      } as AIRecommendation;
    })
    .filter((item): item is AIRecommendation => Boolean(item));
};

const extractOutputText = (data: any): string => {
  if (typeof data?.output_text === "string" && data.output_text.trim().length > 0) {
    return data.output_text;
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = output.flatMap((entry: any) => {
    const content = Array.isArray(entry?.content) ? entry.content : [];
    return content
      .map((part: any) => {
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.value === "string") return part.value;
        return "";
      })
      .filter(Boolean);
  });

  return chunks.join("\n");
};

export const fetchAIRecommendations = async (
  payload: RecommendationPayload
): Promise<AIRecommendation[]> => {
  const endpoint = ENV.EXPO_PUBLIC_RECOMMENDER_ENDPOINT;
  const enableClientDemoMode = ENV.EXPO_PUBLIC_ENABLE_CLIENT_AI_DEMO === "true";
  const clientDemoApiKey = ENV.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!endpoint) {
    if (!enableClientDemoMode || !clientDemoApiKey) return [];

    // Demo-only fallback for readme.md screenshots.
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clientDemoApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Return strict JSON only: { recommendations: [{ title, mediaType, reason }] }. " +
              "mediaType must be movie, tv, or any. Keep reasons short.",
          },
          {
            role: "user",
            content: JSON.stringify({
              favorites: payload.favorites ?? [],
              recentSearches: payload.recentSearches ?? [],
              country: payload.country ?? "US",
              count: 8,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Client demo AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    const jsonStart = outputText.indexOf("{");
    const jsonEnd = outputText.lastIndexOf("}");
    const jsonString =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? outputText.slice(jsonStart, jsonEnd + 1)
        : "{\"recommendations\":[]}";

    let parsed: { recommendations?: unknown } = { recommendations: [] };
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      parsed = { recommendations: [] };
    }

    return asRecommendations(parsed.recommendations).slice(0, 10);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch AI recommendations: ${response.statusText}`);
  }

  const data: { recommendations?: unknown } = await response.json();
  return asRecommendations(data?.recommendations).slice(0, 10);
};

const firstOrNull = <T>(value: T[]): T | null => (Array.isArray(value) && value.length ? value[0] : null);

export const fetchRecommendedContent = async (
  payload: RecommendationPayload
): Promise<RecommendedContentItem[]> => {
  const recommendations = await fetchAIRecommendations(payload);
  if (!recommendations.length) return [];

  const enriched = await Promise.all(
    recommendations.map(async (recommendation) => {
      try {
        const findMovie = async () => firstOrNull(await fetchMovies({ query: recommendation.title, page: 1 }));
        const findTV = async () => firstOrNull(await fetchTVShows({ query: recommendation.title, page: 1 }));

        let picked: ContentItem | null = null;
        if (recommendation.mediaType === "movie") {
          picked = await findMovie();
        } else if (recommendation.mediaType === "tv") {
          picked = await findTV();
        } else {
          const [movie, tv] = await Promise.all([findMovie(), findTV()]);
          picked = (movie?.vote_average ?? 0) >= (tv?.vote_average ?? 0) ? movie : tv;
        }

        if (!picked) return null;
        return { ...picked, reason: recommendation.reason } as RecommendedContentItem;
      } catch (error) {
        console.error("Recommendation enrichment failed:", error);
        return null;
      }
    })
  );

  return enriched.filter((item): item is RecommendedContentItem => Boolean(item));
};
