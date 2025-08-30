'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/AuthContext';
import { RoleGuard } from '../../components/RoleGuard';

const translations = {
  en: {
    title: "Profile",
    email: "Email",
    username: "Username",
    bio: "Bio",
    updateProfile: "Update Profile",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    save: "Save Changes",
    profileUpdated: "Profile updated successfully",
    passwordChanged: "Password changed successfully",
    accountSettings: "Account Settings",
    profileSettings: "Profile Settings",
    discordLinked: "Discord Account Linked",
    linkDiscord: "Link Discord Account",
    loading: "Loading...",
    discordUser: "Discord User (Account managed through Discord)",
    adminPanel: "Admin Panel",
    manageWebsite: "Manage Website",
    myOrders: "My Orders",
    viewOrders: "View Orders",
    orderHistory: "Order History",
    viewOrderHistory: "View your order history and track current orders"
  },
  ar: {
    title: "الملف الشخصي",
    email: "البريد الإلكتروني",
    username: "اسم المستخدم",
    bio: "نبذة عني",
    updateProfile: "تحديث الملف الشخصي",
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    save: "حفظ التغييرات",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    passwordChanged: "تم تغيير كلمة المرور بنجاح",
    accountSettings: "إعدادات الحساب",
    profileSettings: "إعدادات الملف الشخصي",
    discordLinked: "حساب Discord مرتبط",
    linkDiscord: "ربط حساب Discord",
    loading: "جاري التحميل...",
    discordUser: "مستخدم Discord (الحساب يدار من خلال Discord)",
    adminPanel: "لوحة الإدارة",
    manageWebsite: "إدارة الموقع",
    myOrders: "طلباتي",
    viewOrders: "عرض الطلبات",
    orderHistory: "سجل الطلبات",
    viewOrderHistory: "عرض سجل طلباتك وتتبع الطلبات الحالية"
  }
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams?.get('success');
  
  
  const { user, isLoading } = useAuth();
  
  const lang = "en";
  const validLang = ['en', 'ar'].includes(lang) ? lang : 'en';
  const t = translations[validLang as keyof typeof translations];
  
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatedUser, setUpdatedUser] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setUpdatedUser({
        username: user.username || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (success === 'profile') {
      setSuccessMessage(t.profileUpdated);
    } else if (success === 'password') {
      setSuccessMessage(t.passwordChanged);
    }
  }, [success, t]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          bio,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage(t.profileUpdated);
        setUpdatedUser({
          username,
          bio
        });
      } else {
        setErrorMessage(data.message || `Failed to update profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage('An error occurred while updating your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Get form data
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.get('currentPassword'),
          newPassword: formData.get('newPassword'),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage(t.passwordChanged);
        formElement.reset();
      } else {
        setErrorMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setErrorMessage('An error occurred while changing your password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['user', 'admin', 'owner']} redirectTo="/login">
      <div className="flex flex-col min-h-screen">
          <Header />
        
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 text-gray-400">{t.loading}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-md">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-4xl mb-4">
                        {user?.avatar ? (
                          <Image 
                            src={user.avatar} 
                            alt="Avatar" 
                            width={96} 
                            height={96} 
                            className="rounded-full"
                          />
                        ) : (
                          user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
                      <p className="text-gray-400 mb-2">{user?.email}</p>
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm capitalize">
                        {user?.role}
                      </div>
                      
                      {user?.discordId && (
                        <div className="mt-4 flex items-center text-sm text-blue-400">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2"/>
                          </svg>
                          {t.discordLinked}
                        </div>
                      )}
                      
                      <Link href="/profile/orders" className="mt-6 w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md flex items-center justify-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {t.myOrders}
                      </Link>
                      
                      {user?.role === 'admin' || user?.role === 'owner' ? (
                        <Link href="/admin" className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t.adminPanel}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-white mb-2">{t.orderHistory}</h3>
                    <p className="text-gray-400 text-sm mb-4">{t.viewOrderHistory}</p>
                    <Link href="/profile/orders">
                      <button className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors">
                        {t.viewOrders}
                      </button>
                    </Link>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  {successMessage && (
                    <div className="mb-6 bg-green-900/30 border border-green-500 text-green-400 px-4 py-3 rounded-md">
                      {successMessage}
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-md">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">{t.profileSettings}</h2>
                    
                    <form onSubmit={handleProfileUpdate}>
                      <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-400 mb-2">{t.username}</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={updatedUser.username}
                          onChange={(e) => setUpdatedUser({...updatedUser, username: e.target.value})}
                          className="w-full bg-[#0D0D0D] text-white border border-[#333] rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                          disabled={!!user?.discordId || isSubmitting}
                        />
                        {user?.discordId && (
                          <p className="text-sm text-gray-500 mt-1">{t.discordUser}</p>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bio" className="block text-gray-400 mb-2">{t.bio}</label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={updatedUser.bio}
                          onChange={(e) => setUpdatedUser({...updatedUser, bio: e.target.value})}
                          rows={4}
                          className="w-full bg-[#0D0D0D] text-white border border-[#333] rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                          disabled={isSubmitting}
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? t.loading : t.save}
                      </button>
                    </form>
                  </div>
                  
                  {!user?.discordId && (
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-md">
                      <h2 className="text-xl font-semibold text-white mb-4">{t.changePassword}</h2>
                      
                      <form onSubmit={handlePasswordChange}>
                        <div className="mb-4">
                          <label htmlFor="currentPassword" className="block text-gray-400 mb-2">{t.currentPassword}</label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            className="w-full bg-[#0D0D0D] text-white border border-[#333] rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="newPassword" className="block text-gray-400 mb-2">{t.newPassword}</label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            className="w-full bg-[#0D0D0D] text-white border border-[#333] rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="confirmPassword" className="block text-gray-400 mb-2">{t.confirmPassword}</label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full bg-[#0D0D0D] text-white border border-[#333] rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? t.loading : t.save}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </RoleGuard>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-10">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-4 text-gray-400">Loading...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
} 