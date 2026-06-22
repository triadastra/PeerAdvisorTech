// ─────────────────────────────────────────────────────────────────────────
//  AUTH — a thin context over our own backend (server/) via ./api.
//  Exposes the signed-in account and the sign-in / sign-up / sign-out actions.
//  `user` and `profile` are the same account object: { id, email, name, role, vid }.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, ask the server who we are (valid session cookie?).
  useEffect(() => {
    let active = true;
    api
      .me()
      .then(({ user }) => {
        if (active) setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async ({ email, password, name }) => {
    const { user } = await api.register({ email, password, name });
    setUser(user);
    return user;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { user } = await api.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    loading,
    user,
    profile: user, // same account object — kept as a separate name for the UI
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
