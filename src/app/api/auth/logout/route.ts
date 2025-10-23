import { NextResponse } from "next/server";

export async function POST() {
  // Avec JWT, le logout se fait côté client en supprimant le token
  // Optionnellement, on peut maintenir une blacklist de tokens révoqués
  return NextResponse.json({
    message: "Déconnexion réussie"
  });
}
