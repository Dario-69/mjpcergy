import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({})
      .populate('department', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier que le département existe (pour les membres)
    if (role === "membre" && department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return NextResponse.json(
          { message: "Département introuvable" },
          { status: 400 }
        );
      }
    }

    // Créer l'utilisateur
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department: role === "membre" ? department : undefined,
      isActive: role === "responsable" ? true : false,
    });

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userData = await User.findById(user._id)
      .populate('department', 'name')
      .select('-password');

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
