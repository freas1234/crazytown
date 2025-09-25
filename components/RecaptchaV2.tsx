'use client';

import { useEffect, useRef, useState } from 'react';
import { isRecaptchaConfigured, getRecaptchaSiteKey } from '../lib/google-recaptcha';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      }) => number;
      reset: (widgetId: number) => void;
    };
  }
}

interface RecaptchaV2Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}


export default function RecaptchaV2({
  onVerify,
  onExpire,
  onError,
  className = ''
}: RecaptchaV2Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRecaptchaConfigured()) {
      console.warn('Google reCAPTCHA not configured');
      return;
    }

    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setIsLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      if (existingScript) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('reCAPTCHA script loaded successfully');
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google reCAPTCHA');
        onError?.();
      };
      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, [onError]);

  useEffect(() => {
    if (!isLoaded) return;

    // Set a timeout for loading
    const loadingTimeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);

    const readyTimeout = setTimeout(() => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          setLoadingTimeout(false);
        });
      } else {
        console.error('reCAPTCHA not available after loading');
        onError?.();
      }
    }, 1000);

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(readyTimeout);
    };
  }, [isLoaded, onError]);

  useEffect(() => {
    if (!isReady || !containerRef.current || widgetId !== null) return;

    try {
      console.log('Rendering reCAPTCHA with site key:', getRecaptchaSiteKey());
      const id = window.grecaptcha.render(containerRef.current, {
        sitekey: getRecaptchaSiteKey(),
        callback: (token: string) => {
          console.log('reCAPTCHA verified successfully');
          onVerify(token);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          onExpire?.();
        },
        'error-callback': () => {
          console.error('reCAPTCHA error');
          onError?.();
        }
      });
      console.log('reCAPTCHA rendered with ID:', id);
      setWidgetId(id);
    } catch (error) {
      console.error('reCAPTCHA render error:', error);
      onError?.();
    }
  }, [isReady, onVerify, onExpire, onError]);

  const resetRecaptcha = () => {
    if (widgetId !== null) {
      window.grecaptcha.reset(widgetId);
    }
  };

  // Expose reset method to parent component
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).reset = resetRecaptcha;
    }
  }, [widgetId]);

  if (!isRecaptchaConfigured()) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        reCAPTCHA not configured
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="recaptcha-container flex justify-center">
        {!isReady && (
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm py-4">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>
              {loadingTimeout 
                ? "reCAPTCHA is taking longer than expected. Please refresh the page if it doesn't load." 
                : "Loading security verification..."
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
