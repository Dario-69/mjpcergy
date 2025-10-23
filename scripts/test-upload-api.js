const fs = require('fs');
const path = require('path');

// Créer un fichier de test temporaire
const testVideoPath = path.join(__dirname, 'test-video.txt');
fs.writeFileSync(testVideoPath, 'Test video content');

// Test de l'API d'upload
async function testUploadAPI() {
  try {
    console.log('🧪 Test de l\'API d\'upload...');
    
    const formData = new FormData();
    const file = new File(['Test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    formData.append('file', file);
    formData.append('title', 'Test Video');
    formData.append('description', 'Video de test');
    formData.append('uploadedBy', 'test-user-id');
    formData.append('department', 'test-department-id');

    const response = await fetch('http://localhost:3000/api/videos/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload réussi:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erreur upload:', error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Nettoyage
    if (fs.existsSync(testVideoPath)) {
      fs.unlinkSync(testVideoPath);
    }
  }
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/formations');
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible. Démarrez le serveur avec: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🚀 Test de l\'API d\'upload de vidéos');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testUploadAPI();
}

main();
