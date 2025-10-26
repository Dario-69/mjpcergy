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
      {/* Header moderne avec glassmorphism */}
      <header className="glass border-b border-white/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center animate-fade-in-left">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 mr-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MJP Training
              </h1>
            </div>
            <div className="flex space-x-4 animate-fade-in-right">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Bonjour, <span className="font-semibold text-gray-800">{user?.name}</span>
                  </span>
                  <Link href={user?.role === "responsable" ? "/dashboard/responsable" : "/dashboard/membre"}>
                    <Button className="hover-lift transition-all-smooth">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={signOut} className="hover-lift transition-all-smooth">
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline" className="hover-lift transition-all-smooth">Se connecter</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="gradient-primary hover-glow transition-all-smooth">S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section moderne */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Formation pour l'Église des Jeunes
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Une plateforme complète de formation en ligne pour les membres et responsables 
              de l'église des jeunes. Suivez des formations, participez aux évaluations 
              et développez vos compétences dans un environnement moderne et interactif.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="xl" className="gradient-primary hover-glow transition-all-smooth">
                Commencer maintenant
              </Button>
              <Button size="xl" variant="outline" className="hover-lift transition-all-smooth">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>

        {/* Features avec animations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-4 w-fit">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Gestion des Membres</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Gérez facilement les membres et leurs départements avec une interface intuitive
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 mx-auto mb-4 w-fit">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Formations Vidéo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Créez et suivez des formations avec des vidéos intégrées et interactives
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 mx-auto mb-4 w-fit">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Évaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Évaluez les connaissances avec des quiz interactifs et des résultats détaillés
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-4 w-fit">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Suivi des Progrès</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Suivez les progrès et les résultats de formation en temps réel
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section moderne */}
        <div className="glass rounded-2xl shadow-large p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Prêt à commencer votre formation ?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et développez vos compétences dans un environnement 
            moderne et interactif
          </p>
          <Button size="xl" className="gradient-primary hover-glow transition-all-smooth">
            Créer un compte
          </Button>
        </div>
      </main>

      {/* Footer moderne */}
      <footer className="glass border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 mr-3">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MJP Training
            </span>
          </div>
          <p className="text-gray-600">&copy; 2024 MJP Training App. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
