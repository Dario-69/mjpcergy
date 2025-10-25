const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase connection...');
  console.log('📍 Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  try {
    console.log('🔄 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully!');
    
    // Test simple write
    console.log('📝 Testing write operation...');
    const testRef = collection(db, 'test');
    const docRef = await addDoc(testRef, {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('✅ Write successful! Document ID:', docRef.id);
    
    // Test simple read
    console.log('📖 Testing read operation...');
    const snapshot = await getDocs(testRef);
    console.log('✅ Read successful! Documents found:', snapshot.size);
    
    console.log('🎉 Firebase connection test completed successfully!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔍 Error details:', error);
  }
}

testFirebaseConnection();
