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
    
    console.log('RoleGuard check:', {
      isLoading,
      user: user ? { role: user.role, id: user.id } : null,
      allowedRoles,
      hasAccess: user && allowedRoles.includes(user.role)
    });
  }, [user, isLoading, allowedRoles]);

  if (isLoading) {
    console.log('RoleGuard: Still loading user data');
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log('RoleGuard: Access denied', { user: user?.role, allowedRoles });
    if (redirectTo) {
      console.log('RoleGuard: Redirecting to', redirectTo);
      router.push(redirectTo);
      return null;
    }
    
    return <>{fallback}</>;
  }
  
  console.log('RoleGuard: Access granted for', user.role);
  return <>{children}</>;
} 