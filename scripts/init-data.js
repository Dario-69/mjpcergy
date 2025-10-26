const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import des modèles
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Formation = require('../src/models/Formation');
const Evaluation = require('../src/models/Evaluation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auxano';

async function initData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Créer des départements de base
    const departments = [
      {
        name: 'Musique',
        description: 'Département responsable de la musique et du chant',
        isActive: true
      },
      {
        name: 'Multimédia',
        description: 'Département responsable de la technique et du multimédia',
        isActive: true
      },
      {
        name: 'Accueil',
        description: 'Département responsable de l\'accueil et de l\'hospitalité',
        isActive: true
      },
      {
        name: 'Enseignement',
        description: 'Département responsable de l\'enseignement et de la formation',
        isActive: true
      },
      {
        name: 'Évangélisation',
        description: 'Département responsable de l\'évangélisation et du témoignage',
        isActive: true
      }
    ];

    // Supprimer les départements existants
    await Department.deleteMany({});
    console.log('Anciens départements supprimés');

    // Créer les nouveaux départements
    const createdDepartments = await Department.insertMany(departments);
    console.log(`${createdDepartments.length} départements créés`);

    // Créer un responsable par défaut
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'Administrateur',
      email: 'admin@auxano.com',
      password: hashedPassword,
      role: 'responsable',
      isActive: true
    });

    await adminUser.save();
    console.log('Utilisateur administrateur créé (admin@auxano.com / admin123)');

    // Créer quelques membres de test
    const musicDept = createdDepartments.find(d => d.name === 'Musique');
    const multimediaDept = createdDepartments.find(d => d.name === 'Multimédia');

    const testUsers = [
      {
        name: 'Jean Dupont',
        email: 'jean@auxano.com',
        password: await bcrypt.hash('password123', 12),
        role: 'membre',
        department: musicDept._id,
        isActive: true
      },
      {
        name: 'Marie Martin',
        email: 'marie@auxano.com',
        password: await bcrypt.hash('password123', 12),
        role: 'membre',
        department: multimediaDept._id,
        isActive: true
      }
    ];

    await User.insertMany(testUsers);
    console.log('Utilisateurs de test créés');

    // Créer quelques formations de test
    const formations = [
      {
        title: 'Introduction au Leadership',
        description: 'Formation de base sur les principes du leadership chrétien',
        videoUrl: 'https://player.vimeo.com/video/123456789',
        department: musicDept._id,
        createdBy: adminUser._id,
        isArchived: false
      },
      {
        title: 'Gestion du Temps',
        description: 'Apprendre à gérer efficacement son temps dans le service',
        videoUrl: 'https://player.vimeo.com/video/123456790',
        department: multimediaDept._id,
        createdBy: adminUser._id,
        isArchived: false
      }
    ];

    await Formation.insertMany(formations);
    console.log('Formations de test créées');

    // Créer une évaluation de test
    const firstFormation = await Formation.findOne({ title: 'Introduction au Leadership' });
    if (firstFormation) {
      const evaluation = new Evaluation({
        formation: firstFormation._id,
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
        ]
      });

      await evaluation.save();
      
      // Mettre à jour la formation avec l'évaluation
      await Formation.findByIdAndUpdate(firstFormation._id, { evaluation: evaluation._id });
      console.log('Évaluation de test créée');
    }

    console.log('Initialisation terminée avec succès !');
    console.log('\nComptes créés :');
    console.log('- admin@auxano.com / admin123 (Responsable)');
    console.log('- jean@auxano.com / password123 (Membre - Musique)');
    console.log('- marie@auxano.com / password123 (Membre - Multimédia)');
    console.log('\nDonnées créées :');
    console.log('- 5 départements');
    console.log('- 2 formations avec vidéos');
    console.log('- 1 évaluation avec 3 questions');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

initData();
