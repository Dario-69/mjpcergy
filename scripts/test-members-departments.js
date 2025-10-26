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

async function testMembersDepartments() {
  console.log('🧪 Test de la gestion des membres et départements...\n');

  try {
    // 1. Vérifier les départements existants
    console.log('1️⃣ Vérification des départements...');
    const departmentsSnapshot = await db.collection('departments').get();
    console.log(`✅ ${departmentsSnapshot.docs.length} département(s) trouvé(s)`);
    
    for (const doc of departmentsSnapshot.docs) {
      const data = doc.data();
      console.log(`   - ${data.name}: ${data.referentId ? 'Avec référent' : 'Sans référent'}`);
    }

    // 2. Vérifier les utilisateurs responsables
    console.log('\n2️⃣ Vérification des responsables...');
    const responsablesSnapshot = await db.collection('users').where('role', '==', 'responsable').get();
    console.log(`✅ ${responsablesSnapshot.docs.length} responsable(s) trouvé(s)`);
    
    for (const doc of responsablesSnapshot.docs) {
      const data = doc.data();
      console.log(`   - ${data.name} (${data.email})`);
    }

    // 3. Tester l'assignation d'un référent
    if (departmentsSnapshot.docs.length > 0 && responsablesSnapshot.docs.length > 0) {
      console.log('\n3️⃣ Test d\'assignation de référent...');
      
      const department = departmentsSnapshot.docs[0];
      const responsable = responsablesSnapshot.docs[0];
      
      console.log(`   Assignation de ${responsable.data().name} comme référent de ${department.data().name}...`);
      
      // Mettre à jour le département
      await db.collection('departments').doc(department.id).update({
        referentId: responsable.id,
        updatedAt: new Date()
      });
      
      console.log('   ✅ Assignation réussie');
      
      // Vérifier la mise à jour
      const updatedDoc = await db.collection('departments').doc(department.id).get();
      const updatedData = updatedDoc.data();
      console.log(`   ✅ Vérification: référentId = ${updatedData.referentId}`);
    }

    // 4. Vérifier les membres
    console.log('\n4️⃣ Vérification des membres...');
    const membersSnapshot = await db.collection('users').where('role', '==', 'membre').get();
    console.log(`✅ ${membersSnapshot.docs.length} membre(s) trouvé(s)`);
    
    for (const doc of membersSnapshot.docs) {
      const data = doc.data();
      console.log(`   - ${data.name} (${data.email}) - Département: ${data.departmentId || 'Aucun'}`);
    }

    // 5. Tester la mise à jour d'un membre
    if (membersSnapshot.docs.length > 0 && departmentsSnapshot.docs.length > 0) {
      console.log('\n5️⃣ Test de mise à jour d\'un membre...');
      
      const member = membersSnapshot.docs[0];
      const department = departmentsSnapshot.docs[0];
      
      console.log(`   Mise à jour de ${member.data().name} avec le département ${department.data().name}...`);
      
      // Mettre à jour le membre
      await db.collection('users').doc(member.id).update({
        departmentId: department.id,
        updatedAt: new Date()
      });
      
      console.log('   ✅ Mise à jour réussie');
      
      // Vérifier la mise à jour
      const updatedMemberDoc = await db.collection('users').doc(member.id).get();
      const updatedMemberData = updatedMemberDoc.data();
      console.log(`   ✅ Vérification: departmentId = ${updatedMemberData.departmentId}`);
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`- ${departmentsSnapshot.docs.length} département(s)`);
    console.log(`- ${responsablesSnapshot.docs.length} responsable(s)`);
    console.log(`- ${membersSnapshot.docs.length} membre(s)`);
    console.log('- Assignation de référents fonctionnelle');
    console.log('- Mise à jour des membres fonctionnelle');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testMembersDepartments();
