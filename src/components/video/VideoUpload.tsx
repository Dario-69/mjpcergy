"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, Video, CheckCircle, AlertCircle, X } from "lucide-react";
// Import supprimé - on utilise maintenant GridFS

interface VideoUploadProps {
  onUploadComplete: (videoId: string, filename: string) => void;
  onCancel?: () => void;
  className?: string;
  uploadedBy?: string;
  department?: string;
}

export default function VideoUpload({
  onUploadComplete,
  onCancel,
  className = "",
  uploadedBy = "",
  department = ""
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('video/')) {
        setError('Veuillez sélectionner un fichier vidéo valide');
        return;
      }

      // Vérifier la taille (limite de 100MB pour GridFS)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setError('Le fichier est trop volumineux. Taille maximale : 100MB');
        return;
      }

      setSelectedFile(file);
      setVideoName(file.name.replace(/\.[^/.]+$/, "")); // Nom sans extension
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoName.trim()) {
      setError('Veuillez sélectionner un fichier et saisir un nom');
      return;
    }

    if (!uploadedBy) {
      setError('Utilisateur non identifié');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      // Préparer les données pour l'upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', videoName);
      formData.append('description', videoDescription);
      formData.append('uploadedBy', uploadedBy);
      if (department) {
        formData.append('department', department);
      }

      // Upload vers GridFS via l'API
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }

      setSuccess(true);
      setUploadedVideoId(result.videoId);
      onUploadComplete(result.videoId, result.filename);

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setVideoName("");
    setVideoDescription("");
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setUploadedVideoId(null);
    onCancel?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {!success ? (
          <>
            {/* Zone de sélection de fichier */}
            <div>
              <Label htmlFor="video-file">Sélectionner une vidéo</Label>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-3">
                    <Video className="h-16 w-16 text-blue-600 mx-auto" />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setVideoName("");
                        setVideoDescription("");
                        setError(null);
                      }}
                    >
                      Changer de fichier
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-blue-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">Cliquez pour sélectionner une vidéo</p>
                      <p className="text-sm text-gray-500 mt-1">
                        ou glissez-déposez votre fichier ici
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Formats supportés: MP4, MOV, AVI, WMV, FLV • Taille max: 100MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations de la vidéo */}
            {selectedFile && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-name">Nom de la vidéo</Label>
                  <Input
                    id="video-name"
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    placeholder="Nom de votre vidéo"
                  />
                </div>

                <div>
                  <Label htmlFor="video-description">Description (optionnel)</Label>
                  <Textarea
                    id="video-description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Description de la vidéo..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Barre de progression */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Upload en cours...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Messages d'erreur */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            {selectedFile && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!videoName.trim() || isUploading}
                  className="min-w-[120px]"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload vers MongoDB
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Message de succès */
          <div className="space-y-6">
            <div className="text-center space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Upload réussi !</h3>
                <p className="text-green-700">Votre vidéo a été uploadée vers MongoDB avec succès.</p>
              </div>
            </div>
            
            {/* Aperçu de la vidéo */}
            {uploadedVideoId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Aperçu de la vidéo</Label>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    La vidéo sera disponible dans votre formation après la création.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID MongoDB: {uploadedVideoId}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="min-w-[140px]"
              >
                Upload une autre vidéo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
