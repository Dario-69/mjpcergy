const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAPIRoutes() {
  console.log('🧪 Test des routes API avec paramètres dynamiques...\n');

  try {
    // Test 1: Récupérer un département par ID
    console.log('1️⃣ Test GET /api/departements/[id]...');
    const departmentsResponse = await fetch(`${BASE_URL}/api/departements`);
    if (departmentsResponse.ok) {
      const departments = await departmentsResponse.json();
      if (departments.length > 0) {
        const departmentId = departments[0].id;
        const departmentResponse = await fetch(`${BASE_URL}/api/departements/${departmentId}`);
        if (departmentResponse.ok) {
          console.log(`✅ GET /api/departements/${departmentId} - OK`);
        } else {
          console.log(`❌ GET /api/departements/${departmentId} - Erreur: ${departmentResponse.status}`);
        }
      }
    }

    // Test 2: Récupérer un utilisateur par ID
    console.log('\n2️⃣ Test GET /api/users/[id]...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users.length > 0) {
        const userId = users[0].id;
        const userResponse = await fetch(`${BASE_URL}/api/users/${userId}`);
        if (userResponse.ok) {
          console.log(`✅ GET /api/users/${userId} - OK`);
        } else {
          console.log(`❌ GET /api/users/${userId} - Erreur: ${userResponse.status}`);
        }
      }
    }

    // Test 3: Récupérer une formation par ID
    console.log('\n3️⃣ Test GET /api/formations/[id]...');
    const formationsResponse = await fetch(`${BASE_URL}/api/formations`);
    if (formationsResponse.ok) {
      const formations = await formationsResponse.json();
      if (formations.length > 0) {
        const formationId = formations[0].id;
        const formationResponse = await fetch(`${BASE_URL}/api/formations/${formationId}`);
        if (formationResponse.ok) {
          console.log(`✅ GET /api/formations/${formationId} - OK`);
        } else {
          console.log(`❌ GET /api/formations/${formationId} - Erreur: ${formationResponse.status}`);
        }
      }
    }

    // Test 4: Test de mise à jour d'un département
    console.log('\n4️⃣ Test PUT /api/departements/[id]...');
    const departmentsResponse2 = await fetch(`${BASE_URL}/api/departements`);
    if (departmentsResponse2.ok) {
      const departments = await departmentsResponse2.json();
      if (departments.length > 0) {
        const departmentId = departments[0].id;
        const updateResponse = await fetch(`${BASE_URL}/api/departements/${departmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: departments[0].name, // Garder le même nom
            description: departments[0].description, // Garder la même description
            isActive: departments[0].isActive // Garder le même statut
          })
        });
        if (updateResponse.ok) {
          console.log(`✅ PUT /api/departements/${departmentId} - OK`);
        } else {
          console.log(`❌ PUT /api/departements/${departmentId} - Erreur: ${updateResponse.status}`);
          const errorText = await updateResponse.text();
          console.log(`   Détails: ${errorText}`);
        }
      }
    }

    console.log('\n🎉 Tests des routes API terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
  }
}

testAPIRoutes();
