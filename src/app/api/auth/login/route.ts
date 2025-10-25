import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef.where('email', '==', email).get();
    
    if (userQuery.docs.length === 0) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }
    
    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;
    
    // Récupérer le département si l'utilisateur en a un
    let department = null;
    if (user.departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(user.departmentId).get();
      if (departmentDoc.exists) {
        department = { id: departmentDoc.id, ...departmentDoc.data() };
      }
    }
    

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { message: "Compte désactivé" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer les tokens JWT
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      department: department ? {
        id: department.id,
        name: (department as any).name
      } : null
    };

    return NextResponse.json({
      message: "Connexion réussie",
      accessToken,
      refreshToken,
      user: userData
    });

  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}