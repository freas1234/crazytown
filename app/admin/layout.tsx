'use client';

import { AdminProviders } from '../admin-providers';
import AdminSidebar from './AdminSidebar';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRTL } = useTranslation();
  const { user } = useAuth();
  
  return (
    <AdminProviders>
      <div className={cn(
        "flex min-h-screen bg-gray-900",
        isRTL ? 'flex-row-reverse' : ''
      )}>
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-900">
            <div className="p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}