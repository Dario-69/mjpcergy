const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function testMongoDBConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  console.log('🔗 Testing MongoDB connection...');
  console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

  let client;
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });

    console.log('🔄 Connecting...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test database access
    const db = client.db();
    console.log('📊 Database:', db.databaseName);
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Test GridFS
    const { GridFSBucket } = require('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'videos' });
    console.log('🗂️ GridFS bucket created successfully');
    
    console.log('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testMongoDBConnection();
