import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données sans orderBy pour éviter les problèmes d'index
    const departmentsSnapshot = await adminDb.collection('departments').get();
    
    const departments: any[] = [];
    for (const doc of departmentsSnapshot.docs) {
      const data = doc.data();
      let referent = null;
      
      if (data.referentId) {
        const referentDoc = await adminDb.collection('users').doc(data.referentId).get();
        if (referentDoc.exists) {
          referent = {
            id: referentDoc.id,
            name: referentDoc.data()?.name,
            email: referentDoc.data()?.email
          };
        }
      }
      
      departments.push({
        id: doc.id,
        ...data,
        referent
      });
    }

    // Trier côté client par nom
    departments.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, referent } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Nom et description requis" },
        { status: 400 }
      );
    }

    // Vérifier si le département existe déjà
    const existingDepartment = await adminDb.collection('departments').where('name', '==', name).get();
    if (!existingDepartment.empty) {
      return NextResponse.json(
        { message: "Un département avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier que le référent existe (si fourni)
    if (referent) {
      const referentDoc = await adminDb.collection('users').doc(referent).get();
      if (!referentDoc.exists) {
        return NextResponse.json(
          { message: "Référent non trouvé" },
          { status: 400 }
        );
      }
    }

    const departmentData = {
      name,
      description,
      referentId: referent || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('departments').add(departmentData);

    // Récupérer le référent si fourni
    let referentData = null;
    if (referent) {
      const referentDoc = await adminDb.collection('users').doc(referent).get();
      if (referentDoc.exists) {
        referentData = {
          id: referentDoc.id,
          name: referentDoc.data()?.name,
          email: referentDoc.data()?.email
        };
      }
    }

    const department = {
      id: docRef.id,
      ...departmentData,
      referent: referentData
    };

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}