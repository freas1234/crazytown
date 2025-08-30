export interface ContactContent {
  en: {
    title: string;
    subtitle: string;
    contactInfoTitle: string;
    contactInfoSubtitle: string;
    socialLinksTitle: string;
    formTitle: string;
    formSubtitle: string;
    faqTitle: string;
    faqSubtitle: string;
    successMessage: string;
    formLabels: {
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      sending: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      subjectPlaceholder: string;
      messagePlaceholder: string;
      discord: string;
      website: string;
    };
    contactInfo: {
      email: string;
      discord: string;
      discordText: string;
      website: string;
      websiteText: string;
    };
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  ar: {
    title: string;
    subtitle: string;
    contactInfoTitle: string;
    contactInfoSubtitle: string;
    socialLinksTitle: string;
    formTitle: string;
    formSubtitle: string;
    faqTitle: string;
    faqSubtitle: string;
    successMessage: string;
    formLabels: {
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      sending: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      subjectPlaceholder: string;
      messagePlaceholder: string;
      discord: string;
      website: string;
    };
    contactInfo: {
      email: string;
      discord: string;
      discordText: string;
      website: string;
      websiteText: string;
    };
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  socialLinks: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
}

export const defaultContactContent: ContactContent = {
  en: {
    title: "Contact Us",
    subtitle: "Have questions or feedback? We'd love to hear from you.",
    contactInfoTitle: "Contact Information",
    contactInfoSubtitle: "Reach out to us through these channels",
    socialLinksTitle: "Follow Us",
    formTitle: "Send Us a Message",
    formSubtitle: "Fill out the form below and we'll get back to you as soon as possible",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find answers to common questions about our server",
    successMessage: "Your message has been sent successfully! We'll get back to you soon.",
    formLabels: {
      name: "Your Name",
      email: "Your Email",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "Enter your email",
      subjectPlaceholder: "What is this about?",
      messagePlaceholder: "Type your message here...",
      discord: "Discord",
      website: "Website"
    },
    contactInfo: {
      email: "contact@crazytown.com",
      discord: "https://discord.gg/crazytown",
      discordText: "Join our Discord",
      website: "https://crazytown.com",
      websiteText: "crazytown.com"
    },
    faqs: [
      {
        question: "How do I join the server?",
        answer: "To join our FiveM server, you'll need to own GTA V on PC and have FiveM installed. Simply launch FiveM, add our server to your favorites using our server IP (connect.crazytown.com), and connect!"
      },
      {
        question: "Are there any requirements to join?",
        answer: "We welcome players of all experience levels. The only requirements are that you must be able to communicate in English or Arabic, follow our server rules, and maintain a respectful attitude toward other players."
      },
      {
        question: "How can I report a player or bug?",
        answer: "You can report players or bugs through our Discord server. We have dedicated channels for player reports and bug reports, where our staff team will review and address your concerns as quickly as possible."
      },
      {
        question: "Can I donate to the server?",
        answer: "Yes, we accept donations to help cover server costs and development. Donors receive special perks as a thank you for supporting the server. Visit our store page for more information on donation options and rewards."
      }
    ]
  },
  ar: {
    title: "اتصل بنا",
    subtitle: "هل لديك أسئلة أو ملاحظات؟ نود أن نسمع منك.",
    contactInfoTitle: "معلومات الاتصال",
    contactInfoSubtitle: "تواصل معنا من خلال هذه القنوات",
    socialLinksTitle: "تابعنا",
    formTitle: "أرسل لنا رسالة",
    formSubtitle: "املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن",
    faqTitle: "الأسئلة الشائعة",
    faqSubtitle: "اعثر على إجابات للأسئلة الشائعة حول السيرفر",
    successMessage: "تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.",
    formLabels: {
      name: "اسمك",
      email: "بريدك الإلكتروني",
      subject: "الموضوع",
      message: "الرسالة",
      send: "إرسال الرسالة",
      sending: "جاري الإرسال...",
      namePlaceholder: "أدخل اسمك",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      subjectPlaceholder: "ما هو موضوع رسالتك؟",
      messagePlaceholder: "اكتب رسالتك هنا...",
      discord: "ديسكورد",
      website: "الموقع الإلكتروني"
    },
    contactInfo: {
      email: "contact@crazytown.com",
      discord: "https://discord.gg/crazytown",
      discordText: "انضم إلى ديسكورد",
      website: "https://crazytown.com",
      websiteText: "crazytown.com"
    },
    faqs: [
      {
        question: "كيف يمكنني الانضمام إلى السيرفر؟",
        answer: "للانضمام إلى سيرفر FiveM الخاص بنا، ستحتاج إلى امتلاك GTA V على الكمبيوتر وتثبيت FiveM. ما عليك سوى تشغيل FiveM، وإضافة السيرفر إلى المفضلة لديك باستخدام عنوان IP الخاص بالسيرفر (connect.crazytown.com)، والاتصال!"
      },
      {
        question: "هل هناك أي متطلبات للانضمام؟",
        answer: "نرحب باللاعبين من جميع مستويات الخبرة. المتطلبات الوحيدة هي أنه يجب أن تكون قادرًا على التواصل باللغة الإنجليزية أو العربية، واتباع قواعد السيرفر، والحفاظ على موقف محترم تجاه اللاعبين الآخرين."
      },
      {
        question: "كيف يمكنني الإبلاغ عن لاعب أو خطأ؟",
        answer: "يمكنك الإبلاغ عن اللاعبين أو الأخطاء من خلال سيرفر Discord الخاص بنا. لدينا قنوات مخصصة لتقارير اللاعبين وتقارير الأخطاء، حيث سيقوم فريق العمل لدينا بمراجعة مخاوفك ومعالجتها في أسرع وقت ممكن."
      },
      {
        question: "هل يمكنني التبرع للسيرفر؟",
        answer: "نعم، نقبل التبرعات للمساعدة في تغطية تكاليف السيرفر والتطوير. يحصل المتبرعون على مزايا خاصة كشكر لدعمهم للسيرفر. قم بزيارة صفحة المتجر الخاصة بنا للحصول على مزيد من المعلومات حول خيارات التبرع والمكافآت."
      }
    ]
  },
  socialLinks: [
    {
      name: "Twitter",
      url: "https://twitter.com/crazytown",
      icon: "Twitter"
    },
    {
      name: "Discord",
      url: "https://discord.gg/crazytown",
      icon: "MessageSquare"
    },
    {
      name: "Instagram",
      url: "https://instagram.com/crazytown",
      icon: "Instagram"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/crazytown",
      icon: "Youtube"
    }
  ]
}; 