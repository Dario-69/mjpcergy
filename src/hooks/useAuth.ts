import { useContext } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: !!context.user,
    login: context.login,
    signOut: context.logout,
    refreshToken: context.refreshToken,
  };
}
