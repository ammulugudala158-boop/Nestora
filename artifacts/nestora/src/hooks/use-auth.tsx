import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGetMe, User } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isOwner: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nestora_token'));
  const [localUser, setLocalUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading: isQueryLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const activeUser = user || localUser;

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('nestora_token', newToken);
    setToken(newToken);
    setLocalUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('nestora_token');
    setToken(null);
    setLocalUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: activeUser || null,
        isLoading: !!token && isQueryLoading && !localUser,
        login,
        logout,
        isOwner: activeUser?.role === 'owner',
        isCustomer: activeUser?.role === 'customer',
        isAuthenticated: !!activeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
