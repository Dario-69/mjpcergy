const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testFormationArchiveAPI() {
  console.log('🧪 Test de l\'archivage des formations via API...\n');

  try {
    // 1. Récupérer les formations
    console.log('1️⃣ Récupération des formations...');
    const formationsResponse = await fetch(`${BASE_URL}/api/formations`);
    if (formationsResponse.ok) {
      const formations = await formationsResponse.json();
      console.log(`✅ ${formations.length} formation(s) récupérée(s)`);
      
      // Afficher les formations avec leur statut
      formations.forEach(formation => {
        console.log(`   - ${formation.title}: ${formation.isArchived ? 'Archivée' : 'Active'}`);
      });
      
      // 2. Tester l'archivage d'une formation
      if (formations.length > 0) {
        console.log('\n2️⃣ Test d\'archivage d\'une formation...');
        
        const formation = formations[0];
        const currentStatus = formation.isArchived;
        
        console.log(`   Formation: ${formation.title}`);
        console.log(`   Statut actuel: ${currentStatus ? 'Archivée' : 'Active'}`);
        console.log(`   Changement vers: ${!currentStatus ? 'Archivée' : 'Active'}...`);
        
        // Tester l'archivage
        const archiveResponse = await fetch(`${BASE_URL}/api/formations/${formation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isArchived: !currentStatus
          })
        });
        
        if (archiveResponse.ok) {
          const updatedFormation = await archiveResponse.json();
          console.log(`✅ Formation mise à jour: ${updatedFormation.title}`);
          console.log(`   Nouveau statut: ${updatedFormation.isArchived ? 'Archivée' : 'Active'}`);
          
          // Restaurer le statut original
          console.log('\n3️⃣ Restauration du statut original...');
          const restoreResponse = await fetch(`${BASE_URL}/api/formations/${formation.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isArchived: currentStatus
            })
          });
          
          if (restoreResponse.ok) {
            console.log('✅ Statut restauré avec succès');
          } else {
            console.log(`❌ Erreur lors de la restauration: ${restoreResponse.status}`);
          }
        } else {
          console.log(`❌ Erreur lors de l'archivage: ${archiveResponse.status}`);
          const errorText = await archiveResponse.text();
          console.log(`   Détails: ${errorText}`);
        }
      }
    } else {
      console.log(`❌ Erreur GET /api/formations: ${formationsResponse.status}`);
    }

    console.log('\n🎉 Test d\'archivage terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
  }
}

testFormationArchiveAPI();
