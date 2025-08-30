'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../lib/AuthContext';
import { I18nProvider } from '../lib/i18n';
import { MaintenanceProvider } from '../lib/MaintenanceContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AuthProvider>
          <I18nProvider>
            <MaintenanceProvider>
              {children}
            </MaintenanceProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 