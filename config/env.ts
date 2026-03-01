import { z } from "zod";

const envSchema = z.object({
    EXPO_PUBLIC_FIREBASE_API_KEY: z.string(),
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
    EXPO_PUBLIC_FIREBASE_APP_ID: z.string(),
    EXPO_PUBLIC_MOVIE_API_KEY: z.string(),
    EXPO_PUBLIC_MOVIE_ACCESS_TOKEN: z.string(),
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().optional(),
});

const _env = envSchema.safeParse({
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_MOVIE_API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    EXPO_PUBLIC_MOVIE_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MOVIE_ACCESS_TOKEN,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const ENV = _env.data;
