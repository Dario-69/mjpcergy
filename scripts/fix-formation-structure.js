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

async function fixFormationStructure() {
  console.log('🔧 Correction de la structure des formations...\n');

  try {
    // Récupérer toutes les formations
    const formationsSnapshot = await db.collection('formations').get();
    
    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      console.log(`📖 Correction de: ${data.title}`);
      
      // Vérifier si la formation a des modules
      if (!data.modules || data.modules.length === 0) {
        console.log('   ⚠️  Aucun module trouvé, création d\'un module par défaut...');
        
        // Créer un module par défaut
        const defaultModule = {
          id: `module-${Date.now()}`,
          title: 'Module Principal',
          description: 'Module principal de la formation',
          order: 1,
          videos: []
        };
        
        // Si la formation a une videoUrl (ancienne structure), l'ajouter au module
        if (data.videoUrl) {
          console.log('   📹 Ajout de la vidéo existante au module...');
          const video = {
            id: `video-${Date.now()}`,
            title: data.title,
            description: data.description || '',
            videoId: data.videoUrl,
            order: 1
          };
          defaultModule.videos.push(video);
        }
        
        // Mettre à jour la formation
        await db.collection('formations').doc(doc.id).update({
          modules: [defaultModule],
          updatedAt: new Date()
        });
        
        console.log('   ✅ Module par défaut créé');
      } else {
        console.log('   ✅ Structure correcte');
      }
      
      console.log('   ---');
    }

    console.log('\n🎉 Correction terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

fixFormationStructure();
