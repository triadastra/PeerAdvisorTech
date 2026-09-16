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
  const [oauth, setOauth] = useState(false);
  const [authError, setAuthError] = useState('');

  // On load, ask the server who we are (valid session cookie?).
  useEffect(() => {
    let active = true;
    (async () => {
      const config = await api.authConfig();
      if (active) setOauth(config.oauth);
      let result = await api.me();
      if (config.oauth) {
        if (!window.LaunchpadAuth) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/dashboard-api/oauth/sdk.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Unable to load Launchpad sign-in.'));
            document.head.appendChild(script);
          });
        }
        const state = await window.LaunchpadAuth.ready();
        if (!result.user && state.accessToken) {
          try { result = await api.launchpad(state.accessToken); }
          catch (error) { window.LaunchpadAuth.signOut(); throw error; }
        }
      }
      if (active) setUser(result.user);
    })().catch(error => { if (active) setAuthError(error.message); })
      .finally(() => { if (active) setLoading(false); });
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
      window.LaunchpadAuth?.signOut();
      sessionStorage.removeItem('lp_token');
      sessionStorage.removeItem('lp_user');
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    loading,
    oauth,
    authError,
    signInWithLaunchpad: async () => {
      if (!window.LaunchpadAuth) throw new Error('Reload the page to reconnect to Launchpad.');
      await window.LaunchpadAuth.signIn();
    },
    user,
    profile: user, // same account object — kept as a separate name for the UI
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
