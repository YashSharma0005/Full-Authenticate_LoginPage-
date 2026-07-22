import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC98a1Kf2yQ9-o8rtBynQJOPJpgDTVtl0o",
  authDomain: "gobus-2e8e8.firebaseapp.com",
  projectId: "gobus-2e8e8",
  storageBucket: "gobus-2e8e8.firebasestorage.app",
  messagingSenderId: "208661566943",
  appId: "1:208661566943:web:ee0d659d468f7fb9a8606a",
  measurementId: "G-ELXDGCN8HR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

export const facebookProvider =
  new FacebookAuthProvider();

export const githubProvider =
  new GithubAuthProvider();

export const appleProvider =
  new OAuthProvider("apple.com");