"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3, Settings, Plus } from "lucide-react";
import { useToastNotifications } from "@/components/ui/toast";
import Link from "next/link";

export default function ResponsableDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showInfo } = useToastNotifications();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats?type=admin');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        showSuccess('Données chargées', 'Les statistiques ont été mises à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      showInfo('Information', 'Chargement des données en cours...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="responsable">
      <div className="min-h-screen">
        {/* Header moderne avec glassmorphism */}
        <header className="glass border-b border-white/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="animate-fade-in-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Responsable
                </h1>
                <p className="text-gray-600 mt-1">Bonjour, <span className="font-semibold text-gray-800">{user?.name}</span></p>
              </div>
              <div className="flex space-x-4 animate-fade-in-right">
                <Button variant="outline" className="hover-lift transition-all-smooth">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button className="gradient-primary hover-glow transition-all-smooth">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Membres</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.overview?.activeUsers || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Formations Actives</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.overview?.totalFormations || 0}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.overview?.activeFormations || 0} actives
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Évaluations</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.overview?.totalEvaluations || 0}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Score moyen: {stats?.overview?.averageScore || 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-soft animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Vidéos</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.overview?.totalVideos || 0}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Vidéos uploadées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activités récentes */}
          {stats && (
            <Card className="mb-8 hover-lift shadow-medium animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Activités récentes (24h)
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Aperçu des activités de la journée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.overview?.recentProgress || 0}</div>
                    <p className="text-sm text-gray-600 font-medium">Progrès récents</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.overview?.recentEvaluations || 0}</div>
                    <p className="text-sm text-gray-600 font-medium">Évaluations terminées</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.overview?.completedFormations || 0}</div>
                    <p className="text-sm text-gray-600 font-medium">Formations complétées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-lift hover-glow transition-all-smooth cursor-pointer group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link href="/dashboard/responsable/membres" className="block">
                <CardHeader>
                  <CardTitle className="flex items-center group-hover:text-blue-600 transition-colors">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-3 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Gérer les Membres
                  </CardTitle>
                  <CardDescription>
                    Voir et gérer tous les membres de l'organisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Activer/désactiver des comptes, modifier les informations
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover-lift hover-glow transition-all-smooth cursor-pointer group animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <Link href="/dashboard/responsable/formations" className="block">
                <CardHeader>
                  <CardTitle className="flex items-center group-hover:text-green-600 transition-colors">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 mr-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    Formations
                  </CardTitle>
                  <CardDescription>
                    Créer et gérer les formations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Ajouter des vidéos, créer des évaluations
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover-lift hover-glow transition-all-smooth cursor-pointer group animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <Link href="/dashboard/responsable/departements" className="block">
                <CardHeader>
                  <CardTitle className="flex items-center group-hover:text-purple-600 transition-colors">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 mr-3 group-hover:scale-110 transition-transform">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    Départements
                  </CardTitle>
                  <CardDescription>
                    Gérer les départements et référents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Créer des départements, assigner des référents
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
