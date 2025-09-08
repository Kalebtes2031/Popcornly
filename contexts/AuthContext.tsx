// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { UserProfile } from "@/types/user";

WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: () => {},
  setUser: () => {},
  isLogged: false,
  setIsLogged: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "872883456440-4olp54pfigfj01f5u9umb0rqgpieldmo.apps.googleusercontent.com",
    webClientId: "872883456440-is2nn752e9m0kj12j7gfs722sau8abbk.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({ scheme: "movieapp" }),
  });

  // Handle Google sign-in result
  useEffect(() => {
    const signInWithGoogleFirebase = async (idToken: string, accessToken: string) => {
      try {
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        const result = await signInWithCredential(auth, credential);

        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const newUser: UserProfile = {
            uid: result.user.uid,
            email: result.user.email || "",
            username: result.user.displayName || "",
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
        setIsLogged(true);
      } catch (err) {
        console.error("Google sign-in error:", err);
      }
    };

    if (response?.type === "success" && response.authentication) {
      const { idToken, accessToken } = response.authentication;
      if (idToken && accessToken) {

        void signInWithGoogleFirebase(idToken, accessToken);
      } else {
        console.error("Missing tokens from Google Auth Session");
      }
    }
  }, [response]);

  // Watch Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            username: firebaseUser.displayName || "",
            createdAt: new Date().toISOString(),
          });
        }
        setIsLogged(true);
      } else {
        setUser(null);
        setIsLogged(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsLogged(false);
  };

  const signInWithGoogle = () => {
    if (request) promptAsync();
    else console.warn("Google Auth Request not ready yet");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithGoogle, setUser, isLogged, setIsLogged }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
