import {
  signInWithPopup
} from "firebase/auth";

import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
  appleProvider
} from "../firebase";

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const loginWithFacebook = () =>
  signInWithPopup(auth, facebookProvider);

export const loginWithGithub = () =>
  signInWithPopup(auth, githubProvider);

export const loginWithApple = () =>
  signInWithPopup(auth, appleProvider);