import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Formation from "@/models/Formation";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const isArchived = searchParams.get('archived') === 'true';

    let query: any = {};
    
    if (department) {
      query.department = department;
    }
    
    if (isArchived !== null) {
      query.isArchived = isArchived;
    }

    const formations = await Formation.find(query)
      .populate('department', 'name')
      .populate('createdBy', 'name email')
      .populate('evaluation', 'questions')
      .sort({ createdAt: -1 });

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
    const { 
      title, 
      description, 
      department, 
      createdBy, 
      modules = [], 
      tags = [],
      thumbnailUrl
    } = await request.json();

    // Debug: Log des données reçues
    console.log('API - Données reçues:', {
      title: !!title,
      description: !!description,
      department: !!department,
      createdBy: !!createdBy,
      modulesCount: modules.length
    });

    if (!title || !description || !department || !createdBy) {
      console.log('API - Validation échouée:', {
        title: title || 'MANQUANT',
        description: description || 'MANQUANT',
        department: department || 'MANQUANT',
        createdBy: createdBy || 'MANQUANT'
      });
      return NextResponse.json(
        { message: "Titre, description, département et créateur sont requis" },
        { status: 400 }
      );
    }

    if (modules.length === 0) {
      return NextResponse.json(
        { message: "Au moins un module est requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que le département existe
    const Department = require("@/models/Department");
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 400 }
      );
    }

    // Vérifier que le créateur existe
    const User = require("@/models/User");
    const creatorExists = await User.findById(createdBy);
    if (!creatorExists) {
      return NextResponse.json(
        { message: "Créateur non trouvé" },
        { status: 400 }
      );
    }

    // Calculer la durée totale estimée
    const estimatedDuration = modules.reduce((total: number, module: any) => {
      return total + (module.videos?.reduce((videoTotal: number, video: any) => {
        return videoTotal + (video.duration || 0);
      }, 0) || 0);
    }, 0);

    const formation = new Formation({
      title,
      description,
      thumbnailUrl,
      department,
      createdBy,
      modules: modules.map((module: any) => ({
        ...module,
        id: undefined // MongoDB générera un nouvel ID
      })),
      tags,
      estimatedDuration: Math.round(estimatedDuration / 60) // Convertir en minutes
    });

    await formation.save();

    // Retourner la formation avec les relations peuplées
    const populatedFormation = await Formation.findById(formation._id)
      .populate('department', 'name')
      .populate('createdBy', 'name email')
      .populate('evaluation', 'questions');

    return NextResponse.json(populatedFormation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
