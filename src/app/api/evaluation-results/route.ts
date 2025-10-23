import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EvaluationResult from "@/models/EvaluationResult";
import Evaluation from "@/models/Evaluation";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const evaluation = searchParams.get('evaluation');
    const user = searchParams.get('user');

    let query: any = {};
    
    if (evaluation) {
      query.evaluation = evaluation;
    }
    
    if (user) {
      query.user = user;
    }

    const results = await EvaluationResult.find(query)
      .populate('evaluation', 'formation questions')
      .populate('user', 'name email role')
      .sort({ completedAt: -1 });

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
    const { evaluation, user, answers } = await request.json();

    if (!evaluation || !user || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: "Évaluation, utilisateur et réponses requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que l'évaluation existe
    const evaluationExists = await Evaluation.findById(evaluation);
    if (!evaluationExists) {
      return NextResponse.json(
        { message: "Évaluation non trouvée" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const User = require("@/models/User");
    const userExists = await User.findById(user);
    if (!userExists) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un résultat pour cette évaluation et cet utilisateur
    const existingResult = await EvaluationResult.findOne({ evaluation, user });
    if (existingResult) {
      return NextResponse.json(
        { message: "Un résultat existe déjà pour cette évaluation" },
        { status: 400 }
      );
    }

    // Calculer le score basé sur les réponses
    let score = 0;
    const totalQuestions = evaluationExists.questions.length;
    
    for (const answer of answers) {
      const question = evaluationExists.questions.find((q: any) => q.id === answer.questionId);
      if (question) {
        // Logique de calcul du score selon le type de question
        if (question.type === 'multiple-choice') {
          // Pour les questions à choix multiples, comparer avec la bonne réponse
          // (supposons que la première option est la bonne réponse pour l'exemple)
          if (answer.value === question.options[0]) {
            score += 1;
          }
        } else if (question.type === 'rating') {
          // Pour les questions de notation, le score est la valeur divisée par le maximum
          const maxRating = 5; // Supposons que le maximum est 5
          score += (answer.value / maxRating);
        } else if (question.type === 'text') {
          // Pour les questions textuelles, donner un point si une réponse est fournie
          if (answer.value && answer.value.trim().length > 0) {
            score += 1;
          }
        }
      }
    }

    const finalScore = Math.round((score / totalQuestions) * 100);

    const result = new EvaluationResult({
      evaluation,
      user,
      answers,
      score: finalScore,
    });

    await result.save();

    // Retourner le résultat avec les relations peuplées
    const populatedResult = await EvaluationResult.findById(result._id)
      .populate('evaluation', 'formation questions')
      .populate('user', 'name email role');

    return NextResponse.json(populatedResult, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du résultat:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
