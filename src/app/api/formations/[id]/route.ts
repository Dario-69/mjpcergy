import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Formation from "@/models/Formation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const formation = await Formation.findById(params.id)
      .populate('department', 'name description')
      .populate('createdBy', 'name email role')
      .populate('evaluation', 'questions');

    if (!formation) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

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
    const { 
      title, 
      description, 
      department, 
      isArchived,
      modules,
      tags,
      thumbnailUrl
    } = await request.json();

    await connectDB();

    const formation = await Formation.findById(params.id);
    if (!formation) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le département existe (si fourni)
    if (department) {
      const Department = require("@/models/Department");
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return NextResponse.json(
          { message: "Département non trouvé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour les champs
    if (title) formation.title = title;
    if (description) formation.description = description;
    if (department) formation.department = department;
    if (typeof isArchived === 'boolean') formation.isArchived = isArchived;
    if (modules) {
      formation.modules = modules;
      // Recalculer la durée estimée
      const estimatedDuration = modules.reduce((total: number, module: any) => {
        return total + (module.videos?.reduce((videoTotal: number, video: any) => {
          return videoTotal + (video.duration || 0);
        }, 0) || 0);
      }, 0);
      formation.estimatedDuration = Math.round(estimatedDuration / 60);
    }
    if (tags) formation.tags = tags;
    if (thumbnailUrl !== undefined) formation.thumbnailUrl = thumbnailUrl;

    await formation.save();

    // Retourner la formation mise à jour avec les relations peuplées
    const updatedFormation = await Formation.findById(params.id)
      .populate('department', 'name description')
      .populate('createdBy', 'name email role')
      .populate('evaluation', 'questions');

    return NextResponse.json(updatedFormation);
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
    await connectDB();

    const formation = await Formation.findById(params.id);
    if (!formation) {
      return NextResponse.json(
        { message: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Archiver la formation au lieu de la supprimer
    formation.isArchived = true;
    await formation.save();

    return NextResponse.json({ message: "Formation archivée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
