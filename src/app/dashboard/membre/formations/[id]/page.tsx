"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Video } from "lucide-react";
import FirebaseVideoPlayer from "@/components/video/FirebaseVideoPlayer";

interface Formation {
  id: string;
  title: string;
  description: string;
  department: {
    id: string;
    name: string;
  };
  modules: Module[];
  tags: string[];
  createdAt: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration?: number;
  order: number;
  downloadURL?: string;
}

interface FormationProgress {
  formationId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  completedAt?: string;
  lastAccessedAt?: string;
  completedVideos: string[];
}

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = params.id as string;
  
  const [formation, setFormation] = useState<Formation | null>(null);
  const [progress, setProgress] = useState<FormationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchFormation();
    fetchProgress();
    // Récupérer les données de l'utilisateur connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
    }
  }, [formationId]);

  const fetchFormation = async () => {
    try {
      const response = await fetch(`/api/formations?id=${formationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setFormation(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la formation:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`/api/user-progress?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const formationProgress = data.find((p: any) => p.formationId === formationId);
          setProgress(formationProgress || {
            formationId,
            status: 'not-started',
            progress: 0,
            completedVideos: []
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const markVideoAsCompleted = async (videoId: string) => {
    if (!currentUser || !progress) return;

    try {
      const updatedCompletedVideos = [...(progress.completedVideos || []), videoId];
      const totalVideos = formation?.modules.reduce((total, module) => total + module.videos.length, 0) || 0;
      const newProgress = Math.round((updatedCompletedVideos.length / totalVideos) * 100);
      const newStatus = newProgress === 100 ? 'completed' : 'in-progress';

      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          formationId,
          status: newStatus,
          progress: newProgress,
          completedAt: newStatus === 'completed' ? new Date() : null,
          completedVideos: updatedCompletedVideos
        }),
      });

      if (response.ok) {
        setProgress({
          ...progress,
          status: newStatus,
          progress: newProgress,
          completedVideos: updatedCompletedVideos,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : progress.completedAt
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  const getVideoProgress = (videoId: string) => {
    return progress?.completedVideos?.includes(videoId) || false;
  };

  const getModuleProgress = (module: Module) => {
    const totalVideos = module.videos.length;
    const completedVideos = module.videos.filter(video => 
      progress?.completedVideos?.includes(video.id)
    ).length;
    return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement de la formation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Formation non trouvée</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{formation.title}</h1>
          <p className="text-gray-600">{formation.department.name}</p>
        </div>
      </div>

      {/* Progression générale */}
      {progress && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Progression de la formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progression globale</span>
                <span className="text-sm text-gray-600">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <div className="flex items-center gap-2">
                <Badge variant={progress.status === 'completed' ? 'default' : progress.status === 'in-progress' ? 'secondary' : 'outline'}>
                  {progress.status === 'completed' ? 'Terminée' : progress.status === 'in-progress' ? 'En cours' : 'Non commencée'}
                </Badge>
                {progress.completedAt && (
                  <span className="text-sm text-gray-600">
                    Terminée le {new Date(progress.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vidéo sélectionnée */}
      {selectedVideo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {selectedVideo.title}
            </CardTitle>
            <CardDescription>{selectedVideo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseVideoPlayer
              videoId={selectedVideo.videoId}
              title={selectedVideo.title}
              onVideoEnd={() => markVideoAsCompleted(selectedVideo.id)}
              isCompleted={getVideoProgress(selectedVideo.id)}
            />
          </CardContent>
        </Card>
      )}

      {/* Modules et vidéos */}
      <div className="space-y-6">
        {formation.modules.map((module, moduleIndex) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Module {moduleIndex + 1}</Badge>
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {getModuleProgress(module)}% complété
                  </div>
                  <Progress value={getModuleProgress(module)} className="w-24 h-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.videos.map((video, videoIndex) => (
                  <div
                    key={video.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVideo?.id === video.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            Vidéo {videoIndex + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          {video.description && (
                            <p className="text-sm text-gray-600">{video.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVideoProgress(video.id) && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {video.duration && (
                          <span className="text-sm text-gray-500">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}