import { NextRequest, NextResponse } from "next/server";
import { videoStorageService } from "@/lib/video-storage";

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 API Upload vidéo - Début');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const department = formData.get('department') as string;

    console.log('📋 Données reçues:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      description,
      uploadedBy,
      department
    });

    if (!file || !title || !uploadedBy) {
      return NextResponse.json(
        { message: "Fichier, titre et utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { message: "Le fichier doit être une vidéo" },
        { status: 400 }
      );
    }

    // Vérifier la taille (limite de 100MB pour GridFS)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Le fichier est trop volumineux. Taille maximale : 100MB" },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    console.log('🔄 Conversion du fichier en buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('✅ Buffer créé, taille:', buffer.length);

    // Upload vers GridFS
    console.log('📤 Upload vers GridFS...');
    const videoId = await videoStorageService.uploadVideo(
      buffer,
      file.name,
      {
        title,
        description: description || '',
        uploadedBy,
        department: department || undefined,
      }
    );
    console.log('✅ Upload réussi, videoId:', videoId);

    return NextResponse.json({
      success: true,
      videoId,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'upload:", error);
    console.error("🔍 Détails de l'erreur:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { message: "Erreur lors de l'upload de la vidéo" },
      { status: 500 }
    );
  }
}
