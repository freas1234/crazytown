import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../../lib/db';
import { authOptions } from '../../../../../lib/auth-config';

// Default content for the register page
const defaultRegisterContent = {
  en: {
    title: "Create an Account",
    subtitle: "Join our community by creating a new account",
    nameLabel: "Full Name",
    usernameLabel: "Username",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    registerButton: "Register",
    haveAccount: "Already have an account?",
    loginLink: "Login",
    termsText: "By registering, you agree to our Terms of Service and Privacy Policy",
    errorMessages: {
      nameRequired: "Full name is required",
      usernameRequired: "Username is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsMustMatch: "Passwords must match",
      usernameTaken: "This username is already taken",
      emailTaken: "This email is already registered",
      serverError: "An error occurred. Please try again later."
    },
    successMessage: "Registration successful! You can now login."
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "انضم إلى مجتمعنا من خلال إنشاء حساب جديد",
    nameLabel: "الاسم الكامل",
    usernameLabel: "اسم المستخدم",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    registerButton: "إنشاء حساب",
    haveAccount: "هل لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    termsText: "بالتسجيل، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا",
    errorMessages: {
      nameRequired: "الاسم الكامل مطلوب",
      usernameRequired: "اسم المستخدم مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "الرجاء إدخال عنوان بريد إلكتروني صالح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordTooShort: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
      passwordsMustMatch: "يجب أن تتطابق كلمات المرور",
      usernameTaken: "اسم المستخدم هذا مستخدم بالفعل",
      emailTaken: "هذا البريد الإلكتروني مسجل بالفعل",
      serverError: "حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا."
    },
    successMessage: "تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول."
  }
};

// GET endpoint to fetch register content for admin panel
export async function GET() {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'owner'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    const content = await db.collection('content').findOne({ type: 'register' });
    
    // If no content exists yet, return default content
    if (!content) {
      return NextResponse.json({ 
        content: defaultRegisterContent,
        message: 'Using default register content' 
      });
    }
    
    return NextResponse.json({ 
      content: content.data || defaultRegisterContent,
      message: 'Register content retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching register content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch register content' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update register content
export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'owner'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Update or create register content
    const result = await db.collection('content').updateOne(
      { type: 'register' },
      { 
        $set: {
          data: content,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: 'register',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      message: 'Register content updated successfully',
      content: content
    });
  } catch (error) {
    console.error('Error updating register content:', error);
    return NextResponse.json(
      { error: 'Failed to update register content' },
      { status: 500 }
    );
  }
} 