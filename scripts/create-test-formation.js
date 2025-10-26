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

async function createTestFormation() {
  console.log('🎬 Création d\'une formation de test complète...\n');

  try {
    // Récupérer un département et un utilisateur
    const departmentsSnapshot = await db.collection('departments').limit(1).get();
    const usersSnapshot = await db.collection('users').where('role', '==', 'responsable').limit(1).get();
    
    if (departmentsSnapshot.empty || usersSnapshot.empty) {
      console.log('❌ Aucun département ou utilisateur responsable trouvé');
      return;
    }
    
    const department = departmentsSnapshot.docs[0];
    const user = usersSnapshot.docs[0];
    
    console.log(`📁 Département: ${department.data().name}`);
    console.log(`👤 Créateur: ${user.data().name}`);
    
    // Créer une formation de test avec modules et vidéos
    const testFormation = {
      title: 'Formation de Test Complète',
      description: 'Cette formation de test contient plusieurs modules avec des vidéos pour démontrer le fonctionnement complet du système.',
      departmentId: department.id,
      createdById: user.id,
      isArchived: false,
      tags: ['test', 'démonstration', 'formation'],
      modules: [
        {
          id: 'module-1',
          title: 'Introduction',
          description: 'Module d\'introduction à la formation',
          order: 1,
          videos: [
            {
              id: 'video-1',
              title: 'Bienvenue dans la formation',
              description: 'Vidéo d\'introduction',
              videoId: 'https://player.vimeo.com/video/123456789',
              order: 1,
              duration: 300
            },
            {
              id: 'video-2',
              title: 'Objectifs de la formation',
              description: 'Découverte des objectifs',
              videoId: 'https://player.vimeo.com/video/123456790',
              order: 2,
              duration: 240
            }
          ]
        },
        {
          id: 'module-2',
          title: 'Contenu Principal',
          description: 'Le cœur de la formation',
          order: 2,
          videos: [
            {
              id: 'video-3',
              title: 'Leçon 1: Les bases',
              description: 'Apprentissage des bases',
              videoId: 'https://player.vimeo.com/video/123456791',
              order: 1,
              duration: 600
            },
            {
              id: 'video-4',
              title: 'Leçon 2: Approfondissement',
              description: 'Approfondissement des concepts',
              videoId: 'https://player.vimeo.com/video/123456792',
              order: 2,
              duration: 720
            }
          ]
        },
        {
          id: 'module-3',
          title: 'Conclusion',
          description: 'Récapitulatif et conclusion',
          order: 3,
          videos: [
            {
              id: 'video-5',
              title: 'Récapitulatif',
              description: 'Récapitulatif de la formation',
              videoId: 'https://player.vimeo.com/video/123456793',
              order: 1,
              duration: 180
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Créer la formation
    const formationRef = await db.collection('formations').add(testFormation);
    console.log(`✅ Formation créée avec l'ID: ${formationRef.id}`);
    
    // Créer une évaluation pour cette formation
    const evaluation = {
      formationId: formationRef.id,
      questions: [
        {
          id: 'q1',
          text: 'Qu\'avez-vous appris dans cette formation ?',
          type: 'text',
          required: true
        },
        {
          id: 'q2',
          text: 'Évaluez la qualité de la formation (1-5)',
          type: 'rating',
          required: true
        },
        {
          id: 'q3',
          text: 'Recommanderez-vous cette formation ?',
          type: 'multiple-choice',
          options: ['Oui, absolument', 'Oui, probablement', 'Non, probablement pas', 'Non, absolument pas'],
          required: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const evaluationRef = await db.collection('evaluations').add(evaluation);
    
    // Mettre à jour la formation avec l'évaluation
    await db.collection('formations').doc(formationRef.id).update({
      evaluationId: evaluationRef.id,
      updatedAt: new Date()
    });
    
    console.log(`✅ Évaluation créée avec l'ID: ${evaluationRef.id}`);
    
    console.log('\n🎉 Formation de test créée avec succès !');
    console.log('\n📊 Détails de la formation :');
    console.log(`- Titre: ${testFormation.title}`);
    console.log(`- Modules: ${testFormation.modules.length}`);
    console.log(`- Vidéos totales: ${testFormation.modules.reduce((total, module) => total + module.videos.length, 0)}`);
    console.log(`- Évaluation: ${evaluation.questions.length} questions`);
    console.log(`- Département: ${department.data().name}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

createTestFormation();
