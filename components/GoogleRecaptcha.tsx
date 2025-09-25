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

interface GoogleRecaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  action?: string;
  threshold?: number;
  className?: string;
}


export default function GoogleRecaptcha({
  onVerify,
  onExpire,
  onError,
  action = 'submit',
  threshold = 0.5,
  className = ''
}: GoogleRecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
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

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${getRecaptchaSiteKey()}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
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

    window.grecaptcha.ready(() => {
      setIsReady(true);
    });
  }, [isLoaded]);

  const executeRecaptcha = async () => {
    if (!isReady || isExecuting) return;

    try {
      setIsExecuting(true);
      const token = await window.grecaptcha.execute(getRecaptchaSiteKey(), { action });
      onVerify(token);
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      onError?.();
    } finally {
      setIsExecuting(false);
    }
  };

  // Expose methods to parent component
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).execute = executeRecaptcha;
    }
  }, [isReady, isExecuting]);

  if (!isRecaptchaConfigured()) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        reCAPTCHA not configured
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="recaptcha-container">
        {isReady && (
          <button
            type="button"
            onClick={executeRecaptcha}
            disabled={isExecuting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
          >
            {isExecuting ? 'Verifying...' : 'Verify Security'}
          </button>
        )}
      </div>
      {!isReady && (
        <div className="text-center text-gray-500 text-sm mt-2">
          Loading security verification...
        </div>
      )}
    </div>
  );
}
