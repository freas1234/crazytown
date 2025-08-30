import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

const defaultContent = {
  title: {
    en: "About Our Server",
    ar: "عن السيرفر"
  },
  subtitle: {
    en: "Discover the world of Crazy Town FiveM",
    ar: "اكتشف عالم كريزي تاون FiveM"
  },
  aboutText: {
    en: "Crazy Town is a premier FiveM roleplay server offering an immersive gaming experience. Our server is built on a foundation of quality roleplay, community engagement, and continuous improvement. We strive to create a welcoming environment for all players, whether you're new to roleplay or a seasoned veteran. Our dedicated team of administrators and developers work tirelessly to ensure the server runs smoothly and provides new content regularly.",
    ar: "كريزي تاون هو سيرفر لعب أدوار FiveM متميز يقدم تجربة ألعاب غامرة. تم بناء السيرفر على أساس لعب أدوار عالي الجودة، ومشاركة المجتمع، والتحسين المستمر. نسعى جاهدين لخلق بيئة ترحيبية لجميع اللاعبين، سواء كنت جديدًا في لعب الأدوار أو محترفًا متمرسًا. يعمل فريقنا المخصص من المسؤولين والمطورين بلا كلل لضمان تشغيل السيرفر بسلاسة وتوفير محتوى جديد بانتظام."
  },
  serverInfoText: {
    en: "Our server features a custom economy system, unique job opportunities, and regular events. We pride ourselves on maintaining a balanced gameplay experience that rewards both casual players and those who invest significant time in the server. With custom scripts, vehicles, and properties, Crazy Town offers something for everyone.",
    ar: "يتميز السيرفر بنظام اقتصادي مخصص، وفرص عمل فريدة، وفعاليات منتظمة. نحن نفتخر بالحفاظ على تجربة لعب متوازنة تكافئ كلاً من اللاعبين العاديين وأولئك الذين يستثمرون وقتًا كبيرًا في السيرفر. مع نصوص برمجية مخصصة ومركبات وممتلكات، يقدم كريزي تاون شيئًا للجميع."
  },
  featuresItems: [
    {
      title: {
        en: "Custom Economy",
        ar: "نظام اقتصادي مخصص"
      },
      description: {
        en: "Balanced economic system with multiple ways to earn and spend money",
        ar: "نظام اقتصادي متوازن مع طرق متعددة لكسب وإنفاق المال"
      }
    },
    {
      title: {
        en: "Unique Jobs",
        ar: "وظائف فريدة"
      },
      description: {
        en: "Various legal and illegal job opportunities with progression systems",
        ar: "فرص عمل قانونية وغير قانونية متنوعة مع أنظمة تقدم"
      }
    },
    {
      title: {
        en: "Active Staff",
        ar: "طاقم نشط"
      },
      description: {
        en: "Dedicated team available to assist players and maintain server quality",
        ar: "فريق مخصص متاح لمساعدة اللاعبين والحفاظ على جودة السيرفر"
      }
    },
    {
      title: {
        en: "Regular Events",
        ar: "فعاليات منتظمة"
      },
      description: {
        en: "Weekly community events with special rewards and activities",
        ar: "فعاليات مجتمعية أسبوعية مع مكافآت وأنشطة خاصة"
      }
    }
  ],
  teamMembers: [
    {
      name: {
        en: "Alex",
        ar: "أليكس"
      },
      role: {
        en: "Owner & Lead Developer",
        ar: "المالك والمطور الرئيسي"
      },
      avatar: "/placeholder-avatar.svg"
    },
    {
      name: {
        en: "Sarah",
        ar: "سارة"
      },
      role: {
        en: "Community Manager",
        ar: "مديرة المجتمع"
      },
      avatar: "/placeholder-avatar.svg"
    }
  ]
};

export async function GET() {
  try {
    const { db: database } = await connectToDatabase();
    const contentCollection = database.collection('content');
    
    const aboutContent = await contentCollection.findOne({ type: 'about' });
    
    return NextResponse.json({ 
      success: true,
      content: aboutContent?.data || defaultContent
    });
  } catch (error) {
    console.error('Error fetching about page content:', error);
    return NextResponse.json({ 
      success: false,
      content: defaultContent
    });
  }
} 