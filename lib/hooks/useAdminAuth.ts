'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export function useAdminAuth() {
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      console.log('Not an admin, redirecting to home');
      router.replace('/');
    }
  }, [isLoading, isAdmin, router]);

  return { user, isLoading, isAdmin };
}

// For backwards compatibility
export default useAdminAuth; 