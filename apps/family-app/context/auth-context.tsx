import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SignedInUser = {
  name: string;
  phone: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  user: SignedInUser | null;
  signIn: (user: SignedInUser) => void;
  signOut: () => void;
};

const STORAGE_KEY = '@nelson_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as SignedInUser;
          setUser(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  const signIn = (nextUser: SignedInUser) => {
    setUser(nextUser);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const signOut = () => {
    setUser(null);
    void AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isReady,
      signIn,
      signOut,
      user,
    }),
    [user, isReady],
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
