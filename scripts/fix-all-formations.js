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

async function fixAllFormations() {
  console.log('🔧 Correction de toutes les formations...\n');

  try {
    // Récupérer toutes les formations
    const formationsSnapshot = await db.collection('formations').get();
    
    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      console.log(`📖 Vérification de: ${data.title}`);
      
      let needsUpdate = false;
      const updates = {};
      
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
        
        updates.modules = [defaultModule];
        needsUpdate = true;
      }
      
      // Vérifier que tous les modules ont des vidéos
      if (data.modules) {
        for (let i = 0; i < data.modules.length; i++) {
          const module = data.modules[i];
          if (!module.videos || module.videos.length === 0) {
            console.log(`   ⚠️  Module "${module.title}" sans vidéos, ajout d'une vidéo par défaut...`);
            if (!updates.modules) updates.modules = [...data.modules];
            
            const defaultVideo = {
              id: `video-${Date.now()}-${i}`,
              title: module.title || 'Vidéo par défaut',
              description: module.description || '',
              videoId: data.videoUrl || 'https://player.vimeo.com/video/123456789',
              order: 1
            };
            
            updates.modules[i] = {
              ...module,
              videos: [defaultVideo]
            };
            needsUpdate = true;
          }
        }
      }
      
      // Ajouter updatedAt si nécessaire
      if (needsUpdate) {
        updates.updatedAt = new Date();
        
        // Mettre à jour la formation
        await db.collection('formations').doc(doc.id).update(updates);
        console.log('   ✅ Formation mise à jour');
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

fixAllFormations();
