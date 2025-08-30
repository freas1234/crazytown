import { NextResponse } from 'next/server';
import { createToken, setAuthCookie, validatePassword } from '../../../../lib/auth-utils';
import { db } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, redirectTo = '/' } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = await createToken(user);
    setAuthCookie(token);

      return NextResponse.json(
      { success: true, redirectTo },
        { status: 200 }
      );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 