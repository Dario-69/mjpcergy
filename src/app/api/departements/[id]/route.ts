import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;
    
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
    
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    const departmentData = departmentDoc.data();
    
    // Récupérer le référent si le département en a un
    let referentData = null;
    if (departmentData?.referentId) {
      const referentDoc = await adminDb.collection('users').doc(departmentData.referentId).get();
      if (referentDoc.exists) {
        referentData = {
          id: referentDoc.id,
          name: referentDoc.data()?.name,
          email: referentDoc.data()?.email
        };
      }
    }

    const department = {
      id: departmentDoc.id,
      name: departmentData.name,
      description: departmentData.description,
      isActive: departmentData.isActive,
      referent: referentData,
      createdAt: departmentData.createdAt,
      updatedAt: departmentData.updatedAt
    };

    return NextResponse.json(department);
  } catch (error) {
    console.error("Erreur lors de la récupération du département:", error);
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
    const departmentId = params.id;
    const { name, description, referentId, isActive } = await request.json();

    // Vérifier que le département existe
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le référent existe (si fourni)
    if (referentId) {
      const referentDoc = await adminDb.collection('users').doc(referentId).get();
      if (!referentDoc.exists) {
        return NextResponse.json(
          { message: "Référent non trouvé" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      name,
      description,
      referentId: referentId || null,
      isActive,
      updatedAt: new Date()
    };

    await adminDb.collection('departments').doc(departmentId).update(updateData);

    return NextResponse.json({
      message: "Département mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du département:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;

    // Vérifier que le département existe
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des utilisateurs dans ce département
    const usersInDepartment = await adminDb.collection('users')
      .where('departmentId', '==', departmentId)
      .get();

    if (!usersInDepartment.empty) {
      return NextResponse.json(
        { message: "Impossible de supprimer un département qui contient des utilisateurs" },
        { status: 400 }
      );
    }

    // Marquer comme inactif au lieu de supprimer
    await adminDb.collection('departments').doc(departmentId).update({
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: "Département désactivé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
