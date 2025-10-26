"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header moderne avec glassmorphism - Responsive */}
      <header className="glass border-b border-white/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center animate-fade-in-left">
              <img 
                src="/AUXANO.svg" 
                alt="AUXANO Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1b1d19]">
                AUXANO
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 animate-fade-in-right">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="hidden sm:block text-sm text-gray-600">
                    Bonjour, <span className="font-semibold text-gray-800">{user?.name}</span>
                  </span>
                  <Link href={user?.role === "responsable" ? "/dashboard/responsable" : "/dashboard/membre"}>
                    <Button size="sm" className="hover-lift transition-all-smooth">
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">📊</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut} className="hover-lift transition-all-smooth">
                    <span className="hidden sm:inline">Déconnexion</span>
                    <span className="sm:hidden">🚪</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm" className="hover-lift transition-all-smooth">
                      <span className="hidden sm:inline">Se connecter</span>
                      <span className="sm:hidden">Connexion</span>
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="gradient-primary hover-glow transition-all-smooth">
                      <span className="hidden sm:inline">S'inscrire</span>
                      <span className="sm:hidden">Inscription</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section moderne - Responsive */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 px-4">
              <span className="text-[#1b1d19]">
                Formation pour l'Église des Jeunes
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed px-4">
              Une plateforme complète de formation en ligne pour les membres et responsables 
              de l'église des jeunes. Suivez des formations, participez aux évaluations 
              et développez vos compétences dans un environnement moderne et interactif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              <Button size="lg" className="gradient-primary hover-glow transition-all-smooth w-full sm:w-auto">
                Commencer maintenant
              </Button>
              <Button size="lg" variant="outline" className="hover-lift transition-all-smooth w-full sm:w-auto">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>

        {/* Features avec animations - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-[#1b1d19] mx-auto mb-3 sm:mb-4 w-fit">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#ececec]" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">Gestion des Membres</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Gérez facilement les membres et leurs départements avec une interface intuitive
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-[#1b1d19] mx-auto mb-3 sm:mb-4 w-fit">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#ececec]" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">Formations Vidéo</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Créez et suivez des formations avec des vidéos intégrées et interactives
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-[#1b1d19] mx-auto mb-3 sm:mb-4 w-fit">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-[#ececec]" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">Évaluations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Évaluez les connaissances avec des quiz interactifs et des résultats détaillés
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-[#1b1d19] mx-auto mb-3 sm:mb-4 w-fit">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-[#ececec]" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">Suivi des Progrès</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Suivez les progrès et les résultats de formation en temps réel
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section moderne - Responsive */}
        <div className="glass rounded-xl sm:rounded-2xl shadow-large p-6 sm:p-8 lg:p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            <span className="text-[#1b1d19]">
              Prêt à commencer votre formation ?
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et développez vos compétences dans un environnement 
            moderne et interactif
          </p>
          <Button size="lg" className="gradient-primary hover-glow transition-all-smooth w-full sm:w-auto">
            Créer un compte
          </Button>
        </div>
      </main>

      {/* Footer moderne - Responsive */}
      <footer className="glass border-t border-white/20 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img 
              src="/AUXANO.svg" 
              alt="AUXANO Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3"
            />
            <span className="text-lg sm:text-xl font-bold text-[#1b1d19]">
              AUXANO
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600">&copy; 2024 AUXANO. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
