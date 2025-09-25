'use client';

import { useEffect, useRef, useState } from 'react';
import { isRecaptchaConfigured, getRecaptchaSiteKey } from '../lib/google-recaptcha';

interface SimpleRecaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  action?: string;
  className?: string;
}

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

export default function SimpleRecaptcha({
  onVerify,
  onError,
  action = 'submit',
  className = ''
}: SimpleRecaptchaProps) {
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

  useEffect(() => {
    if (isReady && !isExecuting) {
      executeRecaptcha();
    }
  }, [isReady]);

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
    return null; // Don't show anything if not configured
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="recaptcha-container">
        {/* This component is invisible - reCAPTCHA v3 runs automatically */}
      </div>
    </div>
  );
}
