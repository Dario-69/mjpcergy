# Configuration MongoDB GridFS pour MJP Training App

## 🎯 Stockage Vidéo avec MongoDB GridFS

L'application utilise maintenant **MongoDB GridFS** pour stocker les vidéos directement dans votre base de données. Cette solution est :
- ✅ **Gratuite** - Pas de coûts supplémentaires
- ✅ **Simple** - Pas de configuration externe nécessaire
- ✅ **Sécurisée** - Les vidéos sont stockées dans votre base de données
- ✅ **Intégrée** - Fonctionne directement avec MongoDB

## 📋 Configuration Requise

### 1. **MongoDB Installé et Configuré**
Assurez-vous que MongoDB est installé et fonctionne :

```bash
# Vérifier que MongoDB est en cours d'exécution
mongosh --version

# Démarrer MongoDB (si nécessaire)
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### 2. **Variables d'Environnement**
Créez un fichier `.env.local` avec les variables suivantes :

```env
# Configuration de la base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/mjp-training

# Configuration Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Configuration JWT
JWT_SECRET=your_jwt_secret_here
```

### 3. **Test de la Configuration**
```bash
# Démarrer l'application
npm run dev

# Tester l'upload de vidéo
# Allez dans Dashboard > Formations > Créer une formation > Upload
```

## 🚀 Fonctionnalités Disponibles

### ✅ **Upload de Vidéos**
- Sélection de fichiers vidéo depuis l'ordinateur
- Support des formats : MP4, MOV, AVI, WMV, FLV
- Taille maximale : 100MB
- Stockage automatique dans GridFS

### ✅ **Lecteur Vidéo Intégré**
- Lecteur vidéo personnalisé avec contrôles
- Barre de progression
- Contrôles de volume et plein écran
- Streaming optimisé depuis MongoDB

### ✅ **Gestion des Vidéos**
- Métadonnées stockées avec chaque vidéo
- Association avec les utilisateurs et départements
- Suppression et gestion des vidéos

## 🔧 Structure des Données

### **Collection GridFS : `videos`**
```javascript
{
  _id: ObjectId,
  filename: "video_id.mp4",
  metadata: {
    title: "Nom de la vidéo",
    description: "Description de la vidéo",
    uploadedBy: "user_id",
    department: "department_id",
    originalFilename: "video_original.mp4",
    uploadedAt: Date
  },
  length: 12345678, // Taille en octets
  uploadDate: Date
}
```

## 📊 Avantages de GridFS

### **vs Vimeo :**
- ✅ **Gratuit** - Pas de coûts par vidéo
- ✅ **Contrôle total** - Vos données restent dans votre infrastructure
- ✅ **Pas de limites** - Pas de quotas ou restrictions
- ✅ **Configuration simple** - Pas de tokens API externes

### **vs Stockage de fichiers classique :**
- ✅ **Optimisé pour les gros fichiers** - Divise automatiquement les gros fichiers
- ✅ **Métadonnées intégrées** - Stockage des informations avec le fichier
- ✅ **Streaming efficace** - Lecture optimisée des vidéos
- ✅ **Sauvegarde automatique** - Inclus dans vos sauvegardes MongoDB

## 🛠️ Maintenance

### **Vérifier l'espace disque**
```bash
# Vérifier l'espace utilisé par MongoDB
db.stats()
```

### **Nettoyer les vidéos orphelines**
```javascript
// Script pour nettoyer les vidéos non référencées
// (à exécuter dans mongosh)
```

### **Sauvegarde**
```bash
# Sauvegarder la base de données (inclut les vidéos)
mongodump --db mjp-training --out backup/
```

## ❌ Problèmes Courants

### **Erreur "MongoDB connection failed"**
- Vérifiez que MongoDB est démarré
- Vérifiez l'URI de connexion dans `.env.local`
- Vérifiez que le port 27017 est accessible

### **Erreur "Video upload failed"**
- Vérifiez que le fichier n'excède pas 100MB
- Vérifiez que le format de vidéo est supporté
- Vérifiez l'espace disque disponible

### **Vidéo ne se charge pas**
- Vérifiez que l'ID de la vidéo est correct
- Vérifiez que la vidéo existe dans GridFS
- Vérifiez les logs de la console

## 📚 Documentation

- [MongoDB GridFS Documentation](https://docs.mongodb.com/manual/core/gridfs/)
- [GridFS avec Node.js](https://docs.mongodb.com/drivers/node/current/fundamentals/gridfs/)
- [Streaming de fichiers avec GridFS](https://docs.mongodb.com/drivers/node/current/fundamentals/gridfs/streaming/)

## 🎉 Résultat

Avec cette configuration, vous avez un système de stockage vidéo :
- **Entièrement gratuit**
- **Facile à configurer**
- **Intégré à votre base de données**
- **Optimisé pour les performances**

Plus besoin de services externes coûteux ! 🚀
