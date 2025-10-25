import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token requis" },
        { status: 400 }
      );
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    
    // Vérifier que l'utilisateur existe toujours
    const userDoc = await adminDb.collection('users').doc(decoded.userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 401 }
      );
    }

    const user = userDoc.data();
    
    if (!user?.isActive) {
      return NextResponse.json(
        { message: "Utilisateur inactif" },
        { status: 401 }
      );
    }

    // Créer un nouveau access token
    const accessToken = jwt.sign(
      { 
        userId: userDoc.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      accessToken
    });

  } catch (error) {
    console.error("Erreur de refresh token:", error);
    return NextResponse.json(
      { message: "Token invalide" },
      { status: 401 }
    );
  }
}