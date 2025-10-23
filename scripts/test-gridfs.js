const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mjp-training';

async function testGridFS() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie');

    const db = mongoose.connection.db;
    console.log('📊 Base de données:', db.databaseName);

    // Test GridFS
    console.log('🗂️  Test GridFS...');
    const bucket = new GridFSBucket(db, { bucketName: 'videos' });
    console.log('✅ Bucket GridFS créé');

    // Test d'upload d'un petit fichier
    console.log('📤 Test d\'upload...');
    const testData = Buffer.from('Test video content');
    const uploadStream = bucket.openUploadStream('test-video.mp4', {
      metadata: {
        title: 'Test Video',
        description: 'Video de test pour GridFS',
        uploadedBy: 'test-user',
        uploadedAt: new Date()
      }
    });

    uploadStream.end(testData);

    uploadStream.on('finish', async () => {
      console.log('✅ Upload test réussi, ID:', uploadStream.id.toString());

      // Test de récupération
      console.log('📥 Test de récupération...');
      const downloadStream = bucket.openDownloadStream(uploadStream.id);
      let data = '';
      
      downloadStream.on('data', (chunk) => {
        data += chunk.toString();
      });

      downloadStream.on('end', async () => {
        console.log('✅ Récupération test réussie');
        console.log('📄 Contenu récupéré:', data);

        // Nettoyage
        console.log('🧹 Nettoyage...');
        await bucket.delete(uploadStream.id);
        console.log('✅ Fichier de test supprimé');

        await mongoose.disconnect();
        console.log('🔌 Déconnexion MongoDB');
        console.log('🎉 Test GridFS terminé avec succès !');
      });

      downloadStream.on('error', (error) => {
        console.error('❌ Erreur lors de la récupération:', error);
      });
    });

    uploadStream.on('error', (error) => {
      console.error('❌ Erreur lors de l\'upload:', error);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Vérifier les variables d'environnement
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI n\'est pas défini dans les variables d\'environnement');
  console.log('💡 Assurez-vous que votre fichier .env.local contient:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/mjp-training');
  process.exit(1);
}

testGridFS();
