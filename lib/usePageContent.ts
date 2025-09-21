'use client';

import { useState, useEffect } from 'react';
import { useI18n } from './i18n';

/**
 * Custom hook to fetch and manage multilingual content for pages
 * @param contentType The type of content to fetch (e.g., 'hero', 'featuredCards', 'contact', 'login', 'register')
 * @returns Object containing content, loading state, error state, and localized content
 */
export function usePageContent(contentType: string) {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { locale } = useI18n();
  
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/content?type=${contentType}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${contentType} content`);
        }
        
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        console.error(`Error fetching ${contentType} content:`, err);
        setError(`Failed to load ${contentType} content`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [contentType]);
  
  const localizedContent = content?.[locale] || null;
  
  return {
    content,
    localizedContent,
    isLoading,
    error
  };
} 