'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles = ['admin', 'owner'],
  fallback = null,
  redirectTo
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user doesn't have access
    if (!isLoading && (!user || !allowedRoles.includes(user.role)) && redirectTo) {
      router.push(redirectTo);
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
} 