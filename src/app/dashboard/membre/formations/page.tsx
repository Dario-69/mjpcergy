"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, CheckCircle, Clock, Award, BarChart3 } from "lucide-react";

interface Formation {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  department: {
    id: string;
    name: string;
  };
  evaluation?: {
    id: string;
    questions: any[];
  };
  createdAt: string;
}

interface FormationProgress {
  formationId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  completedAt?: string;
}

export default function MesFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [progress, setProgress] = useState<FormationProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
    fetchProgress();
  }, []);

  const fetchFormations = async () => {
    try {
      // Récupérer les données de l'utilisateur connecté
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Récupérer UNIQUEMENT les formations du département de l'utilisateur
        if (user.department?.id) {
          const response = await fetch(`/api/formations?department=${user.department.id}`);
          if (response.ok) {
            const data = await response.json();
            setFormations(data);
          }
        } else {
          console.error('Utilisateur sans département');
          setFormations([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      // Récupérer les progrès depuis Firebase
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`/api/user-progress?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    }
  };

  const getFormationProgress = (formationId: string) => {
    return progress.find(p => p.formationId === formationId) || {
      status: 'not-started' as const,
      progress: 0
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Play className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminée</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="outline">Non commencée</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Formations</h1>
        <p className="text-gray-600">Continuez votre apprentissage et développez vos compétences</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Formations</p>
                <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formations List */}
      <div className="grid gap-4">
        {formations.map((formation) => {
          const formationProgress = getFormationProgress(formation.id);
          return (
            <Card key={formation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{formation.title}</h3>
                      {getStatusIcon(formationProgress.status)}
                      {getStatusBadge(formationProgress.status)}
                      {formation.evaluation && (
                        <Badge variant="secondary">Avec évaluation</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{formation.description}</p>
                    
                    {/* Progress Bar */}
                    {formationProgress.status !== 'not-started' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progression</span>
                          <span>{formationProgress.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${formationProgress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Département: {formation.department.name}</span>
                      <span>•</span>
                      <span>Ajoutée le: {new Date(formation.createdAt).toLocaleDateString('fr-FR')}</span>
                      {(formationProgress as any).completedAt && (
                        <>
                          <span>•</span>
                          <span>Terminée le: {new Date((formationProgress as any).completedAt).toLocaleDateString('fr-FR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant={formationProgress.status === 'completed' ? 'outline' : 'default'}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {formationProgress.status === 'completed' ? 'Revoir' : 'Commencer'}
                    </Button>
                    {formation.evaluation && formationProgress.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Évaluation
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {formations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation disponible</h3>
            <p className="text-gray-500">
              Les formations de votre département seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
