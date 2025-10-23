"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye, CheckCircle } from "lucide-react";
import { vimeoService } from "@/lib/vimeo";

interface VideoThumbnailProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: number;
  isWatched?: boolean;
  progress?: number;
  onClick?: () => void;
  className?: string;
}

export default function VideoThumbnail({
  videoId,
  title,
  description,
  duration,
  isWatched = false,
  progress = 0,
  onClick,
  className = ""
}: VideoThumbnailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = vimeoService.getThumbnailUrl(videoId, 'large');
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 group ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-200 relative overflow-hidden">
            {!imageError ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-500" />
              </div>
            )}

            {/* Overlay de lecture */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <Play className="h-6 w-6 text-gray-800" />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {isWatched && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Terminée
                </Badge>
              )}
              {progress > 0 && progress < 90 && (
                <Badge variant="secondary">
                  En cours
                </Badge>
              )}
            </div>

            {/* Durée */}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatDuration(duration)}
              </div>
            )}

            {/* Barre de progression */}
            {progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                <div 
                  className={`h-full ${getProgressColor(progress)} transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {description}
              </p>
            )}

            {/* Statistiques */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {progress > 0 && (
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {Math.round(progress)}% regardé
                  </div>
                )}
              </div>
              
              {isWatched && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complétée
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
