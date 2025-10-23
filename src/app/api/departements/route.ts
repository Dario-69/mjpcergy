import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const departments = await Department.find({})
      .populate('referent', 'name email')
      .sort({ name: 1 });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, referent } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Nom et description requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier si le département existe déjà
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return NextResponse.json(
        { message: "Un département avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier que le référent existe (si fourni)
    if (referent) {
      const User = require("@/models/User");
      const referentUser = await User.findById(referent);
      if (!referentUser) {
        return NextResponse.json(
          { message: "Référent non trouvé" },
          { status: 400 }
        );
      }
    }

    const department = new Department({
      name,
      description,
      referent: referent || undefined,
    });

    await department.save();

    // Retourner le département avec le référent peuplé
    const populatedDepartment = await Department.findById(department._id)
      .populate('referent', 'name email');

    return NextResponse.json(populatedDepartment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}