"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, CheckCircle, Clock, Award, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function MembreDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`/api/stats?type=member&userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="membre">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="membre">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Dashboard</h1>
                <p className="text-gray-600">Bonjour, {user?.name}</p>
                {user?.department && (
                  <p className="text-sm text-gray-500">Département: {user.department.name}</p>
                )}
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
                <CardTitle className="text-sm font-medium">Formations</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview?.totalFormations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.overview?.completedFormations || 0} terminées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En cours</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview?.inProgressFormations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Formations en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Évaluations</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Progression</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.overview?.totalFormations > 0 
                    ? Math.round((stats.overview.completedFormations / stats.overview.totalFormations) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Taux de completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progression des formations */}
          {stats?.formationProgress && stats.formationProgress.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Progression des formations</CardTitle>
                <CardDescription>
                  Suivez votre avancement dans chaque formation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.formationProgress.map((formation: any) => (
                    <div key={formation.formationId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{formation.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${formation.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{formation.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          formation.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : formation.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formation.status === 'completed' ? 'Terminée' : 
                           formation.status === 'in-progress' ? 'En cours' : 'Non commencée'}
                        </span>
                        <Link href={`/dashboard/membre/formations/${formation.formationId}`}>
                          <Button size="sm" variant="outline">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/membre/formations">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Mes Formations
                  </CardTitle>
                  <CardDescription>
                    Consultez et suivez vos formations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {stats?.overview?.totalFormations || 0} formations disponibles
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/membre/resultats">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-green-600" />
                    Mes Résultats
                  </CardTitle>
                  <CardDescription>
                    Consultez vos résultats d'évaluations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {stats?.overview?.totalEvaluations || 0} évaluations terminées
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/membre/departement">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Mon Département
                  </CardTitle>
                  <CardDescription>
                    Découvrez votre équipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Département: {user?.department?.name || 'Non assigné'}
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