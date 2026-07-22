import {
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "../firebase";

export const sendResetLink =
  async (email) => {
    await sendPasswordResetEmail(
      auth,
      email
    );
  };