"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VimeoPlayer from "@/components/video/VimeoPlayer";
import VideoUpload from "@/components/video/VideoUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Upload } from "lucide-react";

export default function TestVimeoPage() {
  const [videoUrl, setVideoUrl] = useState("https://player.vimeo.com/video/123456789");
  const [videoId, setVideoId] = useState("123456789");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [uploadedVideoId, setUploadedVideoId] = useState("");

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    // Extraire l'ID de la vidéo depuis l'URL
    const id = url.match(/(?:vimeo\.com\/(?:.*#|.*/videos/)?|player\.vimeo\.com\/video\/)([0-9]+)/)?.[1];
    if (id) {
      setVideoId(id);
    }
  };

  const handleUploadComplete = (url: string, id: string) => {
    setUploadedVideoUrl(url);
    setUploadedVideoId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test d'Intégration Vimeo</h1>
          <p className="text-gray-600 mt-2">
            Testez les fonctionnalités d'upload et de lecture de vidéos Vimeo
          </p>
        </div>

        <Tabs defaultValue="player" className="space-y-6">
          <TabsList>
            <TabsTrigger value="player" className="flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Lecteur Vidéo
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Vidéo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lecteur Vidéo Vimeo</CardTitle>
                <CardDescription>
                  Testez le lecteur vidéo avec une URL Vimeo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="video-url">URL de la vidéo Vimeo</Label>
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://player.vimeo.com/video/123456789"
                  />
                </div>

                {videoId && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>ID de la vidéo détecté :</strong> {videoId}
                      </p>
                    </div>

                    <VimeoPlayer
                      videoId={videoId}
                      className="w-full"
                      onPlay={() => console.log('Vidéo en cours de lecture')}
                      onPause={() => console.log('Vidéo en pause')}
                      onEnd={() => console.log('Vidéo terminée')}
                      onProgress={(currentTime, duration) => {
                        console.log(`Progression: ${currentTime}s / ${duration}s`);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <VideoUpload
              onUploadComplete={handleUploadComplete}
              className="w-full"
            />

            {uploadedVideoUrl && uploadedVideoId && (
              <Card>
                <CardHeader>
                  <CardTitle>Vidéo Uploadée</CardTitle>
                  <CardDescription>
                    Votre vidéo a été uploadée avec succès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>URL d'embed :</strong> {uploadedVideoUrl}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>ID de la vidéo :</strong> {uploadedVideoId}
                    </p>
                  </div>

                  <div>
                    <Label>Lecteur de la vidéo uploadée</Label>
                    <VimeoPlayer
                      videoId={uploadedVideoId}
                      className="w-full mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Informations sur l'API Vimeo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Configuration Vimeo</CardTitle>
            <CardDescription>
              Informations sur la configuration de l'API Vimeo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Variables d'environnement requises :</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• VIMEO_ACCESS_TOKEN</li>
                    <li>• VIMEO_CLIENT_ID</li>
                    <li>• VIMEO_CLIENT_SECRET</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités disponibles :</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload de vidéos</li>
                    <li>• Lecteur personnalisé</li>
                    <li>• Contrôles avancés</li>
                    <li>• Gestion des paramètres</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
