import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import SecurityEvent from '../app/models/SecurityEvent';
import BlockedIP from '../app/models/BlockedIP';

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
    // Get all translations for a specific language
    getByLanguage: async (language: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const translations = await translationsCollection.find({ language }).toArray();
        
        // Convert array to nested object structure
        const result: Record<string, any> = {};
        
        translations.forEach((translation: any) => {
          const keys = translation.key.split('.');
          let current = result;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = translation.value;
        });
        
        return result;
      } catch (error) {
        console.error('Error fetching translations by language:', error);
        return {};
      }
    },
    
    // Get all translations (both languages)
    getAll: async () => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const translations = await translationsCollection.find({}).toArray();
        
        const result: Record<string, Record<string, any>> = {
          en: {},
          ar: {}
        };
        
        translations.forEach((translation: any) => {
          const keys = translation.key.split('.');
          let current = result[translation.language];
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = translation.value;
        });
        
        return result;
      } catch (error) {
        console.error('Error fetching all translations:', error);
        return { en: {}, ar: {} };
      }
    },
    
    // Get a specific translation by key and language
    getByKey: async (key: string, language: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const translation = await translationsCollection.findOne({ key, language });
        return translation?.value || '';
      } catch (error) {
        console.error('Error fetching translation by key:', error);
        return '';
      }
    },
    
    // Create or update a translation
    upsert: async (key: string, language: string, value: string, namespace?: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const now = new Date();
        const updateData = {
          key,
          language,
          value,
          namespace,
          updatedAt: now,
        };
        
        const result = await translationsCollection.findOneAndUpdate(
          { key, language },
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
        console.error('Error upserting translation:', error);
        return null;
      }
    },
    
    // Update multiple translations
    updateMultiple: async (translations: Array<{ key: string; language: string; value: string; namespace?: string }>) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const bulkOps = translations.map(translation => {
          const now = new Date();
          return {
            updateOne: {
              filter: { key: translation.key, language: translation.language },
              update: {
                $set: {
                  ...translation,
                  updatedAt: now
                },
                $setOnInsert: {
                  id: uuidv4(),
                  createdAt: now
                }
              },
              upsert: true
            }
          };
        });
        
        const result = await translationsCollection.bulkWrite(bulkOps);
        return { success: true, modifiedCount: result.modifiedCount, upsertedCount: result.upsertedCount };
      } catch (error) {
        console.error('Error updating multiple translations:', error);
        return { success: false, error: 'Failed to update translations' };
      }
    },
    
    // Delete a translation
    delete: async (key: string, language: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const result = await translationsCollection.deleteOne({ key, language });
        return result.deletedCount === 1;
      } catch (error) {
        console.error('Error deleting translation:', error);
        return false;
      }
    },
    
    // Delete all translations for a language
    deleteByLanguage: async (language: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const result = await translationsCollection.deleteMany({ language });
        return result.deletedCount;
      } catch (error) {
        console.error('Error deleting translations by language:', error);
        return 0;
      }
    },
    
    // Get all unique keys
    getAllKeys: async () => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const keys = await translationsCollection.distinct('key');
        return keys;
      } catch (error) {
        console.error('Error fetching all keys:', error);
        return [];
      }
    },
    
    // Search translations
    search: async (query: string, language?: string) => {
      try {
        const { db } = await connectToDatabase();
        const translationsCollection = db.collection('translations');
        
        const searchFilter: any = {
          $or: [
            { key: { $regex: query, $options: 'i' } },
            { value: { $regex: query, $options: 'i' } }
          ]
        };
        
        if (language) {
          searchFilter.language = language;
        }
        
        const translations = await translationsCollection.find(searchFilter).toArray();
        return translations;
      } catch (error) {
        console.error('Error searching translations:', error);
        return [];
      }
    }
  },
  
  // Security functions
  security: {
    // Security Events
    createEvent: async (eventData: {
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      ipAddress: string;
      userAgent?: string;
      details?: Record<string, any>;
    }) => {
      try {
        const event = new SecurityEvent({
          ...eventData,
          timestamp: new Date(),
          resolved: false
        });
        await event.save();
        return event;
      } catch (error) {
        console.error('Error creating security event:', error);
        throw error;
      }
    },

    getEvents: async (limit: number = 50, offset: number = 0) => {
      try {
        const events = await SecurityEvent.find({})
          .sort({ timestamp: -1 })
          .limit(limit)
          .skip(offset)
          .lean();
        return events;
      } catch (error) {
        console.error('Error fetching security events:', error);
        return [];
      }
    },

    getEventsByIP: async (ip: string, limit: number = 50) => {
      try {
        const events = await SecurityEvent.find({ ipAddress: ip })
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
        return events;
      } catch (error) {
        console.error('Error fetching events by IP:', error);
        return [];
      }
    },

    getEventStats: async () => {
      try {
        const totalEvents = await SecurityEvent.countDocuments();
        
        const eventsByType = await SecurityEvent.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        
        const eventsBySeverity = await SecurityEvent.aggregate([
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]);
        
        const topIPs = await SecurityEvent.aggregate([
          { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);

        return {
          totalEvents,
          eventsByType: eventsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          eventsBySeverity: eventsBySeverity.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          topIPs: topIPs.map(item => ({
            ip: item._id,
            count: item.count
          }))
        };
      } catch (error) {
        console.error('Error fetching security stats:', error);
        return {
          totalEvents: 0,
          eventsByType: {},
          eventsBySeverity: {},
          topIPs: []
        };
      }
    },

    // Blocked IPs
    blockIP: async (ip: string, reason: string, blockedBy: string, duration: number = 24 * 60 * 60 * 1000) => {
      try {
        // Check if already blocked
        const existing = await BlockedIP.findOne({ ip });
        if (existing) {
          throw new Error('IP is already blocked');
        }

        const blockedIP = new BlockedIP({
          ip,
          reason,
          blockedBy,
          duration,
          blockedAt: new Date()
        });

        await blockedIP.save();
        return blockedIP;
      } catch (error) {
        console.error('Error blocking IP:', error);
        throw error;
      }
    },

    unblockIP: async (ip: string, unblockedBy: string) => {
      try {
        const blockedIP = await BlockedIP.findOne({ ip });
        if (!blockedIP) {
          throw new Error('IP is not blocked');
        }

        blockedIP.unblockedAt = new Date();
        blockedIP.unblockedBy = unblockedBy;
        await blockedIP.save();

        return blockedIP;
      } catch (error) {
        console.error('Error unblocking IP:', error);
        throw error;
      }
    },

    getBlockedIPs: async () => {
      try {
        const blockedIPs = await BlockedIP.find({
          unblockedAt: { $exists: false }
        }).sort({ blockedAt: -1 }).lean();
        return blockedIPs;
      } catch (error) {
        console.error('Error fetching blocked IPs:', error);
        return [];
      }
    },

    isIPBlocked: async (ip: string) => {
      try {
        const blockedIP = await BlockedIP.findOne({
          ip,
          unblockedAt: { $exists: false }
        });
        return !!blockedIP;
      } catch (error) {
        console.error('Error checking if IP is blocked:', error);
        return false;
      }
    },

    deleteExpiredBlocks: async () => {
      try {
        const now = new Date();
        const result = await BlockedIP.deleteMany({
          $or: [
            { unblockedAt: { $exists: true } },
            {
              $expr: {
                $lt: [
                  { $add: ['$blockedAt', '$duration'] },
                  now
                ]
              }
            }
          ]
        });
        return result.deletedCount;
      } catch (error) {
        console.error('Error deleting expired blocks:', error);
        return 0;
      }
    }
  }
};