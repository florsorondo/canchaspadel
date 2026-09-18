import { auth } from "../firebase";

export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : null;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
  });
}
