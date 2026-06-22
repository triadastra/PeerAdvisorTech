// The auth context + hook live here (not in auth.jsx) so the provider file can
// export a component only — keeping React Fast Refresh happy.

import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
