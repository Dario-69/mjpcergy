import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formationId = params.id;
    
    const formationDoc = await adminDb.collection('formations').doc(formationId).get();
    
    if (!formationDoc.exists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    const formationData = formationDoc.data();
    
    // Récupérer le département
    let departmentData = null;
    if (formationData?.departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(formationData.departmentId).get();
      if (departmentDoc.exists) {
        departmentData = {
          id: departmentDoc.id,
          name: departmentDoc.data()?.name
        };
      }
    }

    // Récupérer le créateur
    let creatorData = null;
    if (formationData?.createdById) {
      const creatorDoc = await adminDb.collection('users').doc(formationData.createdById).get();
      if (creatorDoc.exists) {
        creatorData = {
          id: creatorDoc.id,
          name: creatorDoc.data()?.name,
          email: creatorDoc.data()?.email
        };
      }
    }

    const formation = {
      id: formationDoc.id,
      ...formationData,
      department: departmentData,
      createdBy: creatorData
    };

    return NextResponse.json(formation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
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
    const formationId = params.id;
    const { title, description, department, modules, tags, estimatedDuration, difficulty } = await request.json();

    if (!title || !description || !department) {
      return NextResponse.json(
        { message: "Titre, description et département requis" },
        { status: 400 }
      );
    }

    // Vérifier que la formation existe
    const formationDoc = await adminDb.collection('formations').doc(formationId).get();
    if (!formationDoc.exists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le département existe
    const departmentDoc = await adminDb.collection('departments').doc(department).get();
    if (!departmentDoc.exists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 400 }
      );
    }

    const updateData = {
      title,
      description,
      departmentId: department,
      modules: modules || [],
      tags: tags || [],
      estimatedDuration: estimatedDuration || null,
      difficulty: difficulty || 'débutant',
      updatedAt: new Date()
    };

    await adminDb.collection('formations').doc(formationId).update(updateData);

    return NextResponse.json({
      message: "Formation mise à jour avec succès",
      id: formationId
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error);
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
    const formationId = params.id;

    // Vérifier que la formation existe
    const formationDoc = await adminDb.collection('formations').doc(formationId).get();
    if (!formationDoc.exists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Marquer comme archivée au lieu de supprimer
    await adminDb.collection('formations').doc(formationId).update({
      isArchived: true,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: "Formation archivée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'archivage de la formation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
