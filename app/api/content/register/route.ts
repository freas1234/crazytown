import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

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

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const content = await db.collection('content').findOne({ type: 'register' });
    
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
      { error: 'Failed to fetch register content', content: defaultRegisterContent },
      { status: 500 }
    );
  }
} 