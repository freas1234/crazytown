import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fares139146:139146@cluster0.7dhheww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB = process.env.MONGODB_DB || 'CrazyTowens';

// Helper function to flatten nested object to key-value pairs
function flattenTranslations(obj: any, prefix = ''): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      result.push(...flattenTranslations(value, newKey));
    } else {
      result.push({ key: newKey, value: String(value) });
    }
  }
  
  return result;
}

interface TranslationDocument {
  id: string;
  key: string;
  language: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateTranslations(): Promise<void> {
  let client: MongoClient | null = null;
  
  try {
    console.log('🔄 Starting translation migration...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    const translationsCollection = db.collection<TranslationDocument>('translations');
    
    // Clear existing translations
    console.log('🗑️  Clearing existing translations...');
    await translationsCollection.deleteMany({});
    
    // Read JSON files
    console.log('📖 Reading translation files...');
    const enPath = path.join(process.cwd(), 'public', 'locales', 'en.json');
    const arPath = path.join(process.cwd(), 'public', 'locales', 'ar.json');
    
    if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
      throw new Error('Translation files not found. Please ensure en.json and ar.json exist in public/locales/');
    }
    
    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf8'));
    
    // Flatten translations
    console.log('🔄 Flattening translations...');
    const enFlattened = flattenTranslations(enTranslations);
    const arFlattened = flattenTranslations(arTranslations);
    
    // Prepare documents for insertion
    const documents: TranslationDocument[] = [];
    
    // Add English translations
    enFlattened.forEach(({ key, value }) => {
      documents.push({
        id: uuidv4(),
        key,
        language: 'en',
        value,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    // Add Arabic translations
    arFlattened.forEach(({ key, value }) => {
      documents.push({
        id: uuidv4(),
        key,
        language: 'ar',
        value,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    // Insert into database
    console.log(`📝 Inserting ${documents.length} translation records...`);
    const result = await translationsCollection.insertMany(documents);
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Statistics:`);
    console.log(`   - English translations: ${enFlattened.length}`);
    console.log(`   - Arabic translations: ${arFlattened.length}`);
    console.log(`   - Total records inserted: ${result.insertedCount}`);
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const totalCount = await translationsCollection.countDocuments();
    const enCount = await translationsCollection.countDocuments({ language: 'en' });
    const arCount = await translationsCollection.countDocuments({ language: 'ar' });
    
    console.log(`📈 Verification results:`);
    console.log(`   - Total records in database: ${totalCount}`);
    console.log(`   - English records: ${enCount}`);
    console.log(`   - Arabic records: ${arCount}`);
    
    if (totalCount === documents.length && enCount === enFlattened.length && arCount === arFlattened.length) {
      console.log('✅ Migration verification successful!');
    } else {
      console.log('⚠️  Migration verification failed. Please check the data.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the migration
if (require.main === module) {
  migrateTranslations();
}

export { migrateTranslations };
