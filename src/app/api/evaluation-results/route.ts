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

    // Récupérer les résultats d'évaluation de l'utilisateur
    const resultsSnapshot = await adminDb.collection('evaluationResults')
      .where('userId', '==', userId)
      .get();

    const results = [];
    for (const doc of resultsSnapshot.docs) {
      const data = doc.data();
      
      // Récupérer les informations de la formation
      let formationData = null;
      if (data.formationId) {
        const formationDoc = await adminDb.collection('formations').doc(data.formationId).get();
        if (formationDoc.exists) {
          formationData = {
            id: formationDoc.id,
            title: formationDoc.data()?.title
          };
        }
      }
      
      results.push({
        id: doc.id,
        formation: formationData,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        completedAt: data.completedAt,
        timeSpent: data.timeSpent,
        answers: data.answers || []
      });
    }

    // Trier côté client par date de completion (plus récent en premier)
    results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, formationId, score, totalQuestions, correctAnswers, answers, timeSpent } = await request.json();

    if (!userId || !formationId) {
      return NextResponse.json(
        { message: "ID utilisateur et formation requis" },
        { status: 400 }
      );
    }

    const resultData = {
      userId,
      formationId,
      score,
      totalQuestions,
      correctAnswers,
      answers: answers || [],
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('evaluationResults').add(resultData);

    return NextResponse.json({
      message: "Résultat d'évaluation sauvegardé",
      id: docRef.id
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du résultat:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
