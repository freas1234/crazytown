'use client';

import { useAuth } from '../AuthContext';

export function useUserRole() {
  const { user, isLoading, isAdmin } = useAuth();
  
  return {
    role: user?.role || 'guest',
    isAdmin,
    isOwner: user?.role === 'owner',
    isUser: user?.role === 'user',
    isGuest: !user,
    isLoading
  };
} 