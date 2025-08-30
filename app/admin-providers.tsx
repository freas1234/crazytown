'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AuthProvider } from '../lib/AuthContext';
import { MaintenanceProvider } from '../lib/MaintenanceContext';
import { LanguageProvider } from '../lib/LanguageContext';
import { RTL } from '../components/RTL';

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <LanguageProvider>
          <RTL>
            <MaintenanceProvider>
              {children}
            </MaintenanceProvider>
          </RTL>
        </LanguageProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 