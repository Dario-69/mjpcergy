import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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
    
    await connectDB();

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé ou inactif" },
        { status: 401 }
      );
    }

    // Créer un nouveau access token
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
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