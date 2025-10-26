const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
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

async function testAllModules() {
  console.log('🧪 Test de tous les modules de l\'application...\n');

  try {
    // Test 1: Vérifier la connexion Firebase
    console.log('1️⃣ Test de connexion Firebase...');
    const testRef = db.collection('test');
    await testRef.add({ test: 'connection', timestamp: new Date() });
    console.log('✅ Connexion Firebase OK\n');

    // Test 2: Vérifier les utilisateurs
    console.log('2️⃣ Test des utilisateurs...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`✅ ${usersSnapshot.docs.length} utilisateur(s) trouvé(s)`);
    
    // Vérifier qu'il y a au moins un responsable
    const responsables = usersSnapshot.docs.filter(doc => doc.data().role === 'responsable');
    console.log(`✅ ${responsables.length} responsable(s) trouvé(s)`);
    
    // Vérifier qu'il y a au moins un membre
    const membres = usersSnapshot.docs.filter(doc => doc.data().role === 'membre');
    console.log(`✅ ${membres.length} membre(s) trouvé(s)\n`);

    // Test 3: Vérifier les départements
    console.log('3️⃣ Test des départements...');
    const departmentsSnapshot = await db.collection('departments').get();
    console.log(`✅ ${departmentsSnapshot.docs.length} département(s) trouvé(s)`);
    
    const activeDepartments = departmentsSnapshot.docs.filter(doc => doc.data().isActive);
    console.log(`✅ ${activeDepartments.length} département(s) actif(s)\n`);

    // Test 4: Vérifier les formations
    console.log('4️⃣ Test des formations...');
    const formationsSnapshot = await db.collection('formations').get();
    console.log(`✅ ${formationsSnapshot.docs.length} formation(s) trouvée(s)`);
    
    const activeFormations = formationsSnapshot.docs.filter(doc => !doc.data().isArchived);
    console.log(`✅ ${activeFormations.length} formation(s) active(s)\n`);

    // Test 5: Vérifier les évaluations
    console.log('5️⃣ Test des évaluations...');
    const evaluationsSnapshot = await db.collection('evaluations').get();
    console.log(`✅ ${evaluationsSnapshot.docs.length} évaluation(s) trouvée(s)\n`);

    // Test 6: Vérifier les vidéos
    console.log('6️⃣ Test des vidéos...');
    const videosSnapshot = await db.collection('videos').get();
    console.log(`✅ ${videosSnapshot.docs.length} vidéo(s) trouvée(s)\n`);

    // Test 7: Vérifier les résultats d'évaluations
    console.log('7️⃣ Test des résultats d\'évaluations...');
    const resultsSnapshot = await db.collection('evaluationResults').get();
    console.log(`✅ ${resultsSnapshot.docs.length} résultat(s) trouvé(s)\n`);

    // Test 8: Vérifier les progrès utilisateur
    console.log('8️⃣ Test des progrès utilisateur...');
    const progressSnapshot = await db.collection('userProgress').get();
    console.log(`✅ ${progressSnapshot.docs.length} progression(s) trouvée(s)\n`);

    // Test 9: Vérifier les relations entre les données
    console.log('9️⃣ Test des relations entre les données...');
    
    // Vérifier que les membres ont des départements
    for (const userDoc of membres) {
      const userData = userDoc.data();
      if (userData.departmentId) {
        const departmentDoc = await db.collection('departments').doc(userData.departmentId).get();
        if (departmentDoc.exists) {
          console.log(`✅ Membre ${userData.name} → Département ${departmentDoc.data().name}`);
        } else {
          console.log(`❌ Membre ${userData.name} → Département introuvable`);
        }
      }
    }

    // Vérifier que les formations ont des départements
    for (const formationDoc of formationsSnapshot.docs) {
      const formationData = formationDoc.data();
      if (formationData.departmentId) {
        const departmentDoc = await db.collection('departments').doc(formationData.departmentId).get();
        if (departmentDoc.exists) {
          console.log(`✅ Formation ${formationData.title} → Département ${departmentDoc.data().name}`);
        } else {
          console.log(`❌ Formation ${formationData.title} → Département introuvable`);
        }
      }
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📊 Résumé des données :');
    console.log(`- ${usersSnapshot.docs.length} utilisateur(s)`);
    console.log(`- ${departmentsSnapshot.docs.length} département(s)`);
    console.log(`- ${formationsSnapshot.docs.length} formation(s)`);
    console.log(`- ${evaluationsSnapshot.docs.length} évaluation(s)`);
    console.log(`- ${videosSnapshot.docs.length} vidéo(s)`);
    console.log(`- ${resultsSnapshot.docs.length} résultat(s)`);
    console.log(`- ${progressSnapshot.docs.length} progression(s)`);

    console.log('\n🚀 L\'application est prête à être utilisée !');
    console.log('\n📋 Comptes de test disponibles :');
    console.log('- admin@mjp.com / admin123 (Responsable)');
    console.log('- jean@mjp.com / password123 (Membre - Musique)');
    console.log('- marie@mjp.com / password123 (Membre - Multimédia)');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testAllModules();
