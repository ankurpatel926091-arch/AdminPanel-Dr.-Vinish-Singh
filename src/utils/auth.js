// Simple localStorage-based auth utilities
// No React context needed — just plain functions

const TOKEN_KEY = 'dr_vinish_admin_token';
const USER_KEY  = 'dr_vinish_admin_user';

/** Get JWT token from localStorage */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Get stored user object from localStorage */
export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Check if user is logged in (token exists) */
export const isLoggedIn = () => Boolean(getToken());

/** Save token + user to localStorage after successful login */
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Clear all auth data from localStorage (logout) */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
