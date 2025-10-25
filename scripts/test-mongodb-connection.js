const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testMongoDBConnection() {
  console.log('🔗 Testing MongoDB connection...');
  console.log('📍 URI:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
  
  try {
    console.log('🔄 Connecting...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!');
    
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('📁 Collections:', Object.keys(mongoose.connection.db.collections));
    
    console.log('🎉 MongoDB connection test completed successfully!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔍 Error details:', error);
  } finally {
    console.log('🔌 Connection closed');
    await mongoose.disconnect();
  }
}

testMongoDBConnection();

