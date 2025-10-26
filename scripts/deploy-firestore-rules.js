const { exec } = require('child_process');
const path = require('path');

console.log('🔥 Déploiement des règles Firestore...');

// Chemin vers le fichier de règles
const rulesPath = path.join(__dirname, '..', 'firestore.rules');

// Commande Firebase CLI pour déployer les règles
const command = `firebase deploy --only firestore:rules --project ${process.env.FIREBASE_PROJECT_ID}`;

console.log('📝 Déploiement des règles...');
console.log('📍 Règles:', rulesPath);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('1. Installez Firebase CLI: npm install -g firebase-tools');
    console.log('2. Connectez-vous: firebase login');
    console.log('3. Déployez: firebase deploy --only firestore:rules');
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Avertissements:', stderr);
  }
  
  console.log('✅ Règles déployées avec succès!');
  console.log(stdout);
});
