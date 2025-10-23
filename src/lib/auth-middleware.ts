import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(request: NextRequest): AuthenticatedUser | null {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = verifyToken(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Non autorisé" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return handler(request, user);
  };
}

export function requireRole(role: string) {
  return function(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
    return async (request: NextRequest) => {
      const user = verifyToken(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ message: "Non autorisé" }),
          { 
            status: 401,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      if (user.role !== role) {
        return new Response(
          JSON.stringify({ message: "Accès refusé" }),
          { 
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      return handler(request, user);
    };
  };
}