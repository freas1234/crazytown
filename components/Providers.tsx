'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../lib/AuthContext';
import { I18nProvider } from '../lib/i18n';  
import { MaintenanceProvider } from '../lib/MaintenanceContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AuthProvider>
          <I18nProvider>
            <MaintenanceProvider>
              <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
              
              <div className="px-4 relative z-10">
                {children}
              </div>
            </MaintenanceProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
