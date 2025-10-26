import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');

    let query = adminDb.collection('users');

    // Filtrer par rôle si fourni
    if (role) {
      query = query.where('role', '==', role) as any;
    }

    // Filtrer par département si fourni
    if (department) {
      query = query.where('departmentId', '==', department) as any;
    }

    // Récupérer les données sans orderBy pour éviter les problèmes d'index
    const usersSnapshot = await query.get();
    
    const users = [];
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      
      // Récupérer le département si l'utilisateur en a un
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
      
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        department: departmentData,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }

    // Trier côté client par date de création (plus récent en premier)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
