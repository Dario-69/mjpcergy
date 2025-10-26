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

async function testFormationArchive() {
  console.log('🧪 Test de l\'archivage des formations...\n');

  try {
    // 1. Vérifier les formations existantes
    console.log('1️⃣ Vérification des formations...');
    const formationsSnapshot = await db.collection('formations').get();
    console.log(`✅ ${formationsSnapshot.docs.length} formation(s) trouvée(s)`);
    
    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      console.log(`   - ${data.title}: ${data.isArchived ? 'Archivée' : 'Active'}`);
    }

    // 2. Tester l'archivage d'une formation
    if (formationsSnapshot.docs.length > 0) {
      console.log('\n2️⃣ Test d\'archivage d\'une formation...');
      
      const formation = formationsSnapshot.docs[0];
      const currentStatus = formation.data().isArchived;
      
      console.log(`   Formation: ${formation.data().title}`);
      console.log(`   Statut actuel: ${currentStatus ? 'Archivée' : 'Active'}`);
      console.log(`   Changement vers: ${!currentStatus ? 'Archivée' : 'Active'}...`);
      
      // Mettre à jour le statut d'archivage
      await db.collection('formations').doc(formation.id).update({
        isArchived: !currentStatus,
        updatedAt: new Date()
      });
      
      console.log('   ✅ Statut mis à jour');
      
      // Vérifier la mise à jour
      const updatedDoc = await db.collection('formations').doc(formation.id).get();
      const updatedData = updatedDoc.data();
      console.log(`   ✅ Vérification: isArchived = ${updatedData.isArchived}`);
      
      // Remettre le statut original
      console.log('\n3️⃣ Restauration du statut original...');
      await db.collection('formations').doc(formation.id).update({
        isArchived: currentStatus,
        updatedAt: new Date()
      });
      console.log('   ✅ Statut restauré');
    }

    // 4. Vérifier les statistiques
    console.log('\n4️⃣ Vérification des statistiques...');
    const allFormations = [];
    for (const doc of formationsSnapshot.docs) {
      allFormations.push(doc.data());
    }
    
    const activeFormations = allFormations.filter(f => !f.isArchived);
    const archivedFormations = allFormations.filter(f => f.isArchived);
    
    console.log(`   - Formations actives: ${activeFormations.length}`);
    console.log(`   - Formations archivées: ${archivedFormations.length}`);
    console.log(`   - Total: ${allFormations.length}`);

    console.log('\n🎉 Test d\'archivage terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testFormationArchive();
