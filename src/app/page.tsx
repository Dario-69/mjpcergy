"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MJP Training</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Bonjour, {user?.name}
                  </span>
                  <Link href={user?.role === "responsable" ? "/dashboard/responsable" : "/dashboard/membre"}>
                    <Button>Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={signOut}>
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Se connecter</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Formation pour l'Église des Jeunes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une plateforme complète de formation en ligne pour les membres et responsables 
            de l'église des jeunes. Suivez des formations, participez aux évaluations 
            et développez vos compétences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              En savoir plus
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestion des Membres</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gérez facilement les membres et leurs départements
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Formations Vidéo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Créez et suivez des formations avec des vidéos intégrées
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Évaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Évaluez les connaissances avec des quiz interactifs
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Suivi des Progrès</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suivez les progrès et les résultats de formation
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Rejoignez notre communauté et développez vos compétences
          </p>
          <Button size="lg" className="text-lg px-8 py-3">
            Créer un compte
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 MJP Training App. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
