"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VimeoPlayer from "@/components/video/VimeoPlayer";
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle, Play } from "lucide-react";

interface Formation {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  department: {
    _id: string;
    name: string;
  };
  evaluation?: {
    _id: string;
    questions: any[];
  };
  createdAt: string;
}

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchFormation();
    }
  }, [params.id]);

  const fetchFormation = async () => {
    try {
      const response = await fetch(`/api/formations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormation(data);
        
        // Extraire l'ID de la vidéo
        const id = data.videoUrl.match(/(?:vimeo\.com\/(?:.*#|.*/videos/)?|player\.vimeo\.com\/video\/)([0-9]+)/)?.[1];
        if (id) {
          setVideoId(id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la formation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
    
    // Marquer comme complétée si 90% de la vidéo est regardée
    if (progress >= 90 && !isCompleted) {
      setIsCompleted(true);
      // Ici, vous pourriez sauvegarder la progression dans la base de données
    }
  };

  const handleVideoEnd = () => {
    setIsCompleted(true);
    setVideoProgress(100);
  };

  const startEvaluation = () => {
    if (formation?.evaluation) {
      router.push(`/dashboard/membre/evaluations/${formation.evaluation._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Formation non trouvée</h3>
        <p className="text-gray-500">Cette formation n'existe pas ou a été supprimée.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{formation.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline">{formation.department.name}</Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Ajoutée le {new Date(formation.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lecteur vidéo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Vidéo de Formation
              </CardTitle>
              <CardDescription>
                Regardez la vidéo et suivez votre progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videoId ? (
                <VimeoPlayer
                  videoId={videoId}
                  className="w-full"
                  onProgress={handleVideoProgress}
                  onEnd={handleVideoEnd}
                />
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">URL de vidéo invalide</p>
                </div>
              )}

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression</span>
                  <span>{Math.round(videoProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
                {isCompleted && (
                  <div className="flex items-center mt-2 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Formation terminée !</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{formation.description}</p>
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Département</span>
                <Badge variant="outline">{formation.department.name}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Statut</span>
                <Badge variant={isCompleted ? "default" : "secondary"}>
                  {isCompleted ? "Terminée" : "En cours"}
                </Badge>
              </div>

              {formation.evaluation && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Évaluation</span>
                  <Badge variant="secondary">Disponible</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formation.evaluation && (
                <Button 
                  className="w-full" 
                  onClick={startEvaluation}
                  disabled={!isCompleted}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Passer l'Évaluation
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Marquer comme Favori
              </Button>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Progression</span>
                  <span className="text-sm font-medium">{Math.round(videoProgress)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Temps regardé</span>
                  <span className="text-sm font-medium">~15 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Statut</span>
                  <span className="text-sm font-medium">
                    {isCompleted ? "Complétée" : "En cours"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
