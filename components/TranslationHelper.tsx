'use client';

import { useState } from 'react';
import { useTranslation } from '../lib/hooks/useTranslation';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface TranslationHelperProps {
  onTranslated: (translatedText: string) => void;
}

export default function TranslationHelper({ onTranslated }: TranslationHelperProps) {
  const { locale, languages } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would call an actual translation API
      // For now, we'll just simulate a translation with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple mock translation (in a real app, use a translation API)
      const mockTranslation = locale === 'en' 
        ? `ترجمة: ${inputText}` // Mock Arabic translation
        : `Translation: ${inputText}`; // Mock English translation
      
      setOutputText(mockTranslation);
    } catch (error) {
      console.error('Translation error:', error);
      setOutputText('Error translating text');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (outputText) {
      onTranslated(outputText);
    }
  };

  const targetLang = locale === 'en' ? 'ar' : 'en';
  const sourceLangName = languages[locale].name;
  const targetLangName = languages[targetLang].name;

  return (
    <Card className="border border-gray-700 bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-lg">
          Translation Helper ({sourceLangName} → {targetLangName})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {locale === 'en' ? 'Enter text in English' : 'أدخل النص بالعربية'}
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={locale === 'en' ? 'Enter text to translate...' : 'أدخل النص للترجمة...'}
            className="min-h-[100px]"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="bg-primary hover:bg-primary/80"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'en' ? 'Translating...' : 'جاري الترجمة...'}
              </>
            ) : (
              <>{locale === 'en' ? 'Translate' : 'ترجم'}</>
            )}
          </Button>
        </div>
        
        {outputText && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {locale === 'en' ? 'Translation to Arabic' : 'الترجمة إلى الإنجليزية'}
            </label>
            <Textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              className="min-h-[100px]"
              dir={locale === 'en' ? 'rtl' : 'ltr'}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleApply}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/20"
              >
                {locale === 'en' ? 'Apply Translation' : 'تطبيق الترجمة'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
