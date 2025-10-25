import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const formationId = formData.get('formationId') as string;

    if (!file || !title || !uploadedBy) {
      return NextResponse.json(
        { message: "Fichier, titre et uploader requis" },
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

    // Vérifier que la formation existe (si fournie)
    if (formationId) {
      const formationDoc = await adminDb.collection('formations').doc(formationId).get();
      if (!formationDoc.exists) {
        return NextResponse.json(
          { message: "Formation non trouvée" },
          { status: 400 }
        );
      }
    }

    // Uploader le fichier vers Firebase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const videoRef = ref(storage, `videos/${fileName}`);
    
    const fileBuffer = await file.arrayBuffer();
    const uploadResult = await uploadBytes(videoRef, fileBuffer);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Enregistrer les métadonnées de la vidéo dans Firestore
    const videoData = {
      title,
      description: description || null,
      fileName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      downloadURL,
      uploadedById: uploadedBy,
      formationId: formationId || null,
      duration: null, // À calculer côté client si possible
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const videoDocRef = await adminDb.collection('videos').add(videoData);

    return NextResponse.json({
      message: "Vidéo uploadée avec succès",
      videoId: videoDocRef.id,
      downloadURL,
      fileName
    });

  } catch (error) {
    console.error("Erreur lors de l'upload de la vidéo:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'upload de la vidéo" },
      { status: 500 }
    );
  }
}
