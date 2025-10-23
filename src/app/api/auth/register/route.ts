import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department } = await request.json();

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    if (role === "membre" && !department) {
      return NextResponse.json(
        { message: "Le département est requis pour les membres" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier que le département existe (pour les membres)
    if (role === "membre") {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return NextResponse.json(
          { message: "Département introuvable" },
          { status: 400 }
        );
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department: role === "membre" ? department : undefined,
      isActive: role === "responsable" ? true : false, // Les responsables sont actifs par défaut
    });

    await user.save();

    return NextResponse.json(
      { message: "Compte créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
