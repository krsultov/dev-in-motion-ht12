import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  parentId: string;
  setParentId: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [parentId, setParentId] = useState<string>('demo-parent-id');
  const [token, setToken] = useState<string>('demo-jwt-token');

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      parentId,
      setParentId,
      token,
      setToken,
    }),
    [isAuthenticated, parentId, token],
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
