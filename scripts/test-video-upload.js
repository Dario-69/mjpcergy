const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function testVideoUpload() {
  let client;
  try {
    console.log('🎬 Test d\'upload de vidéo vers GridFS');
    
    // Connexion MongoDB
    console.log('🔗 Connexion à MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });
    
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'videos' });
    
    console.log('✅ Connexion MongoDB réussie');
    
    // Créer un buffer de test
    const testBuffer = Buffer.from('Test video content for GridFS');
    const filename = 'test-video.mp4';
    const fileId = new ObjectId();
    
    console.log('📤 Début de l\'upload...');
    console.log('📋 File ID:', fileId.toString());
    
    // Upload vers GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        title: 'Test Video',
        description: 'Video de test pour GridFS',
        uploadedBy: 'test-user-id',
        department: 'test-department-id',
        originalFilename: filename,
        uploadedAt: new Date(),
      }
    });
    
    uploadStream.end(testBuffer);
    
    uploadStream.on('finish', async () => {
      console.log('✅ Upload GridFS terminé !');
      console.log('🆔 Video ID:', uploadStream.id.toString());
      
      // Vérifier que la vidéo existe
      console.log('🔍 Vérification de l\'existence...');
      const files = await db.collection('videos.files').find({ _id: uploadStream.id }).toArray();
      console.log('📋 Vidéo trouvée:', files.length > 0);
      
      if (files.length > 0) {
        console.log('📋 Métadonnées:', files[0]);
        
        // Nettoyage
        console.log('🧹 Suppression de la vidéo de test...');
        await bucket.delete(uploadStream.id);
        console.log('✅ Vidéo de test supprimée');
      }
      
      console.log('🎉 Test d\'upload terminé avec succès !');
      await client.close();
    });
    
    uploadStream.on('error', (error) => {
      console.error('❌ Erreur upload GridFS:', error);
      client.close();
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('🔍 Détails:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (client) {
      await client.close();
    }
  }
}

testVideoUpload();
