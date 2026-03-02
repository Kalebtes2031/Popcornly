const { onRequest } = require("firebase-functions/v2/https");

exports.recommendations = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const openAiApiKey = process.env.OPENAI_API_KEY;
      if (!openAiApiKey) {
        res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
        return;
      }

      const body = req.body || {};
      const favorites = Array.isArray(body.favorites)
        ? body.favorites.filter((item) => typeof item === "string").slice(0, 20)
        : [];
      const recentSearches = Array.isArray(body.recentSearches)
        ? body.recentSearches.filter((item) => typeof item === "string").slice(0, 15)
        : [];
      const country = typeof body.country === "string" ? body.country : "US";

      const systemPrompt =
        "You are a movie/TV recommendation engine. Return strict JSON only. " +
        "Recommend diverse but relevant titles. Avoid unsafe content. " +
        "Each recommendation must have: title, mediaType(movie|tv|any), reason.";

      const userPrompt = {
        favorites,
        recentSearches,
        country,
        instructions:
          "Return exactly 8 recommendations as JSON object: { recommendations: [{ title, mediaType, reason }] }",
      };

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(userPrompt) },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        res.status(500).json({ error: `OpenAI request failed: ${text}` });
        return;
      }

      const data = await response.json();
      const outputText = typeof data?.output_text === "string" ? data.output_text : "";

      const jsonStart = outputText.indexOf("{");
      const jsonEnd = outputText.lastIndexOf("}");
      const jsonString =
        jsonStart >= 0 && jsonEnd > jsonStart
          ? outputText.slice(jsonStart, jsonEnd + 1)
          : "{\"recommendations\":[]}";

      let parsed = { recommendations: [] };
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        parsed = { recommendations: [] };
      }

      const recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const title = typeof item.title === "string" ? item.title.trim() : "";
              const mediaType =
                item.mediaType === "movie" || item.mediaType === "tv" || item.mediaType === "any"
                  ? item.mediaType
                  : "any";
              const reason = typeof item.reason === "string" ? item.reason : "Recommended for you.";
              if (!title) return null;
              return { title, mediaType, reason };
            })
            .filter(Boolean)
            .slice(0, 8)
        : [];

      res.status(200).json({ recommendations });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);
