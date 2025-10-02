'use client';

import { ReactNode } from 'react';
import { MaintenanceProvider } from '../lib/MaintenanceContext';
import { LanguageProvider } from '../lib/LanguageContext';
import { RTL } from '../components/RTL';

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <RTL>
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </RTL>
    </LanguageProvider>
  );
} 