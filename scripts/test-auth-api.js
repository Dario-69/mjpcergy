const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAuthAPI() {
  console.log('🔐 Test de l\'API d\'authentification...\n');

  try {
    // Test 1: Connexion avec un responsable
    console.log('1️⃣ Test de connexion responsable...');
    const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@auxano.com',
        password: 'admin123'
      })
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Connexion responsable réussie');
      console.log(`   - Nom: ${adminData.user.name}`);
      console.log(`   - Rôle: ${adminData.user.role}`);
      console.log(`   - Token reçu: ${adminData.accessToken ? 'Oui' : 'Non'}`);
      
      // Test 2: Connexion avec un membre
      console.log('\n2️⃣ Test de connexion membre...');
      const memberResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'jean@auxano.com',
          password: 'password123'
        })
      });

      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        console.log('✅ Connexion membre réussie');
        console.log(`   - Nom: ${memberData.user.name}`);
        console.log(`   - Rôle: ${memberData.user.role}`);
        console.log(`   - Département: ${memberData.user.department?.name || 'Aucun'}`);
        console.log(`   - Token reçu: ${memberData.accessToken ? 'Oui' : 'Non'}`);

        // Test 3: Test des API avec authentification
        console.log('\n3️⃣ Test des API avec authentification...');
        
        // Test API utilisateurs
        const usersResponse = await fetch(`${BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${adminData.accessToken}`
          }
        });
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          console.log(`✅ API utilisateurs: ${users.length} utilisateur(s) récupéré(s)`);
        } else {
          console.log('❌ API utilisateurs: Échec');
        }

        // Test API départements
        const departmentsResponse = await fetch(`${BASE_URL}/api/departements`, {
          headers: {
            'Authorization': `Bearer ${adminData.accessToken}`
          }
        });
        
        if (departmentsResponse.ok) {
          const departments = await departmentsResponse.json();
          console.log(`✅ API départements: ${departments.length} département(s) récupéré(s)`);
        } else {
          console.log('❌ API départements: Échec');
        }

        // Test API formations
        const formationsResponse = await fetch(`${BASE_URL}/api/formations`, {
          headers: {
            'Authorization': `Bearer ${memberData.accessToken}`
          }
        });
        
        if (formationsResponse.ok) {
          const formations = await formationsResponse.json();
          console.log(`✅ API formations: ${formations.length} formation(s) récupérée(s)`);
        } else {
          console.log('❌ API formations: Échec');
        }

        // Test API statistiques
        const statsResponse = await fetch(`${BASE_URL}/api/stats?type=admin`, {
          headers: {
            'Authorization': `Bearer ${adminData.accessToken}`
          }
        });
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log(`✅ API statistiques: Données récupérées`);
          console.log(`   - Total utilisateurs: ${stats.overview?.totalUsers || 0}`);
          console.log(`   - Total formations: ${stats.overview?.totalFormations || 0}`);
          console.log(`   - Total départements: ${stats.overview?.totalDepartments || 0}`);
        } else {
          console.log('❌ API statistiques: Échec');
        }

      } else {
        console.log('❌ Connexion membre échouée');
      }
    } else {
      console.log('❌ Connexion responsable échouée');
    }

    console.log('\n🎉 Tests d\'authentification terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests d\'authentification:', error.message);
    console.log('\n💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
  }
}

testAuthAPI();
