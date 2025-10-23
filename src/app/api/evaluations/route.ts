import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Evaluation from "@/models/Evaluation";
import Formation from "@/models/Formation";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const formation = searchParams.get('formation');

    let query: any = {};
    
    if (formation) {
      query.formation = formation;
    }

    const evaluations = await Evaluation.find(query)
      .populate('formation', 'title description')
      .sort({ createdAt: -1 });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { formation, questions } = await request.json();

    if (!formation || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { message: "Formation et questions requises" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que la formation existe
    const formationExists = await Formation.findById(formation);
    if (!formationExists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà une évaluation pour cette formation
    const existingEvaluation = await Evaluation.findOne({ formation });
    if (existingEvaluation) {
      return NextResponse.json(
        { message: "Une évaluation existe déjà pour cette formation" },
        { status: 400 }
      );
    }

    // Valider les questions
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

    const evaluation = new Evaluation({
      formation,
      questions,
    });

    await evaluation.save();

    // Mettre à jour la formation avec l'évaluation
    await Formation.findByIdAndUpdate(formation, { evaluation: evaluation._id });

    // Retourner l'évaluation avec la formation peuplée
    const populatedEvaluation = await Evaluation.findById(evaluation._id)
      .populate('formation', 'title description');

    return NextResponse.json(populatedEvaluation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
