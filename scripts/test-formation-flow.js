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

async function testFormationFlow() {
  console.log('🧪 Test du flux complet des formations...\n');

  try {
    // 1. Vérifier les formations disponibles
    console.log('1️⃣ Vérification des formations...');
    const formationsSnapshot = await db.collection('formations').get();
    console.log(`✅ ${formationsSnapshot.docs.length} formation(s) disponible(s)`);
    
    // 2. Vérifier qu'au moins une formation a des modules
    let formationWithModules = null;
    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      if (data.modules && data.modules.length > 0) {
        formationWithModules = { id: doc.id, ...data };
        break;
      }
    }
    
    if (formationWithModules) {
      console.log(`✅ Formation avec modules trouvée: ${formationWithModules.title}`);
      console.log(`   - Modules: ${formationWithModules.modules.length}`);
      const totalVideos = formationWithModules.modules.reduce((total, module) => total + module.videos.length, 0);
      console.log(`   - Vidéos totales: ${totalVideos}`);
    } else {
      console.log('❌ Aucune formation avec modules trouvée');
      return;
    }
    
    // 3. Vérifier les utilisateurs membres
    console.log('\n2️⃣ Vérification des utilisateurs membres...');
    const membersSnapshot = await db.collection('users').where('role', '==', 'membre').get();
    console.log(`✅ ${membersSnapshot.docs.length} membre(s) trouvé(s)`);
    
    if (membersSnapshot.docs.length > 0) {
      const member = membersSnapshot.docs[0];
      const memberData = member.data();
      console.log(`✅ Membre de test: ${memberData.name} (${memberData.email})`);
      console.log(`   - Département: ${memberData.departmentId || 'Aucun'}`);
      
      // 4. Créer un progrès de test pour ce membre
      console.log('\n3️⃣ Création d\'un progrès de test...');
      const testProgress = {
        userId: member.id,
        formationId: formationWithModules.id,
        status: 'in-progress',
        progress: 25,
        completedVideos: [formationWithModules.modules[0].videos[0].id],
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const progressRef = await db.collection('userProgress').add(testProgress);
      console.log(`✅ Progrès créé avec l'ID: ${progressRef.id}`);
      console.log(`   - Statut: ${testProgress.status}`);
      console.log(`   - Progression: ${testProgress.progress}%`);
      console.log(`   - Vidéos terminées: ${testProgress.completedVideos.length}`);
    }
    
    // 5. Vérifier les évaluations
    console.log('\n4️⃣ Vérification des évaluations...');
    const evaluationsSnapshot = await db.collection('evaluations').get();
    console.log(`✅ ${evaluationsSnapshot.docs.length} évaluation(s) trouvée(s)`);
    
    if (evaluationsSnapshot.docs.length > 0) {
      const evaluation = evaluationsSnapshot.docs[0];
      const evaluationData = evaluation.data();
      console.log(`✅ Évaluation: ${evaluationData.questions.length} question(s)`);
    }
    
    console.log('\n🎉 Test du flux complet terminé avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`- ${formationsSnapshot.docs.length} formation(s) disponible(s)`);
    console.log(`- ${membersSnapshot.docs.length} membre(s) disponible(s)`);
    console.log(`- ${evaluationsSnapshot.docs.length} évaluation(s) disponible(s)`);
    console.log('- 1 progrès de test créé');
    
    console.log('\n🚀 L\'application est prête pour les tests !');
    console.log('\n💡 Pour tester :');
    console.log('1. Connectez-vous avec un compte membre');
    console.log('2. Allez dans "Mes Formations"');
    console.log('3. Cliquez sur "Commencer" pour une formation');
    console.log('4. Sélectionnez une vidéo pour la regarder');
    console.log('5. La progression sera automatiquement sauvegardée');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testFormationFlow();
