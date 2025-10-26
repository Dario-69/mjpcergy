"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function ResponsableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/responsable", icon: BarChart3 },
    { name: "Membres", href: "/dashboard/responsable/membres", icon: Users },
    { name: "Formations", href: "/dashboard/responsable/formations", icon: BookOpen },
    { name: "Départements", href: "/dashboard/responsable/departements", icon: Settings },
  ];

  return (
    <ProtectedRoute requiredRole="responsable">
      <div className="min-h-screen">
        {/* Mobile sidebar avec glassmorphism - Responsive */}
        <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-80 sm:w-72 flex-col glass border-r border-white/20 shadow-2xl animate-fade-in-left">
            <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MJP Training
              </h1>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/20 transition-all-smooth"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 px-3 sm:px-4 py-3 sm:py-4 space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all-smooth group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-medium'
                        : 'text-gray-600 hover:bg-white/30 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/20 p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-medium">
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">Responsable</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover-lift transition-all-smooth text-xs sm:text-sm"
                onClick={logout}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar moderne */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto glass border-r border-white/20 shadow-2xl">
            <div className="flex h-16 items-center px-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MJP Training
              </h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all-smooth group animate-fade-in-left ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-medium'
                        : 'text-gray-600 hover:bg-white/30 hover:text-gray-900'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/20 p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-medium">
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">Responsable</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover-lift transition-all-smooth text-xs sm:text-sm"
                onClick={logout}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Main content - Responsive */}
        <div className="lg:pl-72">
          {/* Top bar moderne - Responsive */}
          <div className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 glass border-b border-white/20 px-3 sm:px-4 lg:px-8 shadow-soft">
            <button
              type="button"
              className="-m-2 p-2 sm:-m-2.5 sm:p-2.5 text-gray-700 lg:hidden hover:bg-white/20 rounded-lg transition-all-smooth"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1"></div>
              <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/20" />
                <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Bonjour, </span><span className="font-semibold text-gray-800">{user?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content avec animations - Responsive */}
          <main className="py-4 sm:py-6 lg:py-8">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
              <div className="animate-fade-in-up">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
