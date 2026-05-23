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
 * Get access token
 */
export const getAccessToken = () => {
  return (
    localStorage.getItem(ACCESS_KEY) ||
    sessionStorage.getItem(ACCESS_KEY)
  );
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  return (
    localStorage.getItem(REFRESH_KEY) ||
    sessionStorage.getItem(REFRESH_KEY)
  );
};

/**
 * Detect auth mode
 */
export const getAuthMode = () => {
  return (
    localStorage.getItem(MODE_KEY) ||
    sessionStorage.getItem(MODE_KEY)
  );
};

/**
 * Active storage (for updates)
 */
export const getActiveStorage = () => {
  if (localStorage.getItem(ACCESS_KEY)) return localStorage;
  if (sessionStorage.getItem(ACCESS_KEY)) return sessionStorage;
  return null;
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