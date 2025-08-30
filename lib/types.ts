// Shared content interface for bilingual support
export interface IContent {
  en: string;
  ar: string;
}

// User roles
export type UserRole = 'owner' | 'admin' | 'client';

// Rule page categories
export type RuleCategory = 'admin' | 'ems' | 'police' | 'general' | 'safe-zones';

// Form field types
export type FormFieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox';

// Form field interface
export interface IFormField {
  type: FormFieldType;
  label: IContent;
  required: boolean;
  options?: IContent[]; // For dropdown type
}

// Global mongoose types
declare global {
  var mongoose: {
    conn: any | null;
    promise: Promise<any> | null;
  };
} 