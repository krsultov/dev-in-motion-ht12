import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type SignedInUser = {
  name: string;
  phone: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<SignedInUser | null>(null);

  const signIn = (nextUser: SignedInUser) => {
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const signOut = () => {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
