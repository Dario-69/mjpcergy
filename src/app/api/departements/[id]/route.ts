import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;
    
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
    
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    const departmentData = departmentDoc.data();
    
    if (!departmentData) {
      return NextResponse.json(
        { message: "Données du département non trouvées" },
        { status: 404 }
      );
    }
    
    // Récupérer le référent si le département en a un
    let referentData = null;
    if (departmentData.referentId) {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;
    const { name, description, referent, referentId, isActive } = await request.json();

    // Vérifier que le département existe
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get();
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Utiliser referent ou referentId (compatibilité)
    const finalReferentId = referent || referentId;
    
    // Vérifier que le référent existe (si fourni)
    if (finalReferentId) {
      const referentDoc = await adminDb.collection('users').doc(finalReferentId).get();
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
      referentId: finalReferentId || null,
      isActive,
      updatedAt: new Date()
    };

    await adminDb.collection('departments').doc(departmentId).update(updateData);

    // Récupérer le département mis à jour avec le référent
    const updatedDoc = await adminDb.collection('departments').doc(departmentId).get();
    const updatedData = updatedDoc.data();
    
    if (!updatedData) {
      return NextResponse.json(
        { message: "Département non trouvé après mise à jour" },
        { status: 404 }
      );
    }
    
    let referentData = null;
    if (updatedData.referentId) {
      const referentDoc = await adminDb.collection('users').doc(updatedData.referentId).get();
      if (referentDoc.exists) {
        referentData = {
          id: referentDoc.id,
          name: referentDoc.data()?.name,
          email: referentDoc.data()?.email
        };
      }
    }

    return NextResponse.json({
      id: departmentId,
      ...updatedData,
      referent: referentData
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;

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
