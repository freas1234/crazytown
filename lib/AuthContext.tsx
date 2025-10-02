'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  role: string;
  avatar?: string;
  discordId?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return;
      
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser({
              id: session.user.id || '',
              email: session.user.email || '',
              username: session.user.username || session.user.name || '',
              role: session.user.role || 'user',
              avatar: session.user.image || undefined,
              discordId: session.user.discordId
            });
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
          setUser({
            id: session.user.id || '',
            email: session.user.email || '',
            username: session.user.username || session.user.name || '',
            role: session.user.role || 'user',
            avatar: session.user.image || undefined,
            discordId: session.user.discordId
          });
        }
      } else if (status === 'unauthenticated') {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    fetchUserData();
  }, [session, status]);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 