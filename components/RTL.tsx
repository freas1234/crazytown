'use client';

import { ReactNode } from 'react';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

interface RTLProps {
  children: ReactNode;
  className?: string;
  ltrClasses?: string;
  rtlClasses?: string;
  forceRTL?: boolean;
  forceLTR?: boolean;
}


export function RTL({
  children,
  className,
  ltrClasses = '',
  rtlClasses = '',
  forceRTL = false,
  forceLTR = false,
}: RTLProps) {
  const { isRTL, dir } = useI18n();
  
  const effectiveIsRTL = forceRTL || (isRTL && !forceLTR);
  const effectiveDir = effectiveIsRTL ? 'rtl' : 'ltr';
  
  return (
    <div 
      className={cn(
        effectiveIsRTL ? 'rtl' : 'ltr',
        effectiveIsRTL ? rtlClasses : ltrClasses,
        className
      )}
      dir={effectiveDir}
    >
      {children}
    </div>
  );
}

/**
 * A component that applies RTL-specific styling to inline elements
 */
export function RTLInline({
  children,
  className,
  ltrClasses = '',
  rtlClasses = '',
  forceRTL = false,
  forceLTR = false,
}: RTLProps) {
  const { isRTL, dir } = useI18n();
  
  const effectiveIsRTL = forceRTL || (isRTL && !forceLTR);
  const effectiveDir = effectiveIsRTL ? 'rtl' : 'ltr';
  
  return (
    <span 
      className={cn(
        effectiveIsRTL ? 'rtl' : 'ltr',
        effectiveIsRTL ? rtlClasses : ltrClasses,
        className
      )}
      dir={effectiveDir}
    >
      {children}
    </span>
  );
}

    
export function FlipInRTL({
  children,
  className,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { isRTL } = useI18n();
  
  return (
    <span 
      className={cn(
        isRTL && !disabled && 'flip-x',
        className
      )}
    >
      {children}
    </span>
  );
} 