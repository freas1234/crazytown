import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  id?: string;
  email: string;
  username?: string;
  password?: string;
  avatar?: string;
  bio?: string;
  role: 'owner' | 'admin' | 'client';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean; // Helper property
  discordId?: string;
}

// Model definition for use with our db utility
export const User = {
  collection: 'users',
  
  // Helper methods
  isAdmin(user: IUser): boolean {
    return user.role === 'admin' || user.role === 'owner';
  }
};

// Middleware to attach isAdmin property
export function attachAdminStatus(user: IUser): IUser {
  if (!user) return user;
  return {
    ...user,
    isAdmin: User.isAdmin(user)
  };
} 