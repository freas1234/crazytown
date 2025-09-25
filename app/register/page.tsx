'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { signIn } from 'next-auth/react';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { usePageContent } from '../../lib/usePageContent';
import RecaptchaV2 from '../../components/RecaptchaV2';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;
  
  const { locale } = useTranslation();
  const { localizedContent, isLoading } = usePageContent('register');
  
  const t = localizedContent;
  
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');

  useEffect(() => {
    if (error === 'PasswordMismatch') {
      setErrorMessage(t?.errorMessages?.passwordsMustMatch || 'Passwords do not match');
    } else if (error === 'EmailExists') {
      setErrorMessage(t?.errorMessages?.emailTaken || 'Email already in use');
    } else if (error === 'UsernameExists') {
      setErrorMessage(t?.errorMessages?.usernameTaken || 'Username already in use');
    } else if (error === 'ServerError') {
      setErrorMessage(t?.errorMessages?.serverError || 'Server error, please try again later');
    } else if (error === 'DiscordAuthFailed' || error === 'OAuthSignin' || error === 'OAuthCallback') {
      setErrorMessage('Discord authentication failed');
    } else if (error === 'Configuration') {
      setErrorMessage('Discord login is not configured. Please set up the required environment variables.');
    }
  }, [error, t]);

  // Validate passwords before submitting
  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t?.errorMessages?.passwordsMustMatch || 'Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 10) {
      setErrorMessage(t?.errorMessages?.password_min_length || 'Password must be at least 10 characters');
      return false;
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSymbols = /[@$!%*?&]/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols) {
      setErrorMessage(t?.errorMessages?.password_requirements || 'Password must contain uppercase, lowercase, numbers, and symbols');
      return false;
    }
    
    // Check similarity to email
    const emailPart = formData.email.split('@')[0].toLowerCase();
    if (formData.password.toLowerCase().includes(emailPart) && emailPart.length > 3) {
      setErrorMessage(t?.errorMessages?.password_similar_email || 'Password cannot be similar to your email');
      return false;
    }
    
    // Check for repeated characters
    if (/(.)\1{2,}/.test(formData.password)) {
      setErrorMessage(t?.errorMessages?.password_repeated_chars || 'Password cannot contain more than 2 consecutive identical characters');
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA verification failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setRecaptchaError('');

    try {
      // First verify reCAPTCHA
      const captchaResponse = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptchaToken }),
      });

      const captchaResult = await captchaResponse.json();

      if (!captchaResult.success) {
        setRecaptchaError(captchaResult.message || 'reCAPTCHA verification failed');
        setRecaptchaToken('');
        return;
      }

      // Then proceed with registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
          formStartTime: Date.now()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        setErrorMessage(result.message || t?.errorMessages?.serverError || 'Registration failed. Please try again.');
        // Reset reCAPTCHA on error
        setRecaptchaToken('');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(t?.errorMessages?.serverError || 'Server error. Please try again later.');
      setRecaptchaToken('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscordRegister = () => {
    setIsDiscordLoading(true);
    // Ensure we use port 8080 for the callback URL
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080' 
      : window.location.origin;
    
    signIn('discord', { 
      callbackUrl: baseUrl,
      redirect: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="loading-spinner"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 parallax-bg">
        <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
        <div className="absolute top-20 left-1/4 w-1 h-20 bg-primary/20 skew-y-12 parallax-element" data-speed="0.03"></div>
        <div className="absolute bottom-20 right-1/4 w-1 h-20 bg-primary/20 -skew-y-12 parallax-element" data-speed="0.02"></div>
        
        <div className="w-full max-w-md relative z-10 p-6 bg-secondary/80 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-display font-bold text-primary mb-6 text-center cyberpunk-border">{t?.title || "Register"}</h1>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 text-sm">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t?.emailLabel || "Email"}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">{t?.usernameLabel || "Username"}</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">{t?.passwordLabel || "Password"}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
                <div className="mt-2 text-xs text-gray-400">
                  <p className="mb-1">{t?.password_requirements || "Password requirements:"}</p>
                  <ul className="space-y-1 text-xs">
                    <li className={formData.password.length >= 10 ? "text-green-400" : "text-gray-500"}>
                      • {t?.password_min_length || "At least 10 characters"}
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-400" : "text-gray-500"}>
                      • {locale === 'ar' ? "حرف كبير واحد على الأقل" : "One uppercase letter"}
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? "text-green-400" : "text-gray-500"}>
                      • {locale === 'ar' ? "حرف صغير واحد على الأقل" : "One lowercase letter"}
                    </li>
                    <li className={/\d/.test(formData.password) ? "text-green-400" : "text-gray-500"}>
                      • {locale === 'ar' ? "رقم واحد على الأقل" : "One number"}
                    </li>
                    <li className={/[@$!%*?&]/.test(formData.password) ? "text-green-400" : "text-gray-500"}>
                      • {locale === 'ar' ? "رمز واحد على الأقل (@$!%*?&)" : "One symbol (@$!%*?&)"}
                    </li>
                    <li className={!/(.)\1{2,}/.test(formData.password) ? "text-green-400" : "text-gray-500"}>
                      • {locale === 'ar' ? "لا توجد أحرف متكررة أكثر من مرتين" : "No more than 2 consecutive identical characters"}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">{t?.confirmPasswordLabel || "Confirm Password"}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
            
            <RecaptchaV2
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
              onError={handleRecaptchaError}
              className="my-4"
            />
            
            {recaptchaError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 text-sm">
                {recaptchaError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !recaptchaToken}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-white font-medium rounded-md shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : (t?.registerButton || 'Register')}
            </button>
          </form>
          
          <div className="my-6 flex items-center justify-center">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>
          
          <button 
            onClick={handleDiscordRegister}
            disabled={isDiscordLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-md shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 127.14 96.36" fill="#FFFFFF">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            <span>{isDiscordLoading ? (locale === 'ar' ? 'جاري الاتصال...' : 'Connecting...') : 'Continue with Discord'}</span>
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <span>{t?.haveAccount || "Already have an account?"} </span>
            <Link href="/login" className="text-primary hover:text-primary/80 hover:underline transition-colors">
              {t?.loginLink || "Login"}
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading...</span>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
} 