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

    // Récupérer la vidéo
    const { stream, metadata } = await videoStorageService.getVideo(videoId);

    // Définir les headers pour le streaming vidéo
    const headers = new Headers();
    headers.set('Content-Type', metadata.metadata?.type || 'video/mp4');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');

    // Convertir le stream en ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        
        stream.on('end', () => {
          controller.close();
        });
        
        stream.on('error', (error) => {
          controller.error(error);
        });
      }
    });

    return new Response(readableStream, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la vidéo:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération de la vidéo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Supprimer la vidéo
    await videoStorageService.deleteVideo(videoId);

    return NextResponse.json({
      success: true,
      message: "Vidéo supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de la vidéo:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la vidéo" },
      { status: 500 }
    );
  }
}