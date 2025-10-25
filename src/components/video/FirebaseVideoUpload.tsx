"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileVideo } from "lucide-react";

interface FirebaseVideoUploadProps {
  onVideoSelect: (file: File, title: string, description: string) => void;
  onRemove: () => void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export default function FirebaseVideoUpload({
  onVideoSelect,
  onRemove,
  title = "",
  description = "",
  disabled = false
}: FirebaseVideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState(title);
  const [videoDescription, setVideoDescription] = useState(description);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('video/')) {
        alert('Veuillez sélectionner un fichier vidéo');
        return;
      }
      
      // Vérifier la taille (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 100MB)');
        return;
      }
      
      setSelectedFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim()) {
      alert('Veuillez sélectionner un fichier et saisir un titre');
      return;
    }

    setIsUploading(true);
    try {
      onVideoSelect(selectedFile, videoTitle.trim(), videoDescription.trim());
    } catch (error) {
      console.error('Erreur lors de la sélection de la vidéo:', error);
      alert('Erreur lors de la sélection de la vidéo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setVideoTitle("");
    setVideoDescription("");
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="h-5 w-5" />
          Vidéo du module
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-file">Sélectionner une vidéo *</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={disabled}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formats supportés: MP4, AVI, MOV, WMV (max 100MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileVideo className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="video-title">Titre de la vidéo *</Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ex: Introduction au module"
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="video-description">Description (optionnel)</Label>
              <Textarea
                id="video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Décrivez le contenu de cette vidéo..."
                rows={3}
                disabled={disabled}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={disabled || isUploading || !videoTitle.trim()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Ajout en cours...' : 'Ajouter la vidéo'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={disabled}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}