import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to handle RTL-aware class names
 * @param ltrClasses - Classes to apply in LTR mode
 * @param rtlClasses - Classes to apply in RTL mode
 * @param isRTL - Boolean indicating if the current direction is RTL
 * @returns The appropriate classes based on the direction
 */
export function directionAwareClasses(ltrClasses: ClassValue, rtlClasses: ClassValue, isRTL: boolean) {
  return isRTL ? rtlClasses : ltrClasses
}

/**
 * Utility function to handle RTL-aware margins and paddings
 * @param value - The CSS property value (e.g., 'mr-2 ml-4')
 * @param isRTL - Boolean indicating if the current direction is RTL
 * @returns The flipped value for RTL mode
 */
export function rtlFlip(value: string, isRTL: boolean): string {
  if (!isRTL) return value
  
  return value
    .replace(/\bm[lr]-/g, (match) => match === 'ml-' ? 'mr-' : 'ml-')
    .replace(/\bp[lr]-/g, (match) => match === 'pl-' ? 'pr-' : 'pl-')
    .replace(/\b(left|right)\b/g, (match) => match === 'left' ? 'right' : 'left')
    .replace(/\b(start|end)\b/g, (match) => match === 'start' ? 'end' : 'start')
}
