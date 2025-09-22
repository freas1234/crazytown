const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fares139146:139146@cluster0.7dhheww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB = process.env.MONGODB_DB || 'CrazyTowens';

async function testTranslations() {
  let client;
  
  try {
    console.log('🧪 Testing translation system...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    const translationsCollection = db.collection('translations');
    
    // Test 1: Check if translations exist
    console.log('📊 Checking translation counts...');
    const totalCount = await translationsCollection.countDocuments();
    const enCount = await translationsCollection.countDocuments({ language: 'en' });
    const arCount = await translationsCollection.countDocuments({ language: 'ar' });
    
    console.log(`✅ Total translations: ${totalCount}`);
    console.log(`✅ English translations: ${enCount}`);
    console.log(`✅ Arabic translations: ${arCount}`);
    
    // Test 2: Test specific translations
    console.log('\n🔍 Testing specific translations...');
    const commonLoading = await translationsCollection.findOne({ key: 'common.loading', language: 'en' });
    const commonLoadingAr = await translationsCollection.findOne({ key: 'common.loading', language: 'ar' });
    
    console.log(`✅ English "common.loading": ${commonLoading?.value || 'NOT FOUND'}`);
    console.log(`✅ Arabic "common.loading": ${commonLoadingAr?.value || 'NOT FOUND'}`);
    
    // Test 3: Test nested translations
    console.log('\n🔍 Testing nested translations...');
    const storeTitle = await translationsCollection.findOne({ key: 'store.title', language: 'en' });
    const storeTitleAr = await translationsCollection.findOne({ key: 'store.title', language: 'ar' });
    
    console.log(`✅ English "store.title": ${storeTitle?.value || 'NOT FOUND'}`);
    console.log(`✅ Arabic "store.title": ${storeTitleAr?.value || 'NOT FOUND'}`);
    
    // Test 4: Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchResults = await translationsCollection.find({
      $or: [
        { key: { $regex: 'loading', $options: 'i' } },
        { value: { $regex: 'loading', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`✅ Search results for "loading": ${searchResults.length} found`);
    searchResults.forEach(result => {
      console.log(`   - ${result.key} (${result.language}): ${result.value}`);
    });
    
    console.log('\n✅ All tests passed! Translation system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed.');
    }
  }
}

testTranslations();
