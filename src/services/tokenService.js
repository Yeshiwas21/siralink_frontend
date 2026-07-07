const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const MODE_KEY = "auth_mode";

/**
 * Store tokens based on remember flag
 * remember=true  → localStorage (persistent, multi-tab, restart safe)
 * remember=false → sessionStorage
 */
export const storeTokens = (access, refresh, remember) => {
  // clear old tokens first
  clearTokens();

  const storage = remember ? localStorage : sessionStorage;

  storage.setItem(ACCESS_KEY, access);
  storage.setItem(REFRESH_KEY, refresh);
  storage.setItem(MODE_KEY, remember ? "persistent" : "session");
};

/**
 * Returns the active storage based on auth mode (persistent or session).
 * Ensures consistent token access across the app.
 */

const getStorage = () => {
  const mode = getAuthMode();

  return mode === "persistent"
    ? localStorage
    : sessionStorage;
};
/**
 * Get access token
 */
export const getAccessToken = () => {
  return getStorage().getItem(ACCESS_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  return getStorage().getItem(REFRESH_KEY);
};

/**
 * Detect auth mode
 */
export const getAuthMode = () => {
  return localStorage.getItem(MODE_KEY);

};

/**
 * Active storage (for updates)
 */
export const getActiveStorage = () => {
  return getStorage();
};

/**
 * Update access token
 */
export const setAccessToken = (token) => {
  const storage = getActiveStorage();

  if (storage) {
    storage.setItem(ACCESS_KEY, token);
  }
};

/**
 * Update refresh token
 */
export const setRefreshToken = (token) => {
  const storage = getActiveStorage();

  if (storage) {
    storage.setItem(REFRESH_KEY, token);
  }
};

/**
 * Clear all auth data
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(MODE_KEY);

  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(MODE_KEY);
};