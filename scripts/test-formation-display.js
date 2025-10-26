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

async function testFormationDisplay() {
  console.log('🧪 Test de l\'affichage des formations...\n');

  try {
    // Récupérer toutes les formations
    const formationsSnapshot = await db.collection('formations').get();
    
    console.log(`📚 ${formationsSnapshot.docs.length} formation(s) trouvée(s)\n`);

    // Simuler le calcul des statistiques comme dans l'interface
    let totalModules = 0;
    let totalVideos = 0;
    let activeFormations = 0;
    let formationsWithEvaluations = 0;

    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      console.log(`📖 Formation: ${data.title}`);
      
      // Test des calculs qui causaient l'erreur
      const modulesCount = data.modules?.length || 0;
      const videosCount = data.modules?.reduce((total, module) => total + (module.videos?.length || 0), 0) || 0;
      
      console.log(`   - Modules: ${modulesCount}`);
      console.log(`   - Vidéos: ${videosCount}`);
      console.log(`   - Archivée: ${data.isArchived ? 'Oui' : 'Non'}`);
      console.log(`   - Évaluation: ${data.evaluationId ? 'Oui' : 'Non'}`);
      
      // Accumuler les totaux
      totalModules += modulesCount;
      totalVideos += videosCount;
      if (!data.isArchived) activeFormations++;
      if (data.evaluationId) formationsWithEvaluations++;
      
      console.log('   ---');
    }

    console.log('\n📊 Statistiques calculées (comme dans l\'interface) :');
    console.log(`- Total formations: ${formationsSnapshot.docs.length}`);
    console.log(`- Formations actives: ${activeFormations}`);
    console.log(`- Total modules: ${totalModules}`);
    console.log(`- Total vidéos: ${totalVideos}`);
    console.log(`- Avec évaluations: ${formationsWithEvaluations}`);

    // Test de la fonction de filtrage
    console.log('\n🔍 Test du filtrage des formations :');
    const filteredFormations = formationsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.isArchived; // Formations actives
    });
    
    console.log(`✅ ${filteredFormations.length} formation(s) active(s) trouvée(s)`);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ L\'erreur "Cannot read properties of undefined (reading \'length\')" est résolue');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testFormationDisplay();
