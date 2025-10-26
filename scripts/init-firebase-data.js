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

async function initFirebaseData() {
  try {
    console.log('🔥 Initialisation des données Firebase...');
    console.log('📍 Project ID:', process.env.FIREBASE_PROJECT_ID);

    // Créer des départements de base
    const departments = [
      {
        name: 'Musique',
        description: 'Département responsable de la musique et du chant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Multimédia',
        description: 'Département responsable de la technique et du multimédia',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accueil',
        description: 'Département responsable de l\'accueil et de l\'hospitalité',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Enseignement',
        description: 'Département responsable de l\'enseignement et de la formation',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Évangélisation',
        description: 'Département responsable de l\'évangélisation et du témoignage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('📝 Création des départements...');
    const createdDepartments = [];
    for (const dept of departments) {
      const docRef = await db.collection('departments').add(dept);
      createdDepartments.push({ id: docRef.id, ...dept });
      console.log(`✅ Département créé: ${dept.name} (${docRef.id})`);
    }

    // Créer un responsable par défaut
    console.log('👤 Création de l\'administrateur...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      name: 'Administrateur',
      email: 'admin@mjp.com',
      password: hashedPassword,
      role: 'responsable',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const adminRef = await db.collection('users').add(adminUser);
    console.log(`✅ Administrateur créé: admin@mjp.com / admin123 (${adminRef.id})`);

    // Créer quelques membres de test
    console.log('👥 Création des membres de test...');
    const musicDept = createdDepartments.find(d => d.name === 'Musique');
    const multimediaDept = createdDepartments.find(d => d.name === 'Multimédia');

    const testUsers = [
      {
        name: 'Jean Dupont',
        email: 'jean@mjp.com',
        password: await bcrypt.hash('password123', 12),
        role: 'membre',
        departmentId: musicDept.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marie Martin',
        email: 'marie@mjp.com',
        password: await bcrypt.hash('password123', 12),
        role: 'membre',
        departmentId: multimediaDept.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of testUsers) {
      const userRef = await db.collection('users').add(user);
      console.log(`✅ Membre créé: ${user.email} / password123 (${userRef.id})`);
    }

    // Créer quelques formations de test
    console.log('📚 Création des formations...');
    const formations = [
      {
        title: 'Introduction au Leadership',
        description: 'Formation de base sur les principes du leadership chrétien',
        videoUrl: 'https://player.vimeo.com/video/123456789',
        departmentId: musicDept.id,
        createdById: adminRef.id,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Gestion du Temps',
        description: 'Apprendre à gérer efficacement son temps dans le service',
        videoUrl: 'https://player.vimeo.com/video/123456790',
        departmentId: multimediaDept.id,
        createdById: adminRef.id,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const formation of formations) {
      const formationRef = await db.collection('formations').add(formation);
      console.log(`✅ Formation créée: ${formation.title} (${formationRef.id})`);
    }

    // Créer une évaluation de test
    console.log('📝 Création d\'une évaluation...');
    const firstFormationRef = await db.collection('formations')
      .where('title', '==', 'Introduction au Leadership')
      .limit(1)
      .get();

    if (!firstFormationRef.empty) {
      const firstFormation = firstFormationRef.docs[0];
      const evaluation = {
        formationId: firstFormation.id,
        questions: [
          {
            id: 'q1',
            text: 'Qu\'est-ce que le leadership selon vous ?',
            type: 'text',
            required: true
          },
          {
            id: 'q2',
            text: 'Quel est le rôle principal d\'un leader ?',
            type: 'multiple-choice',
            options: ['Diriger', 'Servir', 'Commander', 'Contrôler'],
            required: true
          },
          {
            id: 'q3',
            text: 'Évaluez votre niveau de confiance en tant que leader (1-5)',
            type: 'rating',
            required: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const evaluationRef = await db.collection('evaluations').add(evaluation);
      
      // Mettre à jour la formation avec l'évaluation
      await db.collection('formations').doc(firstFormation.id).update({
        evaluationId: evaluationRef.id,
        updatedAt: new Date()
      });
      
      console.log(`✅ Évaluation créée: ${evaluationRef.id}`);
    }

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('- admin@mjp.com / admin123 (Responsable)');
    console.log('- jean@mjp.com / password123 (Membre - Musique)');
    console.log('- marie@mjp.com / password123 (Membre - Multimédia)');
    console.log('\n📊 Données créées :');
    console.log('- 5 départements');
    console.log('- 2 formations avec vidéos');
    console.log('- 1 évaluation avec 3 questions');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

initFirebaseData();
