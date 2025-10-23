import { NextRequest, NextResponse } from "next/server";
import { videoStorageService } from "@/lib/video-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;

    if (!videoId) {
      return NextResponse.json(
        { message: "ID de vidéo requis" },
        { status: 400 }
      );
    }

    // Vérifier que la vidéo existe
    const exists = await videoStorageService.videoExists(videoId);
    if (!exists) {
      return NextResponse.json(
        { message: "Vidéo non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les métadonnées
    const metadata = await videoStorageService.getVideoMetadata(videoId);

    return NextResponse.json({
      success: true,
      videoId,
      filename: metadata.filename,
      size: metadata.length,
      uploadDate: metadata.uploadDate,
      metadata: metadata.metadata
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des métadonnées:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des métadonnées" },
      { status: 500 }
    );
  }
}
