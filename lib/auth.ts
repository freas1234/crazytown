import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { IUser } from '../app/models/User';
import type { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { db } from './db';

export interface UserPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  username?: string;
}

const JWT_AUTH_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export async function generateAuthToken(user: { _id: ObjectId | string; email: string; role: string; username?: string }) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    username: user.username
  };
  
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as number };
  return jwt.sign(payload, JWT_AUTH_SECRET, options); 
}

export function verifyAuthToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_AUTH_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getUserFromAuthToken(token: string) {
  try {
    const decoded = verifyAuthToken(token);
    
    if (!decoded) {
      return null;
    }
    
    const user = await db.user.findUnique({
      where: {
        id: decoded.userId
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function getAuthCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return getUserFromAuthToken(token);
} 