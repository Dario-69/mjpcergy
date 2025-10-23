import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const department = await Department.findById(params.id)
      .populate('referent', 'name email role');

    if (!department) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

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
    const { name, description, referent, isActive } = await request.json();

    await connectDB();

    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le référent existe (si fourni)
    if (referent) {
      const User = require("@/models/User");
      const referentUser = await User.findById(referent);
      if (!referentUser) {
        return NextResponse.json(
          { message: "Référent non trouvé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour les champs
    if (name) department.name = name;
    if (description) department.description = description;
    if (referent !== undefined) department.referent = referent;
    if (typeof isActive === 'boolean') department.isActive = isActive;

    await department.save();

    // Retourner le département mis à jour avec le référent peuplé
    const updatedDepartment = await Department.findById(params.id)
      .populate('referent', 'name email role');

    return NextResponse.json(updatedDepartment);
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
    await connectDB();

    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json(
        { message: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Désactiver le département au lieu de le supprimer
    department.isActive = false;
    await department.save();

    return NextResponse.json({ message: "Département désactivé" });
  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
