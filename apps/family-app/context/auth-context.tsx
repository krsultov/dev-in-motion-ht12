import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type SignedInUser = {
  name: string;
  phone: string;
};

const AUTH_DISABLED_FOR_TESTING = true;
const TEST_USER: SignedInUser = {
  name: 'Test Mode Family',
  phone: '',
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: SignedInUser | null;
  signIn: (user: SignedInUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AUTH_DISABLED_FOR_TESTING);
  const [user, setUser] = useState<SignedInUser | null>(AUTH_DISABLED_FOR_TESTING ? TEST_USER : null);

  const signIn = (nextUser: SignedInUser) => {
    if (AUTH_DISABLED_FOR_TESTING) {
      console.log('[auth] signIn skipped because auth is disabled for testing', { nextUser });
      return;
    }

    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    if (AUTH_DISABLED_FOR_TESTING) {
      console.log('[auth] signOut skipped because auth is disabled for testing');
      return;
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      signIn,
      signOut,
      user,
    }),
    [isAuthenticated, user],
  );

  console.log('[auth] provider state', {
    authDisabledForTesting: AUTH_DISABLED_FOR_TESTING,
    isAuthenticated,
    user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
