import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formationId } = await params;
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formationId } = await params;
    const { title, description, department, modules, tags, estimatedDuration, difficulty, isArchived } = await request.json();

    // Vérifier que la formation existe
    const formationDoc = await adminDb.collection('formations').doc(formationId).get();
    if (!formationDoc.exists) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    const existingData = formationDoc.data();
    if (!existingData) {
      return NextResponse.json(
        { message: "Données de la formation non trouvées" },
        { status: 404 }
      );
    }

    // Pour les mises à jour partielles, utiliser les données existantes si non fournies
    const finalTitle = title || existingData.title;
    const finalDescription = description || existingData.description;
    const finalDepartment = department || existingData.departmentId;

    // Validation seulement si on met à jour ces champs
    if (title && (!title || !description || !department)) {
      return NextResponse.json(
        { message: "Titre, description et département requis" },
        { status: 400 }
      );
    }

    // Vérifier que le département existe (seulement si on le change)
    if (department && department !== existingData.departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(department).get();
      if (!departmentDoc.exists) {
        return NextResponse.json(
          { message: "Département non trouvé" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      title: finalTitle,
      description: finalDescription,
      departmentId: finalDepartment,
      modules: modules !== undefined ? modules : existingData.modules,
      tags: tags !== undefined ? tags : existingData.tags,
      estimatedDuration: estimatedDuration !== undefined ? estimatedDuration : existingData.estimatedDuration,
      difficulty: difficulty || existingData.difficulty || 'débutant',
      isArchived: isArchived !== undefined ? isArchived : existingData.isArchived,
      updatedAt: new Date()
    };

    // Filtrer les valeurs undefined pour éviter les erreurs Firestore
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await adminDb.collection('formations').doc(formationId).update(filteredUpdateData);

    // Récupérer la formation mise à jour
    const updatedDoc = await adminDb.collection('formations').doc(formationId).get();
    const updatedData = updatedDoc.data();
    
    if (!updatedData) {
      return NextResponse.json(
        { message: "Formation non trouvée après mise à jour" },
        { status: 404 }
      );
    }
    
    // Récupérer le département
    let departmentData = null;
    if (updatedData.departmentId) {
      const departmentDoc = await adminDb.collection('departments').doc(updatedData.departmentId).get();
      if (departmentDoc.exists) {
        departmentData = {
          id: departmentDoc.id,
          name: departmentDoc.data()?.name
        };
      }
    }

    return NextResponse.json({
      id: formationId,
      ...updatedData,
      department: departmentData
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formationId } = await params;

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
