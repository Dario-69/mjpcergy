"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3, Settings, Plus } from "lucide-react";
import Link from "next/link";

export default function ResponsableDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats?type=admin');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="responsable">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Responsable</h1>
                <p className="text-gray-600">Bonjour, {user?.name}</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.overview?.activeUsers || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Formations Actives</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +1 cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Évaluations</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview?.totalEvaluations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Score moyen: {stats?.overview?.averageScore || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vidéos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview?.totalVideos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Vidéos uploadées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activités récentes */}
          {stats && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Activités récentes (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.overview?.recentProgress || 0}</div>
                    <p className="text-sm text-gray-600">Progrès récents</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.overview?.recentEvaluations || 0}</div>
                    <p className="text-sm text-gray-600">Évaluations terminées</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.overview?.completedFormations || 0}</div>
                    <p className="text-sm text-gray-600">Formations complétées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/responsable/membres">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
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

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/responsable/formations">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
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

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/responsable/departements">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-purple-600" />
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
