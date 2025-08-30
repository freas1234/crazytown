'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export function useCheckRole(
  allowedRoles: string[] = ['user', 'admin', 'owner'],
  redirectTo: string = '/login'
) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }
      
      if (user && !allowedRoles.includes(user.role)) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router]);
  
  return { user, isLoading, isAuthenticated };
} 