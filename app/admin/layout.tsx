'use client';

import Link from 'next/link';
import { AdminProviders } from '../admin-providers';
import AdminSidebar from './AdminSidebar';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { cn } from '../../lib/utils';
import { Bell, Settings, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../lib/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRTL } = useTranslation();
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AdminProviders>
      <div className={`flex min-h-screen bg-gradient-to-br from-background to-background/95 relative ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="animated-bg opacity-20">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          
          
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-4000"></div>
          
      
          <div className="bg-cyber-grid absolute inset-0 z-0 opacity-5"></div>
          
          <div className="particles-container absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`particle-${i}`}
                className="particle absolute w-1 h-1 rounded-full bg-primary/50"
                style={{
                  top: `${i * 5}%`,
                  left: `${(i * 7) % 100}%`,
                  animationDelay: `${i * 0.25}s`,
                  animationDuration: `${3 + (i % 7)}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
     
        <div className="sticky top-0 h-screen flex-shrink-0">
          <AdminSidebar />
        </div>
      
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
         
          <header className="sticky top-0 z-20 bg-secondary/80 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative w-64">
                <Search className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input 
                  placeholder="Search..." 
                  className={`bg-gray-800/50 border-gray-700 pl-8 focus:border-primary/50 focus:ring-primary/20 ${isRTL ? 'pr-8 pl-3' : ''}`} 
                />
              </div>
            </div>
            
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-primary/10 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-primary/10">
                <Settings className="h-5 w-5" />
              </Button>
              
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 border border-primary/30">
                  <AvatarImage src="/placeholder-avatar.svg" alt="Admin" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                </div>
              </div>
            </div>
          </header>
          
       
          <main className="flex-1 overflow-auto relative">
            <div className="container px-6 py-6 max-w-7xl mx-auto">
              <div className="relative z-10" dir={isRTL ? "rtl" : "ltr"}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}