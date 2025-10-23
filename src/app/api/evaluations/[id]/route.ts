import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Evaluation from "@/models/Evaluation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const evaluation = await Evaluation.findById(params.id)
      .populate('formation', 'title description department');

    if (!evaluation) {
      return NextResponse.json(
        { message: "Évaluation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évaluation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { questions } = await request.json();

    await connectDB();

    const evaluation = await Evaluation.findById(params.id);
    if (!evaluation) {
      return NextResponse.json(
        { message: "Évaluation non trouvée" },
        { status: 404 }
      );
    }

    // Valider les questions si fournies
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        if (!question.id || !question.text || !question.type) {
          return NextResponse.json(
            { message: "Chaque question doit avoir un id, un texte et un type" },
            { status: 400 }
          );
        }

        if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
          return NextResponse.json(
            { message: "Les questions à choix multiples doivent avoir au moins 2 options" },
            { status: 400 }
          );
        }
      }

      evaluation.questions = questions;
    }

    await evaluation.save();

    // Retourner l'évaluation mise à jour avec la formation peuplée
    const updatedEvaluation = await Evaluation.findById(params.id)
      .populate('formation', 'title description department');

    return NextResponse.json(updatedEvaluation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évaluation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const evaluation = await Evaluation.findById(params.id);
    if (!evaluation) {
      return NextResponse.json(
        { message: "Évaluation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la référence de l'évaluation dans la formation
    const Formation = require("@/models/Formation");
    await Formation.findByIdAndUpdate(evaluation.formation, { $unset: { evaluation: 1 } });

    // Supprimer l'évaluation
    await Evaluation.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Évaluation supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'évaluation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
