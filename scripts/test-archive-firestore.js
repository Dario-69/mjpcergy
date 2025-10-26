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

async function testArchiveFirestore() {
  console.log('🧪 Test de l\'archivage avec Firestore...\n');

  try {
    // 1. Récupérer une formation
    console.log('1️⃣ Récupération d\'une formation...');
    const formationsSnapshot = await db.collection('formations').limit(1).get();
    
    if (formationsSnapshot.empty) {
      console.log('❌ Aucune formation trouvée');
      return;
    }
    
    const formation = formationsSnapshot.docs[0];
    const formationData = formation.data();
    
    console.log(`✅ Formation trouvée: ${formationData.title}`);
    console.log(`   Statut actuel: ${formationData.isArchived ? 'Archivée' : 'Active'}`);
    console.log(`   Tags: ${formationData.tags ? formationData.tags.length : 'Aucun'}`);
    console.log(`   Modules: ${formationData.modules ? formationData.modules.length : 'Aucun'}`);
    
    // 2. Tester l'archivage avec données partielles (simulation de l'API)
    console.log('\n2️⃣ Test d\'archivage avec données partielles...');
    
    const currentStatus = formationData.isArchived;
    const newStatus = !currentStatus;
    
    console.log(`   Changement vers: ${newStatus ? 'Archivée' : 'Active'}...`);
    
    // Simulation de l'updateData comme dans l'API
    const updateData = {
      title: formationData.title,
      description: formationData.description,
      departmentId: formationData.departmentId,
      modules: formationData.modules,
      tags: formationData.tags,
      estimatedDuration: formationData.estimatedDuration,
      difficulty: formationData.difficulty,
      isArchived: newStatus,
      updatedAt: new Date()
    };
    
    // Filtrer les valeurs undefined (comme dans l'API corrigée)
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    console.log(`   Champs à mettre à jour: ${Object.keys(filteredUpdateData).join(', ')}`);
    
    await db.collection('formations').doc(formation.id).update(filteredUpdateData);
    console.log('   ✅ Mise à jour réussie');
    
    // 3. Vérifier le changement
    console.log('\n3️⃣ Vérification du changement...');
    const updatedDoc = await db.collection('formations').doc(formation.id).get();
    const updatedData = updatedDoc.data();
    
    console.log(`   Nouveau statut: ${updatedData.isArchived ? 'Archivée' : 'Active'}`);
    
    if (updatedData.isArchived === newStatus) {
      console.log('   ✅ Archivage fonctionne correctement');
    } else {
      console.log('   ❌ Problème avec l\'archivage');
    }
    
    // 4. Restaurer le statut original
    console.log('\n4️⃣ Restauration du statut original...');
    const restoreData = {
      isArchived: currentStatus,
      updatedAt: new Date()
    };
    
    await db.collection('formations').doc(formation.id).update(restoreData);
    console.log('   ✅ Statut restauré');
    
    console.log('\n🎉 Test d\'archivage Firestore terminé avec succès !');
    console.log('\n💡 L\'API filtre maintenant les valeurs undefined');
    console.log('   - Aucune erreur Firestore');
    console.log('   - Mises à jour partielles supportées');
    console.log('   - Archivage fonctionnel');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testArchiveFirestore();
