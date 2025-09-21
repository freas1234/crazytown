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

  try {
    // Try with minimal options first
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // If the first attempt fails, try with different SSL settings
    try {
      console.log('Retrying MongoDB connection with different SSL settings...');
      
      const client = await MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      });
      
      const db = client.db(MONGODB_DB);

      cachedClient = client;
      cachedDb = db;

      return { client, db };
    } catch (retryError) {
      console.error('MongoDB retry connection also failed:', retryError);
      throw error; // Throw the original error
    }
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

    

    const heroContent = await contentCollection.findOne({ type: 'hero' });
    const featuredContent = await contentCollection.findOne({ type: 'featuredCards' });
    const metadataContent = await contentCollection.findOne({ type: 'metadata' });
    
    
    
    const maintenanceSetting = await settingsCollection.findOne({ key: 'maintenanceMode' });
    if (maintenanceSetting) {
      const { loadMaintenanceModeFromDb } = require('./maintenance');
      await loadMaintenanceModeFromDb();
    }
    

    const productCategoriesCount = await productCategoriesCollection.countDocuments();
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
        
        const user = await usersCollection.findOne(query);
        
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