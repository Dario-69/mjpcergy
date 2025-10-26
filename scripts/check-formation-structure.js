const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function checkFormationStructure() {
  console.log('🔍 Vérification de la structure des formations...\n');

  try {
    // Récupérer toutes les formations
    const formationsSnapshot = await db.collection('formations').get();
    
    console.log(`📚 ${formationsSnapshot.docs.length} formation(s) trouvée(s)\n`);

    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      console.log(`📖 Formation: ${data.title}`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - Département: ${data.departmentId}`);
      console.log(`   - Créée par: ${data.createdById}`);
      console.log(`   - Modules: ${data.modules ? data.modules.length : 'Aucun'}`);
      
      if (data.modules && data.modules.length > 0) {
        data.modules.forEach((module, index) => {
          console.log(`     Module ${index + 1}: ${module.title}`);
          console.log(`       - Vidéos: ${module.videos ? module.videos.length : 'Aucune'}`);
          if (module.videos && module.videos.length > 0) {
            module.videos.forEach((video, videoIndex) => {
              console.log(`         Vidéo ${videoIndex + 1}: ${video.title}`);
              console.log(`           - ID: ${video.videoId || 'Aucun'}`);
              console.log(`           - Fichier: ${video.file ? 'Oui' : 'Non'}`);
            });
          }
        });
      } else {
        console.log('   ⚠️  Aucun module trouvé');
      }
      
      console.log('   ---');
    }

    // Vérifier les vidéos
    console.log('\n🎥 Vérification des vidéos...');
    const videosSnapshot = await db.collection('videos').get();
    console.log(`📹 ${videosSnapshot.docs.length} vidéo(s) trouvée(s)\n`);

    for (const doc of videosSnapshot.docs) {
      const data = doc.data();
      console.log(`🎬 Vidéo: ${data.title}`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - Fichier: ${data.fileName}`);
      console.log(`   - Taille: ${data.fileSize} bytes`);
      console.log(`   - URL: ${data.downloadURL ? 'Disponible' : 'Non disponible'}`);
      console.log('   ---');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkFormationStructure();
