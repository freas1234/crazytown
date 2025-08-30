import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth-utils';
import { db } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, confirmPassword } = body;

    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already in use' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    await db.user.create({
      data: {
      email,
      username,
      password: hashedPassword,
        role: 'user'
      }
    });

    return NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 