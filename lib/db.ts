import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const isServer = typeof window === 'undefined';

if (!isServer) {
  throw new Error('This module is meant to be used on the server only');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fares139146:139146@cluster0.7dhheww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB = process.env.MONGODB_DB || 'CrazyTowens';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  bio?: string;
  avatar?: string;
  discordId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

  
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));
  console.log('MongoDB DB:', MONGODB_DB);

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 50,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      ssl: true,
      tls: true,
    });
    
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}


async function initializeDb() {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const contentCollection = db.collection('content');
    const settingsCollection = db.collection('settings');
    const ruleCategoriesCollection = db.collection('ruleCategories');
    const rulesCollection = db.collection('rules');
    const productsCollection = db.collection('products');
    const productCategoriesCollection = db.collection('productCategories');
    
    const usersCount = await usersCollection.countDocuments();
    


    
    const ruleCategoriesCount = await ruleCategoriesCollection.countDocuments();

    if (ruleCategoriesCount === 0) {
      console.log('Initializing default rule categories...');
    
      const defaultCategories = [
        {
          id: uuidv4(),
          name: {
            en: 'General Rules',
            ar: 'القواعد العامة'
          },
          order: 1,
          active: true,
        },
        {
          id: uuidv4(),
          name: {
            en: 'Roleplay Guidelines',
            ar: 'إرشادات اللعب التمثيلي'
          },
          order: 2,
          active: true,
        },
        {
          id: uuidv4(),
          name: {
            en: 'Community Guidelines',
            ar: 'إرشادات المجتمع'
          },
          order: 3,
          active: true,
        }
      ];
    
      await ruleCategoriesCollection.insertMany(defaultCategories);
    
      console.log('Default rule categories created');
    
      const generalCategoryId = defaultCategories[0].id;
      const roleplayCategoryId = defaultCategories[1].id;
      const communityCategoryId = defaultCategories[2].id;
    
      const now = new Date();
    
      const defaultRules = [
        {
          id: uuidv4(),
          category: generalCategoryId,
          title: {
            en: "Respect All Players",
            ar: "احترام جميع اللاعبين"
          },
          description: {
            en: "Treat all players with respect. Harassment, discrimination, hate speech, or bullying of any kind will not be tolerated and may result in an immediate ban.",
            ar: "عامل جميع اللاعبين باحترام. لن يتم التسامح مع أي مضايقة أو تمييز أو خطاب كراهية أو تنمر، وقد يؤدي ذلك إلى حظر فوري."
          },
          order: 1,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          category: generalCategoryId,
          title: {
            en: "No Cheating or Exploiting",
            ar: "ممنوع الغش أو الاستغلال"
          },
          description: {
            en: "Using cheats, hacks, exploits, or any unauthorized third-party software is strictly prohibited. This includes but is not limited to aimbots, ESP, and macros.",
            ar: "يُحظر تمامًا استخدام الغش أو الاختراقات أو الاستغلالات أو أي برامج خارجية غير مصرح بها. يشمل ذلك، على سبيل المثال لا الحصر، الروبوتات المساعدة، وESP، والماكروز."
          },
          order: 2,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          category: roleplayCategoryId,
          title: {
            en: "Stay In Character",
            ar: "ابقَ في الشخصية"
          },
          description: {
            en: "Maintain roleplay at all times. Breaking character disrupts the immersive experience for everyone. Use designated OOC channels for out-of-character communication.",
            ar: "حافظ على التمثيل طوال الوقت. كسر الشخصية يعطل تجربة الانغماس للجميع. استخدم القنوات المخصصة للتواصل خارج الشخصية."
          },
          order: 1,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          category: communityCategoryId,
          title: {
            en: "Server Advertisement",
            ar: "الإعلان عن سيرفرات أخرى"
          },
          description: {
            en: "Advertising other servers or services is not allowed in any server channels without prior staff approval.",
            ar: "الإعلان عن سيرفرات أو خدمات أخرى غير مسموح به في أي قناة داخل السيرفر بدون موافقة مسبقة من الطاقم."
          },
          order: 1,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      ];
    
      await rulesCollection.insertMany(defaultRules);
    
      console.log('Default rules created');
    }

    

    const heroContent = await contentCollection.findOne({ type: 'hero' });
    const featuredContent = await contentCollection.findOne({ type: 'featuredCards' });
    const metadataContent = await contentCollection.findOne({ type: 'metadata' });
    
    if (!heroContent) {
      console.log('Initializing hero content...');
      await contentCollection.insertOne({
        id: uuidv4(),
        type: 'hero',
        data: {
          en: {
            title: "Welcome to Crazy Town FiveM Server",
            subtitle: "The ultimate gaming experience",
            cta: "Explore Store",
          },
          ar: {
            title: "مرحبًا بك في سيرفر كريزي تاون",
            subtitle: "تجربة لعب لا مثيل لها",
            cta: "استكشف المتجر",
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    if (!featuredContent) {
      console.log('Initializing featured cards content...');
      await contentCollection.insertOne({
        id: uuidv4(),
        type: 'featuredCards',
        data: {
          en: {
            title: "Featured Content",
            cards: [
              {
                title: "Server Rules",
                description: "Learn about our community guidelines and server rules.",
                link: "/rules",
                linkText: "View Rules",
                icon: "book-open"
              },
              {
                title: "Job Applications",
                description: "Apply for special roles and jobs within our server.",
                link: "/jobs",
                linkText: "Apply Now",
                icon: "briefcase"
              },
              {
                title: "Store",
                description: "Browse our exclusive items and packages.",
                link: "/store",
                linkText: "Shop Now",
                icon: "shopping-bag"
              }
            ]
          },
          ar: {
            title: "المحتوى المميز",
            cards: [
              {
                title: "قوانين السيرفر",
                description: "تعرف على إرشادات مجتمعنا وقوانين السيرفر.",
                link: "/rules",
                linkText: "عرض القوانين",
                icon: "book-open"
              },
              {
                title: "طلبات الوظائف",
                description: "قدم طلبًا للحصول على أدوار ووظائف خاصة داخل السيرفر.",
                link: "/jobs",
                linkText: "قدم الآن",
                icon: "briefcase"
              },
              {
                title: "المتجر",
                description: "تصفح العناصر والحزم الحصرية لدينا.",
                link: "/store",
                linkText: "تسوق الآن",
                icon: "shopping-bag"
              }
            ]
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    if (!metadataContent) {
      console.log('Initializing site metadata...');
      await contentCollection.insertOne({
        id: uuidv4(),
        type: 'metadata',
        data: {
          title: 'Crazytown Store',
          description: 'Your cyberpunk gaming destination',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    const maintenanceSetting = await settingsCollection.findOne({ key: 'maintenanceMode' });
    if (!maintenanceSetting) {
      console.log('Initializing maintenance mode setting...');
      await settingsCollection.insertOne({
        key: 'maintenanceMode',
        value: false,
        updatedAt: new Date()
      });
    } else {
      const { loadMaintenanceModeFromDb } = require('./maintenance');
      await loadMaintenanceModeFromDb();
    }
    

    const productCategoriesCount = await productCategoriesCollection.countDocuments();
    
    if (productCategoriesCount === 0) {
      console.log('Initializing default product categories...');
      
      const defaultCategories = [
        {
          id: uuidv4(),
          name: {
            en: 'Digital Items',
            ar: 'العناصر الرقمية'
          },
          order: 1,
          active: true,
        },
        {
          id: uuidv4(),
          name: {
            en: 'Server Perks',
            ar: 'مزايا السيرفر'
          },
          order: 2,
          active: true,
        },
        {
          id: uuidv4(),
          name: {
            en: 'Custom Items',
            ar: 'العناصر المخصصة'
          },
          order: 3,
          active: true,
        }
      ];
      
      await productCategoriesCollection.insertMany(defaultCategories);
      
      console.log('Default product categories created');
      
        
      const digitalCategoryId = defaultCategories[0].id;
      const perksCategoryId = defaultCategories[1].id;
      const customCategoryId = defaultCategories[2].id;
      
      const now = new Date();
      
      const sampleProducts = [
        {
          id: uuidv4(),
          name: {
            en: 'VIP Membership',
            ar: 'عضوية VIP'
          },
          description: {
            en: 'Get exclusive access to VIP areas and special perks on the server for 30 days.',
            ar: 'احصل على وصول حصري إلى مناطق VIP ومزايا خاصة على السيرفر لمدة 30 يومًا.'
          },
          price: 9.99,
          imageUrl: '/placeholder-product.jpg',
          category: perksCategoryId,
          featured: true,
          stock: 999,
          digital: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: {
            en: 'Custom Character Skin',
            ar: 'سكن شخصية مخصص'
          },
          description: {
            en: 'Get a unique custom character skin designed just for you. Our team will create a personalized skin based on your preferences.',
            ar: 'احصل على سكن شخصية فريد مصمم خصيصًا لك. سيقوم فريقنا بإنشاء سكن مخصص بناءً على تفضيلاتك.'
          },
          price: 24.99,
          imageUrl: '/placeholder-product.jpg',
          category: customCategoryId,
          featured: false,
          stock: 10,
          digital: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: {
            en: 'Starting Package',
            ar: 'حزمة البداية'
          },
          description: {
            en: 'Get a head start with our beginner package. Includes basic items, currency, and a starter vehicle.',
            ar: 'احصل على بداية قوية مع حزمة المبتدئين. تتضمن العناصر الأساسية والعملات ومركبة للمبتدئين.'
          },
          price: 14.99,
          imageUrl: '/placeholder-product.jpg',
          category: digitalCategoryId,
          featured: true,
          stock: 100,
          digital: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: {
            en: 'Currency Pack - 10,000',
            ar: 'حزمة العملات - 10,000'
          },
          description: {
            en: 'Add 10,000 in-game currency to your account instantly.',
            ar: 'أضف 10,000 عملة داخل اللعبة إلى حسابك على الفور.'
          },
          price: 4.99,
          imageUrl: '/placeholder-product.jpg',
          category: digitalCategoryId,
          featured: false,
          stock: 999,
          digital: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: {
            en: 'Custom Property',
            ar: 'عقار مخصص'
          },
          description: {
            en: 'Get a custom property built for you in a premium location on the server. Our builders will work with you to create your dream home.',
            ar: 'احصل على عقار مخصص تم بناؤه لك في موقع متميز على السيرفر. سيعمل البناؤون لدينا معك لإنشاء منزل أحلامك.'
          },
          price: 49.99,
          imageUrl: '/placeholder-product.jpg',
          category: customCategoryId,
          featured: true,
          stock: 5,
          digital: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          name: {
            en: 'Priority Queue',
            ar: 'قائمة انتظار ذات أولوية'
          },
          description: {
            en: 'Skip the queue and get priority access to the server for 30 days. Never wait in line again!',
            ar: 'تخطى قائمة الانتظار واحصل على أولوية الوصول إلى السيرفر لمدة 30 يومًا. لن تنتظر في الطابور مرة أخرى!'
          },
          price: 7.99,
          imageUrl: '/placeholder-product.jpg',
          category: perksCategoryId,
          featured: false,
          stock: 50,
          digital: true,
          createdAt: now,
          updatedAt: now
        }
      ];
      
      await productsCollection.insertMany(sampleProducts);
      
      console.log('Sample products created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}


initializeDb().catch(console.error);

export const db = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string; username?: string; discordId?: string } }) => {
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        let query = {};
        
        if (where.id) {
          query = { id: where.id };
        } else if (where.email) {
          query = { email: where.email };
        } else if (where.username) {
          query = { username: where.username };
        } else if (where.discordId) {
          query = { discordId: where.discordId };
        }
        
        console.log('MongoDB findUnique query:', query);
        const user = await usersCollection.findOne(query);
        console.log('MongoDB findUnique result:', user ? 'User found' : 'User not found');
        
        return user;
      } catch (error) {
        console.error('MongoDB findUnique error:', error);
        return null;
      }
    },
    
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => {
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        const now = new Date();
        const newUser = {
          id: uuidv4(),
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        
        console.log('MongoDB create user:', newUser.email);
        await usersCollection.insertOne(newUser);
        
        return newUser;
      } catch (error) {
        console.error('MongoDB create error:', error);
        throw error;
      }
    },
    
    update: async ({ where, data }: { where: { id: string }, data: Partial<User> }) => {
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };
        
        console.log('MongoDB update user:', where.id);
        const result = await usersCollection.findOneAndUpdate(
          { id: where.id },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        
        return result.value;
      } catch (error) {
        console.error('MongoDB update error:', error);
        return null;
      }
    },
    
    findMany: async () => {
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        console.log('MongoDB findMany');
        return await usersCollection.find({}).toArray();
      } catch (error) {
        console.error('MongoDB findMany error:', error);
        return [];
      }
    },
    
    delete: async ({ where }: { where: { id: string } }) => {
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        console.log('MongoDB delete user:', where.id);
        const result = await usersCollection.deleteOne({ id: where.id });
        
        return result.deletedCount === 1;
      } catch (error) {
        console.error('MongoDB delete error:', error);
        return false;
      }
    }
  },
  
  content: {
    findByType: async (type: string) => {
      try {
        const { db } = await connectToDatabase();
        const contentCollection = db.collection('content');
        
        console.log(`MongoDB finding content with type: ${type}`);
        const content = await contentCollection.findOne({ type });
        
        return content;
      } catch (error) {
        console.error('MongoDB findByType error:', error);
        return null;
      }
    },
    
    upsert: async (type: string, data: any) => {
      try {
        const { db } = await connectToDatabase();
        const contentCollection = db.collection('content');
        
        const now = new Date();
        const updateData = {
          type,
          data,
          updatedAt: now,
        };
        
        console.log(`MongoDB upserting content with type: ${type}`);
        const result = await contentCollection.findOneAndUpdate(
          { type },
          { 
            $set: updateData,
            $setOnInsert: { 
              id: uuidv4(),
              createdAt: now 
            }
          },
          { 
            upsert: true,
            returnDocument: 'after'
          }
        );
        
        return result.value;
      } catch (error) {
        console.error('MongoDB upsert error:', error);
        return null;
      }
    },
    
    findAll: async () => {
      try {
        const { db } = await connectToDatabase();
        const contentCollection = db.collection('content');
        
        console.log('MongoDB finding all content');
        return await contentCollection.find({}).toArray();
      } catch (error) {
        console.error('MongoDB findAll error:', error);
        return [];
      }
    }
  },
  
  settings: {
    getUserLanguagePreference: async (userId: string) => {
      try {
        const { db } = await connectToDatabase();
        const settingsCollection = db.collection('userSettings');
        
        const setting = await settingsCollection.findOne({ 
          userId,
          settingType: 'language'
        });
        
        return setting?.value || 'en';
      } catch (error) {
        console.error('MongoDB getUserLanguagePreference error:', error);
        return 'en';
      }
    },
    
    updateUserLanguagePreference: async (userId: string, language: string) => {
      try {
        const { db } = await connectToDatabase();
        const settingsCollection = db.collection('userSettings');
        
        const now = new Date();
        
        await settingsCollection.updateOne(
          { 
            userId,
            settingType: 'language'
          },
          { 
            $set: { 
              value: language,
              updatedAt: now
            },
            $setOnInsert: { 
              id: uuidv4(),
              createdAt: now
            }
          },
          { upsert: true }
        );
        
        return true;
      } catch (error) {
        console.error('MongoDB updateUserLanguagePreference error:', error);
        return false;
      }
    }
  },
  
  translations: {
    getAll: async () => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const translationsDoc = await translationsCollection.findOne({ type: 'translations' });
        
        if (translationsDoc) {
          return translationsDoc.data;
        }
          
        const defaultTranslations = {
          en: {},
          ar: {}
        };
        
        await translationsCollection.insertOne({
          id: uuidv4(),
          type: 'translations',
          data: defaultTranslations,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        return defaultTranslations;
      } catch (error) {
        console.error('Error fetching translations:', error);
        return { en: {}, ar: {} };
      }
    },
    
    update: async ({ data }: { data: Record<string, Record<string, string>> }) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const translationsDoc = await translationsCollection.findOne({ type: 'translations' });
        
        if (translationsDoc) {
          await translationsCollection.updateOne(
            { type: 'translations' },
            { 
              $set: { 
                data,
                updatedAt: new Date()
              } 
            }
          );
        } else {
          await translationsCollection.insertOne({
            id: uuidv4(),
            type: 'translations',
            data,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error updating translations:', error);
        return { success: false, error: 'Failed to update translations' };
      }
    }
  }
};