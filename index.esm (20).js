import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApp(): FirebaseApp {
  if (getApps().length) return getApps()[0];
  const app = initializeApp(firebaseConfig);
  if (typeof window !== "undefined") {
    initializeFirestore(app, { experimentalForceLongPolling: true });
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getApp());
}

export const auth = typeof window !== "undefined" ? getFirebaseAuth() : ({} as Auth);
export const db = typeof window !== "undefined" ? getFirebaseDb() : ({} as Firestore);
export const storage = typeof window !== "undefined" ? getFirebaseStorage() : ({} as FirebaseStorage);
