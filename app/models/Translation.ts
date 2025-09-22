export interface Translation {
  id: string;
  key: string;
  language: string;
  value: string;
  namespace?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationNamespace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationKey {
  id: string;
  key: string;
  namespace?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
