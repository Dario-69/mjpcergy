import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Récupérer le département si l'utilisateur en a un
    let departmentData = null;
    if (userData?.departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(userData.departmentId).get();
      if (departmentDoc.exists) {
        departmentData = {
          id: departmentDoc.id,
          name: departmentDoc.data()?.name
        };
      }
    }

    const user = {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      department: departmentData,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
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
    const userId = params.id;
    const { name, email, isActive, departmentId } = await request.json();

    // Vérifier que l'utilisateur existe
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le département existe (si fourni)
    if (departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
      if (!departmentDoc.exists) {
        return NextResponse.json(
          { message: "Département non trouvé" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      name,
      email,
      isActive,
      departmentId: departmentId || null,
      updatedAt: new Date()
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
