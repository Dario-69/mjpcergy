import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EvaluationResult from "@/models/EvaluationResult";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const result = await EvaluationResult.findById(params.id)
      .populate('evaluation', 'formation questions')
      .populate('user', 'name email role');

    if (!result) {
      return NextResponse.json(
        { message: "Résultat non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération du résultat:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
