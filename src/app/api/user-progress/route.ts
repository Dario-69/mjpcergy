import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer les progrès de l'utilisateur
    const progressSnapshot = await adminDb.collection('userProgress')
      .where('userId', '==', userId)
      .get();

    const progress = [];
    for (const doc of progressSnapshot.docs) {
      const data = doc.data();
      progress.push({
        id: doc.id,
        formationId: data.formationId,
        userId: data.userId,
        status: data.status,
        progress: data.progress,
        completedAt: data.completedAt,
        lastAccessedAt: data.lastAccessedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erreur lors de la récupération des progrès:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, formationId, status, progress, completedAt, completedVideos } = await request.json();

    if (!userId || !formationId) {
      return NextResponse.json(
        { message: "ID utilisateur et formation requis" },
        { status: 400 }
      );
    }

    // Vérifier si un progrès existe déjà
    const existingProgress = await adminDb.collection('userProgress')
      .where('userId', '==', userId)
      .where('formationId', '==', formationId)
      .get();

    if (!existingProgress.empty) {
      // Mettre à jour le progrès existant
      const doc = existingProgress.docs[0];
      await doc.ref.update({
        status,
        progress,
        completedAt: completedAt || null,
        completedVideos: completedVideos || [],
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      });

      return NextResponse.json({
        message: "Progrès mis à jour",
        id: doc.id
      });
    } else {
      // Créer un nouveau progrès
      const progressData = {
        userId,
        formationId,
        status,
        progress,
        completedAt: completedAt || null,
        completedVideos: completedVideos || [],
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await adminDb.collection('userProgress').add(progressData);

      return NextResponse.json({
        message: "Progrès créé",
        id: docRef.id
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du progrès:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
