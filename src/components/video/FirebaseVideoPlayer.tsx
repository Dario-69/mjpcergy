"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from "lucide-react";

interface FirebaseVideoPlayerProps {
  videoId: string;
  title: string;
  onVideoEnd?: () => void;
  isCompleted?: boolean;
}

export default function FirebaseVideoPlayer({
  videoId,
  title,
  onVideoEnd,
  isCompleted = false
}: FirebaseVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetchVideoUrl();
  }, [videoId]);

  const fetchVideoUrl = async () => {
    try {
      setLoading(true);
      
      // Si c'est une URL Vimeo, l'utiliser directement
      if (videoId.startsWith('https://player.vimeo.com/')) {
        setVideoUrl(videoId);
        setLoading(false);
        return;
      }
      
      // Sinon, essayer de récupérer depuis l'API Firebase
      const response = await fetch(`/api/videos?id=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.downloadURL) {
          setVideoUrl(data.downloadURL);
        } else {
          setError('URL de vidéo non disponible');
        }
      } else {
        setError('Erreur lors du chargement de la vidéo');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la vidéo:', error);
      setError('Erreur lors du chargement de la vidéo');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement de la vidéo...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !videoUrl) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Vidéo non disponible'}</p>
            <Button onClick={fetchVideoUrl} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Vidéo */}
          <video
            id="video-player"
            src={videoUrl}
            className="w-full h-auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster=""
          />

          {/* Contrôles */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-4">
              {/* Bouton Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {/* Barre de progression */}
              <div className="flex-1">
                <div className="w-full bg-white/30 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Temps */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Bouton Mute */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMuteToggle}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              {/* Bouton Plein écran */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Indicateur de complétion */}
          {isCompleted && (
            <div className="absolute top-4 right-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Terminée</span>
              </div>
            </div>
          )}
        </div>

        {/* Informations de la vidéo */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Durée: {formatTime(duration)}</span>
            {isCompleted && (
              <span className="text-green-600 font-medium">✓ Vidéo terminée</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}