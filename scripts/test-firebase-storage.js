const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebaseStorage() {
  console.log('🔥 Testing Firebase Storage...');
  console.log('📍 Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  try {
    console.log('🔄 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase Storage initialized successfully!');
    
    // Test simple avec un fichier texte
    console.log('📝 Testing file upload...');
    const testContent = 'Hello Firebase Storage!';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    const testRef = ref(storage, 'test/test-file.txt');
    const snapshot = await uploadBytes(testRef, testBlob);
    console.log('✅ Upload successful!', snapshot.metadata.name);
    
    // Test récupération de l'URL
    console.log('🔗 Testing download URL...');
    const downloadURL = await getDownloadURL(testRef);
    console.log('✅ Download URL:', downloadURL);
    
    console.log('🎉 Firebase Storage test completed successfully!');
  } catch (error) {
    console.log('❌ Storage test failed:', error.message);
    console.log('🔍 Error details:', error);
  }
}

testFirebaseStorage();
