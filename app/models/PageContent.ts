/**
 * Base interface for multilingual content
 */
export interface MultilingualContent {
  en: Record<string, any>;
  ar: Record<string, any>;
}

/**
 * Login page content
 */
export interface LoginContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    forgotPassword: string;
    noAccount: string;
    registerLink: string;
    errorMessages: {
      invalidCredentials: string;
      emailRequired: string;
      passwordRequired: string;
      serverError: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    forgotPassword: string;
    noAccount: string;
    registerLink: string;
    errorMessages: {
      invalidCredentials: string;
      emailRequired: string;
      passwordRequired: string;
      serverError: string;
    };
  };
}

/**
 * Register page content
 */
export interface RegisterContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    nameLabel: string;
    usernameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    registerButton: string;
    haveAccount: string;
    loginLink: string;
    termsText: string;
    errorMessages: {
      nameRequired: string;
      usernameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      passwordRequired: string;
      passwordTooShort: string;
      passwordsMustMatch: string;
      usernameTaken: string;
      emailTaken: string;
      serverError: string;
    };
    successMessage: string;
  };
  ar: {
    title: string;
    subtitle: string;
    nameLabel: string;
    usernameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    registerButton: string;
    haveAccount: string;
    loginLink: string;
    termsText: string;
    errorMessages: {
      nameRequired: string;
      usernameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      passwordRequired: string;
      passwordTooShort: string;
      passwordsMustMatch: string;
      usernameTaken: string;
      emailTaken: string;
      serverError: string;
    };
    successMessage: string;
  };
}

/**
 * Profile page content
 */
export interface ProfileContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    personalInfo: {
      title: string;
      nameLabel: string;
      usernameLabel: string;
      emailLabel: string;
      joinedLabel: string;
      saveButton: string;
      successMessage: string;
      errorMessage: string;
    };
    security: {
      title: string;
      currentPasswordLabel: string;
      newPasswordLabel: string;
      confirmPasswordLabel: string;
      changePasswordButton: string;
      successMessage: string;
      errorMessage: string;
    };
    tabs: {
      info: string;
      security: string;
      applications: string;
      orders: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    personalInfo: {
      title: string;
      nameLabel: string;
      usernameLabel: string;
      emailLabel: string;
      joinedLabel: string;
      saveButton: string;
      successMessage: string;
      errorMessage: string;
    };
    security: {
      title: string;
      currentPasswordLabel: string;
      newPasswordLabel: string;
      confirmPasswordLabel: string;
      changePasswordButton: string;
      successMessage: string;
      errorMessage: string;
    };
    tabs: {
      info: string;
      security: string;
      applications: string;
      orders: string;
    };
  };
}

/**
 * Applications page content
 */
export interface ApplicationsContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    noApplications: string;
    columns: {
      position: string;
      date: string;
      status: string;
      actions: string;
    };
    statuses: {
      pending: string;
      reviewing: string;
      accepted: string;
      rejected: string;
    };
    viewDetails: string;
    deleteApplication: string;
    confirmDelete: string;
    cancelDelete: string;
  };
  ar: {
    title: string;
    subtitle: string;
    noApplications: string;
    columns: {
      position: string;
      date: string;
      status: string;
      actions: string;
    };
    statuses: {
      pending: string;
      reviewing: string;
      accepted: string;
      rejected: string;
    };
    viewDetails: string;
    deleteApplication: string;
    confirmDelete: string;
    cancelDelete: string;
  };
}

/**
 * Store page content
 */
export interface StoreContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
    };
    filters: {
      title: string;
      price: string;
      sort: {
        title: string;
        newest: string;
        priceHighToLow: string;
        priceLowToHigh: string;
        popularity: string;
      };
      apply: string;
      reset: string;
    };
    search: {
      placeholder: string;
      noResults: string;
    };
    product: {
      addToCart: string;
      outOfStock: string;
      viewDetails: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
    };
    filters: {
      title: string;
      price: string;
      sort: {
        title: string;
        newest: string;
        priceHighToLow: string;
        priceLowToHigh: string;
        popularity: string;
      };
      apply: string;
      reset: string;
    };
    search: {
      placeholder: string;
      noResults: string;
    };
    product: {
      addToCart: string;
      outOfStock: string;
      viewDetails: string;
    };
  };
}

/**
 * Cart page content
 */
export interface CartContent extends MultilingualContent {
  en: {
    title: string;
    emptyCart: string;
    continueShopping: string;
    checkout: string;
    summary: {
      title: string;
      subtotal: string;
      shipping: string;
      tax: string;
      total: string;
    };
    items: {
      product: string;
      price: string;
      quantity: string;
      total: string;
      remove: string;
    };
    updateCart: string;
  };
  ar: {
    title: string;
    emptyCart: string;
    continueShopping: string;
    checkout: string;
    summary: {
      title: string;
      subtotal: string;
      shipping: string;
      tax: string;
      total: string;
    };
    items: {
      product: string;
      price: string;
      quantity: string;
      total: string;
      remove: string;
    };
    updateCart: string;
  };
}

/**
 * Checkout page content
 */
export interface CheckoutContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    steps: {
      information: string;
      shipping: string;
      payment: string;
      confirmation: string;
    };
    form: {
      contactInfo: {
        title: string;
        email: string;
        phone: string;
      };
      shippingAddress: {
        title: string;
        name: string;
        address: string;
        city: string;
        country: string;
        postalCode: string;
      };
      paymentMethod: {
        title: string;
        creditCard: string;
        paypal: string;
        cardNumber: string;
        cardName: string;
        expiration: string;
        cvv: string;
      };
      buttons: {
        continue: string;
        back: string;
        placeOrder: string;
      };
    };
    orderSummary: {
      title: string;
      items: string;
      shipping: string;
      tax: string;
      total: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    steps: {
      information: string;
      shipping: string;
      payment: string;
      confirmation: string;
    };
    form: {
      contactInfo: {
        title: string;
        email: string;
        phone: string;
      };
      shippingAddress: {
        title: string;
        name: string;
        address: string;
        city: string;
        country: string;
        postalCode: string;
      };
      paymentMethod: {
        title: string;
        creditCard: string;
        paypal: string;
        cardNumber: string;
        cardName: string;
        expiration: string;
        cvv: string;
      };
      buttons: {
        continue: string;
        back: string;
        placeOrder: string;
      };
    };
    orderSummary: {
      title: string;
      items: string;
      shipping: string;
      tax: string;
      total: string;
    };
  };
}

/**
 * Order confirmation page content
 */
export interface ConfirmationContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    orderNumber: string;
    thankYou: string;
    emailSent: string;
    orderDetails: {
      title: string;
      date: string;
      total: string;
      paymentMethod: string;
      shippingAddress: string;
    };
    actions: {
      viewOrder: string;
      continueShopping: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    orderNumber: string;
    thankYou: string;
    emailSent: string;
    orderDetails: {
      title: string;
      date: string;
      total: string;
      paymentMethod: string;
      shippingAddress: string;
    };
    actions: {
      viewOrder: string;
      continueShopping: string;
    };
  };
}

/**
 * Product detail page content
 */
export interface ProductDetailContent extends MultilingualContent {
  en: {
    addToCart: string;
    outOfStock: string;
    description: string;
    features: string;
    specifications: string;
    reviews: {
      title: string;
      writeReview: string;
      noReviews: string;
      rating: string;
      comment: string;
      submit: string;
    };
    relatedProducts: string;
  };
  ar: {
    addToCart: string;
    outOfStock: string;
    description: string;
    features: string;
    specifications: string;
    reviews: {
      title: string;
      writeReview: string;
      noReviews: string;
      rating: string;
      comment: string;
      submit: string;
    };
    relatedProducts: string;
  };
}

/**
 * Jobs page content
 */
export interface JobsContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    filters: {
      searchPlaceholder: string;
      showOpenOnly: string;
      categories: {
        all: string;
      };
    };
    status: {
      open: string;
      closed: string;
      featured: string;
    };
    noJobs: {
      title: string;
      openPositions: string;
      allPositions: string;
      resetFilters: string;
    };
    applicationProcess: {
      title: string;
      steps: {
        submit: {
          title: string;
          description: string;
        };
        interview: {
          title: string;
          description: string;
        };
        decision: {
          title: string;
          description: string;
        };
      };
    };
    applyNow: string;
    positionFilled: string;
  };
  ar: {
    title: string;
    subtitle: string;
    filters: {
      searchPlaceholder: string;
      showOpenOnly: string;
      categories: {
        all: string;
      };
    };
    status: {
      open: string;
      closed: string;
      featured: string;
    };
    noJobs: {
      title: string;
      openPositions: string;
      allPositions: string;
      resetFilters: string;
    };
    applicationProcess: {
      title: string;
      steps: {
        submit: {
          title: string;
          description: string;
        };
        interview: {
          title: string;
          description: string;
        };
        decision: {
          title: string;
          description: string;
        };
      };
    };
    applyNow: string;
    positionFilled: string;
  };
}

/**
 * Job application page content
 */
export interface JobApplyContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    form: {
      personalInfo: {
        title: string;
        name: string;
        email: string;
        phone: string;
        discord: string;
      };
      experience: {
        title: string;
        yearsExperience: string;
        previousRoles: string;
        skills: string;
      };
      questions: {
        title: string;
        whyJoin: string;
        availability: string;
        additionalInfo: string;
      };
      submit: string;
      submitting: string;
    };
    success: {
      title: string;
      message: string;
      viewApplications: string;
      backToJobs: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    form: {
      personalInfo: {
        title: string;
        name: string;
        email: string;
        phone: string;
        discord: string;
      };
      experience: {
        title: string;
        yearsExperience: string;
        previousRoles: string;
        skills: string;
      };
      questions: {
        title: string;
        whyJoin: string;
        availability: string;
        additionalInfo: string;
      };
      submit: string;
      submitting: string;
    };
    success: {
      title: string;
      message: string;
      viewApplications: string;
      backToJobs: string;
    };
  };
}

/**
 * Inbox page content
 */
export interface InboxContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    noMessages: string;
    filters: {
      all: string;
      unread: string;
      read: string;
      system: string;
      personal: string;
    };
    actions: {
      markAllRead: string;
      markAsRead: string;
      markAsUnread: string;
      delete: string;
    };
    confirmDelete: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
  };
  ar: {
    title: string;
    subtitle: string;
    noMessages: string;
    filters: {
      all: string;
      unread: string;
      read: string;
      system: string;
      personal: string;
    };
    actions: {
      markAllRead: string;
      markAsRead: string;
      markAsUnread: string;
      delete: string;
    };
    confirmDelete: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
  };
}

/**
 * Not found page content
 */
export interface NotFoundContent extends MultilingualContent {
  en: {
    title: string;
    subtitle: string;
    message: string;
    backHome: string;
  };
  ar: {
    title: string;
    subtitle: string;
    message: string;
    backHome: string;
  };
}

// Default content for each page type
export const defaultLoginContent: LoginContent = {
  en: {
    title: "Login to Your Account",
    subtitle: "Welcome back! Please enter your credentials to access your account.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Login",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    errorMessages: {
      invalidCredentials: "Invalid email or password",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      serverError: "An error occurred. Please try again later."
    }
  },
  ar: {
    title: "تسجيل الدخول إلى حسابك",
    subtitle: "مرحبًا بعودتك! الرجاء إدخال بيانات الاعتماد الخاصة بك للوصول إلى حسابك.",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    forgotPassword: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    registerLink: "إنشاء حساب",
    errorMessages: {
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      emailRequired: "البريد الإلكتروني مطلوب",
      passwordRequired: "كلمة المرور مطلوبة",
      serverError: "حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا."
    }
  }
};

// Default content for register page
export const defaultRegisterContent: RegisterContent = {
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

// Add default content for other pages as needed 