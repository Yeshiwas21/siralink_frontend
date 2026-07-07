import { loginUser, logoutUser, getMe } from "../api/userApi";
import {
  storeTokens,
  getRefreshToken,
  clearTokens,
} from "./tokenService";

/**
 * Login user and store tokens
 */
export const loginApi = async (data) => {

  if (!data.turnstile_token) {
    throw new Error("Captcha not completed");
  }

  const res = await loginUser(data);

  const { access, refresh } = res.data;

  // Save tokens (localStorage or sessionStorage)
  storeTokens(access, refresh, data.remember);
  console.log("REMEMBER FLAG:", data.remember);

  return res.data;
};

/**
 * Logout user (invalidate refresh token on backend if possible)
 */
export const logoutApi = async () => {
  const refresh = getRefreshToken();

  try {
    if (refresh) {
      await logoutUser(refresh);
    }
  } catch {
    console.log("Logout API failed (ignored)");
  } finally {
    // Always clear tokens locally
    clearTokens();
  }
};

/**
 * Fetch currently authenticated user
 */
export const getMeApi = async () => {
  // Token is automatically attached via axios interceptor
  const res = await getMe();
  return res.data;
};