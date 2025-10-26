import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (videoId) {
      // Récupérer une vidéo spécifique
      const videoDoc = await adminDb.collection('videos').doc(videoId).get();
      
      if (!videoDoc.exists) {
        return NextResponse.json(
          { message: "Vidéo non trouvée" },
          { status: 404 }
        );
      }

      const videoData = videoDoc.data();
      
      if (!videoData) {
        return NextResponse.json(
          { message: "Données de la vidéo non trouvées" },
          { status: 404 }
        );
      }
      
      // Retourner l'URL de téléchargement stockée dans Firestore
      return NextResponse.json({
        id: videoDoc.id,
        ...videoData,
        downloadURL: videoData.downloadURL
      });
    } else {
      // Récupérer toutes les vidéos
      const videosSnapshot = await adminDb.collection('videos').orderBy('createdAt', 'desc').get();
      
      const videos = [];
      for (const doc of videosSnapshot.docs) {
        const data = doc.data();
        
        // Récupérer l'URL de téléchargement
        try {
          const videoRef = ref(storage, `videos/${doc.id}`);
          const downloadURL = await getDownloadURL(videoRef);
          
          videos.push({
            id: doc.id,
            ...data,
            downloadURL
          });
        } catch (storageError) {
          console.error(`Erreur pour la vidéo ${doc.id}:`, storageError);
          // Ajouter la vidéo sans URL de téléchargement
          videos.push({
            id: doc.id,
            ...data,
            downloadURL: null
          });
        }
      }

      return NextResponse.json(videos);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des vidéos:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, formationId, uploadedBy, duration, fileSize } = await request.json();

    if (!title || !formationId || !uploadedBy) {
      return NextResponse.json(
        { message: "Titre, formation et uploader requis" },
        { status: 400 }
      );
    }

    // Vérifier que la formation existe
    const formationDoc = await adminDb.collection('formations').doc(formationId).get();
    if (!formationDoc.exists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const userDoc = await adminDb.collection('users').doc(uploadedBy).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 400 }
      );
    }

    const videoData = {
      title,
      description: description || null,
      formationId,
      uploadedById: uploadedBy,
      duration: duration || null,
      fileSize: fileSize || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('videos').add(videoData);

    const video = {
      id: docRef.id,
      ...videoData
    };

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la vidéo:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
