import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const department = searchParams.get('department');
    const createdBy = searchParams.get('createdBy');

    // Si un ID spécifique est demandé, retourner cette formation
    if (id) {
      const formationDoc = await adminDb.collection('formations').doc(id).get();
      
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

      return NextResponse.json([formation]);
    }

    let query = adminDb.collection('formations');

    // Filtrer par département si fourni
    if (department) {
      query = query.where('departmentId', '==', department) as any;
    }

    // Filtrer par créateur si fourni
    if (createdBy) {
      query = query.where('createdById', '==', createdBy) as any;
    }

    const formationsSnapshot = await query.orderBy('createdAt', 'desc').get();
    
    const formations = [];
    for (const doc of formationsSnapshot.docs) {
      const data = doc.data();
      
      // Récupérer le département
      let departmentData = null;
      if (data.departmentId) {
        const departmentDoc = await adminDb.collection('departments').doc(data.departmentId).get();
        if (departmentDoc.exists) {
          departmentData = {
            id: departmentDoc.id,
            name: departmentDoc.data()?.name
          };
        }
      }

      // Récupérer le créateur
      let creatorData = null;
      if (data.createdById) {
        const creatorDoc = await adminDb.collection('users').doc(data.createdById).get();
        if (creatorDoc.exists) {
          creatorData = {
            id: creatorDoc.id,
            name: creatorDoc.data()?.name,
            email: creatorDoc.data()?.email
          };
        }
      }
      
      formations.push({
        id: doc.id,
        ...data,
        department: departmentData,
        createdBy: creatorData
      });
    }

    return NextResponse.json(formations);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, department, createdBy, modules, thumbnailUrl, estimatedDuration, difficulty, tags } = await request.json();

    if (!title || !description || !department || !createdBy) {
      return NextResponse.json(
        { message: "Titre, description, département et créateur requis" },
        { status: 400 }
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

    // Vérifier que le créateur existe
    const creatorDoc = await adminDb.collection('users').doc(createdBy).get();
    if (!creatorDoc.exists) {
      return NextResponse.json(
        { message: "Créateur non trouvé" },
        { status: 400 }
      );
    }

    const formationData = {
      title,
      description,
      departmentId: department,
      createdById: createdBy,
      modules: modules || [],
      thumbnailUrl: thumbnailUrl || null,
      estimatedDuration: estimatedDuration || null,
      difficulty: difficulty || 'débutant',
      tags: tags || [],
      isArchived: false,
      evaluationId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('formations').add(formationData);

    const formation = {
      id: docRef.id,
      ...formationData
    };

    return NextResponse.json(formation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
