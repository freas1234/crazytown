'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../lib/hooks/useTranslation';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback = null,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownToast) {
      toast.error(t('auth.login_required', 'You need to be logged in to access this page') + ' / ' + 
                 'يجب أن تكون مسجل الدخول للوصول إلى هذه الصفحة');
      setHasShownToast(true);
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo, t, hasShownToast]);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}