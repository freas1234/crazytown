'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../lib/hooks/useTranslation';
import { UserRoleIndicator } from './UserRoleIndicator';
import LanguageSwitcher from './LanguageSwitcher';
import MaintenanceModeIndicator from './MaintenanceModeIndicator';
import { useMaintenanceMode } from '../lib/MaintenanceContext';
import { User, Settings, LogOut, Mail, Home, ShoppingBag, FileText, Briefcase, Info, MessageSquare, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  image?: string;
  discordId?: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser, isLoading } = useAuth();
  const { locale, isRTL, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { isMaintenanceMode } = useMaintenanceMode();

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handleClickOutside = (event: MouseEvent) => {
      const userMenuContainer = document.getElementById('user-menu-container');
      
      if (userMenuContainer && !userMenuContainer.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentUser && !isLoading) {
      fetchUnreadMessagesCount();
    }
  }, [currentUser, isLoading]);

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await fetch('/api/user/messages?countOnly=true');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: t('navigation.home', 'Home'), href: "/", icon: <Home size={16} /> },
    { name: t('navigation.store', 'Store'), href: "/store", icon: <ShoppingBag size={16} /> },
    { name: t('navigation.rules', 'Rules'), href: "/rules", icon: <FileText size={16} /> },
    { name: t('navigation.about', 'About'), href: "/about", icon: <Info size={16} /> },
    { name: t('navigation.contact', 'Contact'), href: "/contact", icon: <MessageSquare size={16} /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isMaintenanceMode ? 'bg-background/90 backdrop-blur-md shadow-lg' : isLoading ? 'bg-transparent' : 'bg-background/90 backdrop-blur-md shadow-lg'
      }`}
    >
      {isMaintenanceMode && <MaintenanceModeIndicator />}
      
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="relative group">
              <span className="absolute -inset-2 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              <div className="relative flex items-center">
                <span className="text-primary font-display text-2xl font-bold animate-text-flicker">
                  <span className="text-primary">
                    {t('common.site_name_first', locale === 'en' ? 'WEXON' : 'ويكسون')}
                  </span>
                </span>
                <span className="text-white font-display text-2xl font-bold">
                  &nbsp;{t('common.site_name_second', locale === 'en' ? 'STORE' : 'متجر')}
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navItems.map((item, index) => {
              const isActive = currentPath === item.href;
              return (
                <Link 
                  key={`nav-item-${index}`}
                  href={item.href} 
                  className={`relative group py-2 ${isActive ? 'text-primary' : 'text-white'}`}
                >
                  <span className="relative z-10 group-hover:text-primary transition-colors duration-300">{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-full h-0.5 bg-primary"></span>
                  )}
                  <span className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher variant="minimal" />
            
            {!isLoading && currentUser && (
              <Link href="/inbox" className="relative group hidden sm:flex items-center">
                <div className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                  <Mail className="h-5 w-5 text-white group-hover:text-primary transition-colors" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-5 h-5 bg-primary text-xs text-white rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </Link>
            )}
            
            {!isLoading && !currentUser ? (
              <Link href="/login" className="relative group">
                <span className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-300"></span>
                <button className="relative px-4 py-2 bg-secondary rounded-lg border border-primary text-primary font-bold group-hover:text-white transition-colors">
                  {t('login', 'Login')}
                </button>
              </Link>
            ) : isLoading ? (
              <div className="w-24 h-10 bg-secondary/50 rounded-lg animate-pulse"></div>
            ) : (
              <div className="relative group" id="user-menu-container">
                <button 
                  className="flex items-center space-x-2 rtl:space-x-reverse text-white hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {currentUser?.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                      {currentUser?.username?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{currentUser?.username || currentUser?.email?.split('@')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 game-card overflow-hidden origin-top-right transition-all duration-300 transform ${
                    userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`} 
                  id="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-800 bg-primary/5">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {currentUser?.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border border-primary/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                          {currentUser?.username?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {currentUser?.username || currentUser?.email?.split('@')[0]}
                        </span>
                    <UserRoleIndicator />
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                  {currentUser?.role === 'admin' || currentUser?.role === 'owner' ? (
                      <Link href="/admin" className={`flex items-center px-4 py-2 text-white hover:text-primary hover:bg-primary/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Settings className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      {t('dashboard', 'Dashboard')}
                    </Link>
                  ) : null}
                    
                    <Link href="/profile" className={`flex items-center px-4 py-2 text-white hover:text-primary hover:bg-primary/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <User className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {t('profile', 'Profile')}
                  </Link>
                    
                    <Link href="/inbox" className={`flex items-center px-4 py-2 text-white hover:text-primary hover:bg-primary/10 transition-colors sm:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {t('inbox', 'Inbox')}
                    {unreadCount > 0 && (
                        <span className={`${isRTL ? 'mr-2' : 'ml-2'} px-1.5 py-0.5 bg-primary text-xs text-white rounded-full`}>{unreadCount}</span>
                    )}
                  </Link>
                    
                    <Link href="/profile/orders" className={`flex items-center px-4 py-2 text-white hover:text-primary hover:bg-primary/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <ShoppingBag className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      {t('orders', 'My Orders')}
                    </Link>
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-800 bg-gray-800/30">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-400">{t('language', 'Language')}</span>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <LanguageSwitcher variant="minimal" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1 border-t border-gray-800">
                  <button 
                    onClick={handleLogout}
                      className={`w-full flex items-center px-4 py-2 text-white hover:text-primary hover:bg-primary/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                      <LogOut className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {t('logout', 'Logout')}
                  </button>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className="md:hidden text-white hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10 relative z-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-4 right-4 mt-2 py-4 bg-secondary/95 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl`}>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item, index) => {
            const isActive = currentPath === item.href;
            return (
              <Link 
                key={`mobile-nav-${index}`}
                href={item.href} 
                className={`flex items-center px-4 py-2 ${isRTL ? 'flex-row-reverse' : ''} ${
                  isActive ? 'text-primary bg-primary/10' : 'text-white hover:bg-primary/10 hover:text-primary'
                } transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={isRTL ? 'ml-3' : 'mr-3'}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
          
          {!currentUser && (
            <Link 
              href="/login" 
              className={`flex items-center px-4 py-2 text-white hover:bg-primary/10 hover:text-primary transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('login', 'Login')}
            </Link>
          )}
          
          {!currentUser && (
            <Link 
              href="/register" 
              className={`flex items-center px-4 py-2 text-primary hover:bg-primary/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('register', 'Register')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
} 