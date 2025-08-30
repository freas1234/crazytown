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
      
      console.log('AuthContext: Session status changed to', status);
      console.log('AuthContext: Session data:', session);
      
      if (status === 'authenticated' && session?.user) {
        console.log('AuthContext: User is authenticated, session user:', session.user);
        try {
          console.log('AuthContext: Fetching user data from /api/auth/me');
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          console.log('AuthContext: /api/auth/me response:', data);
          
          if (data.success && data.user) {
            console.log('AuthContext: Setting user from API response:', data.user);
            setUser(data.user);
          } else {
            console.log('AuthContext: API response unsuccessful, using session data');
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
          console.log('AuthContext: Using session data due to error');
          setUser({
            id: session.user.id || '',
            email: session.user.email || '',
            username: session.user.username || session.user.name || '',
            role: session.user.role || 'user',
            avatar: session.user.image || undefined,
            discordId: session.user.discordId
          });
        }
      } else {
        console.log('AuthContext: User not authenticated, setting user to null');
        setUser(null);
      }
      
      setIsLoading(false);
    };

    fetchUserData();
  }, [session, status]);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isAuthenticated = !!user;
  
  console.log('AuthContext: Current user state:', { 
    user, 
    role: user?.role,
    isAdmin,
    isAuthenticated,
    isLoading
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 