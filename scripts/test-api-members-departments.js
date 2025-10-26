const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAPIMembersDepartments() {
  console.log('🧪 Test des API membres et départements...\n');

  try {
    // 1. Récupérer les départements
    console.log('1️⃣ Test GET /api/departements...');
    const departmentsResponse = await fetch(`${BASE_URL}/api/departements`);
    if (departmentsResponse.ok) {
      const departments = await departmentsResponse.json();
      console.log(`✅ ${departments.length} département(s) récupéré(s)`);
      
      // Afficher les départements avec leurs référents
      departments.forEach(dept => {
        console.log(`   - ${dept.name}: ${dept.referent ? dept.referent.name : 'Sans référent'}`);
      });
      
      // 2. Tester la mise à jour d'un département avec référent
      if (departments.length > 0) {
        console.log('\n2️⃣ Test PUT /api/departements/[id] avec référent...');
        
        const department = departments[0];
        const updateResponse = await fetch(`${BASE_URL}/api/departements/${department.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: department.name,
            description: department.description,
            referent: department.referent?.id || null, // Garder le référent actuel ou null
            isActive: department.isActive
          })
        });
        
        if (updateResponse.ok) {
          const updatedDepartment = await updateResponse.json();
          console.log(`✅ Département mis à jour: ${updatedDepartment.name}`);
          console.log(`   Référent: ${updatedDepartment.referent ? updatedDepartment.referent.name : 'Aucun'}`);
        } else {
          console.log(`❌ Erreur lors de la mise à jour: ${updateResponse.status}`);
          const errorText = await updateResponse.text();
          console.log(`   Détails: ${errorText}`);
        }
      }
    } else {
      console.log(`❌ Erreur GET /api/departements: ${departmentsResponse.status}`);
    }

    // 3. Récupérer les utilisateurs
    console.log('\n3️⃣ Test GET /api/users...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`✅ ${users.length} utilisateur(s) récupéré(s)`);
      
      // Afficher les utilisateurs avec leurs départements
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.role}): ${user.department ? user.department.name : 'Aucun département'}`);
      });
      
      // 4. Tester la mise à jour d'un utilisateur
      const member = users.find(u => u.role === 'membre');
      if (member) {
        console.log('\n4️⃣ Test PUT /api/users/[id]...');
        
        const updateUserResponse = await fetch(`${BASE_URL}/api/users/${member.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: member.name,
            email: member.email,
            departmentId: member.department?.id || null,
            isActive: member.isActive
          })
        });
        
        if (updateUserResponse.ok) {
          const updatedUser = await updateUserResponse.json();
          console.log(`✅ Utilisateur mis à jour: ${updatedUser.name}`);
          console.log(`   Département: ${updatedUser.department ? updatedUser.department.name : 'Aucun'}`);
        } else {
          console.log(`❌ Erreur lors de la mise à jour: ${updateUserResponse.status}`);
          const errorText = await updateUserResponse.text();
          console.log(`   Détails: ${errorText}`);
        }
      }
    } else {
      console.log(`❌ Erreur GET /api/users: ${usersResponse.status}`);
    }

    console.log('\n🎉 Tests des API terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
  }
}

testAPIMembersDepartments();
