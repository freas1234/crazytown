import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import type { IUser } from '../app/models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_that_is_at_least_32_chars'
);
const TOKEN_EXPIRY = '7d';

export interface UserJwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  discordId?: string;
  [key: string]: unknown; 
}

export async function createToken(user: Partial<IUser>): Promise<string> {
  const payload: UserJwtPayload = {
    id: user.id!,
    email: user.email!,
    username: user.username || user.email!.split('@')[0],
    role: user.role || 'user',
    avatar: user.avatar,
    discordId: user.discordId
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserJwtPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<IUser | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: payload.id }
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'strict',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

export async function getCurrentUser(): Promise<IUser | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return await getUserFromToken(token);
}

export async function generateDiscordOAuthUrl(register: boolean = false, redirectTo: string = '/'): Promise<string> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`);
  const state = encodeURIComponent(JSON.stringify({ register, redirectTo }));
  const scope = encodeURIComponent('identify email');
  
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
}

export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
  return password === hashedPassword;
}

export async function hashPassword(password: string): Promise<string> {
  return password;
}   