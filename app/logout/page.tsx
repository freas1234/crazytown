'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      try {
        // Call logout API
        await fetch('/api/auth/logout');
        
        // Redirect to home page
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error('Error logging out:', error);
        // Still redirect to home page if there's an error
        router.push('/');
      }
    }

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-indigo-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Logging out...</h1>
        <p className="text-gray-400">Please wait while we sign you out.</p>
      </div>
    </div>
  );
} 