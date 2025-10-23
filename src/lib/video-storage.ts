import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export class VideoStorageService {
  private static instance: VideoStorageService;
  private db: any = null;
  private bucket: GridFSBucket | null = null;

  private constructor() {}

  public static getInstance(): VideoStorageService {
    if (!VideoStorageService.instance) {
      VideoStorageService.instance = new VideoStorageService();
    }
    return VideoStorageService.instance;
  }

  private async connectDB() {
    if (this.db && mongoose.connection.readyState === 1) {
      return;
    }
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    try {
      // Utiliser la connexion mongoose existante ou en créer une nouvelle
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI, {
          bufferCommands: false,
        });
      }
      
      this.db = mongoose.connection.db;
      this.bucket = new GridFSBucket(this.db, { bucketName: 'videos' });
      
      console.log('✅ Connexion MongoDB réussie pour GridFS via Mongoose');
    } catch (error) {
      console.error('❌ Erreur de connexion MongoDB:', error);
      throw error;
    }
  }

  /**
   * Upload une vidéo vers GridFS
   */
  async uploadVideo(
    file: Buffer, 
    filename: string, 
    metadata: {
      title: string;
      description?: string;
      uploadedBy: string;
      department?: string;
    }
  ): Promise<string> {
    try {
      console.log('🎬 Service GridFS - Début upload:', {
        filename,
        bufferSize: file.length,
        metadata
      });
      
      await this.connectDB();
      
      if (!this.bucket) {
        throw new Error('GridFSBucket not initialized');
      }
      
      // Générer un nom de fichier unique
      const fileId = new ObjectId();
      const fileExtension = filename.split('.').pop();
      const gridFSFilename = `${fileId.toString()}.${fileExtension}`;

      console.log('📤 Création du stream d\'upload:', {
        fileId: fileId.toString(),
        gridFSFilename,
        originalFilename: filename
      });

      // Upload vers GridFS
      const uploadStream = this.bucket.openUploadStream(gridFSFilename, {
        metadata: {
          ...metadata,
          originalFilename: filename,
          uploadedAt: new Date(),
        }
      });

      return new Promise((resolve, reject) => {
        uploadStream.end(file);
        
        uploadStream.on('finish', () => {
          console.log('✅ Upload GridFS terminé:', fileId.toString());
          resolve(fileId.toString());
        });
        
        uploadStream.on('error', (error) => {
          console.error('❌ Erreur upload GridFS:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload vers GridFS:', error);
      throw error;
    }
  }

  /**
   * Récupère une vidéo depuis GridFS
   */
  async getVideo(videoId: string): Promise<{
    stream: NodeJS.ReadableStream;
    metadata: any;
  }> {
    try {
      await this.connectDB();
      
      if (!this.bucket || !this.db) {
        throw new Error('Database not initialized');
      }
      
      const objectId = new ObjectId(videoId);
      
      // Vérifier que le fichier existe
      const files = await this.db.collection('videos.files').find({ _id: objectId }).toArray();
      if (files.length === 0) {
        throw new Error('Vidéo non trouvée');
      }

      const downloadStream = this.bucket.openDownloadStream(objectId);
      const metadata = files[0];

      return {
        stream: downloadStream,
        metadata
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la vidéo:', error);
      throw error;
    }
  }

  /**
   * Supprime une vidéo de GridFS
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(videoId);
      
      await bucket.delete(objectId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la vidéo:', error);
      throw error;
    }
  }

  /**
   * Récupère les métadonnées d'une vidéo
   */
  async getVideoMetadata(videoId: string): Promise<any> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(videoId);
      
      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length === 0) {
        throw new Error('Vidéo non trouvée');
      }

      return files[0];
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }

  /**
   * Liste toutes les vidéos d'un utilisateur
   */
  async getUserVideos(userId: string): Promise<any[]> {
    try {
      const bucket = await this.getBucket();
      
      const files = await bucket.find({ 
        'metadata.uploadedBy': userId 
      }).toArray();

      return files;
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos utilisateur:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier vidéo existe
   */
  async videoExists(videoId: string): Promise<boolean> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(videoId);
      
      const files = await bucket.find({ _id: objectId }).toArray();
      return files.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export const videoStorageService = VideoStorageService.getInstance();
