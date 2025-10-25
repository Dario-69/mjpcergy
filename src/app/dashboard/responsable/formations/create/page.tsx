"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2, Edit, Play, Upload } from "lucide-react";
import FirebaseVideoUpload from "@/components/video/FirebaseVideoUpload";

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
  videoId?: string; // Optionnel car sera uploadé plus tard
  file?: File; // Fichier temporaire côté client
  duration?: number;
  order: number;
}

export default function CreateFormationPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Données de base de la formation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    tags: [] as string[],
    tagInput: ""
  });

  // Gestion des modules
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    // Récupérer les données de l'utilisateur connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Utilisateur récupéré:', user);
      setCurrentUser(user);
    } else {
      console.log('Aucun utilisateur trouvé dans localStorage');
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departements');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: "",
      description: "",
      order: modules.length + 1,
      videos: []
    };
    setModules([...modules, newModule]);
    setSelectedModuleId(newModule.id);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, ...updates } : module
    ));
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
    }
  };

  const addVideoToModule = (moduleId: string, video: Omit<Video, 'id'>) => {
    const newVideo: Video = {
      ...video,
      id: Date.now().toString()
    };
    
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, videos: [...module.videos, newVideo] }
        : module
    ));
  };

  const updateVideo = (moduleId: string, videoId: string, updates: Partial<Video>) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            videos: module.videos.map(video =>
              video.id === videoId ? { ...video, ...updates } : video
            )
          }
        : module
    ));
  };

  const deleteVideo = (moduleId: string, videoId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, videos: module.videos.filter(video => video.id !== videoId) }
        : module
    ));
  };

  const handleVideoUpload = (file: File) => {
    if (!selectedModuleId) return;

    const video: Omit<Video, 'id'> = {
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      file,
      order: modules.find(m => m.id === selectedModuleId)?.videos.length || 0
    };

    addVideoToModule(selectedModuleId, video);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérifier que l'utilisateur est connecté
    if (!currentUser?.id) {
      setError('Utilisateur non identifié. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    // Vérifier que le département est sélectionné
    if (!formData.department) {
      setError('Veuillez sélectionner un département.');
      setLoading(false);
      return;
    }

    try {
      // 1. Uploader toutes les vidéos en premier
      const videoUploadPromises: Promise<{videoId: string, moduleId: string, videoIndex: number}>[] = [];
      
      modules.forEach((module) => {
        module.videos.forEach((video, videoIndex) => {
          if (video.file) {
            const uploadPromise = uploadVideoToFirebase(video.file, video.title, video.description || '', module.id, videoIndex);
            videoUploadPromises.push(uploadPromise);
          }
        });
      });

      // Attendre que toutes les vidéos soient uploadées
      const uploadResults = await Promise.all(videoUploadPromises);
      
      // 2. Créer la formation avec les IDs des vidéos uploadées
      const formationData = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        createdBy: currentUser.id,
        modules: modules.map((module) => ({
          ...module,
          videos: module.videos.map((video, videoIndex) => {
            // Trouver l'ID de la vidéo uploadée
            const uploadResult = uploadResults.find(result => 
              result.moduleId === module.id && result.videoIndex === videoIndex
            );
            
            return {
              ...video,
              videoId: uploadResult?.videoId || video.videoId,
              file: undefined // Ne pas envoyer le fichier
            };
          })
        })),
        tags: formData.tags,
        estimatedDuration: null,
        difficulty: 'débutant'
      };

      // Debug: Log des données envoyées
      console.log('Données de formation envoyées:', {
        title: formationData.title,
        description: formationData.description,
        department: formationData.department,
        createdBy: formationData.createdBy,
        modulesCount: formationData.modules.length
      });

      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formationData),
      });

      if (response.ok) {
        router.push('/dashboard/responsable/formations');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        setError(`Erreur lors de la création de la formation: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideoToFirebase = async (file: File, title: string, description: string, moduleId: string, videoIndex: number): Promise<{videoId: string, moduleId: string, videoIndex: number}> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('title', title);
    uploadFormData.append('description', description);
    uploadFormData.append('uploadedBy', currentUser?.id || '');

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur upload' }));
        throw new Error(`Erreur upload: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.videoId) {
        throw new Error('Réponse invalide du serveur lors de l\'upload');
      }

      return {
        videoId: result.videoId,
        moduleId,
        videoIndex
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload de la vidéo:', error);
      throw error;
    }
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ""
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer une Formation</h1>
          <p className="text-gray-600">Organisez votre formation en modules avec des vidéos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de base */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la Formation</CardTitle>
                <CardDescription>
                  Renseignez les détails de votre formation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de la formation *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Introduction au Leadership"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez le contenu et les objectifs de cette formation..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Département *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={formData.tagInput}
                        onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                        placeholder="Ajouter un tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modules et vidéos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Liste des modules */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Modules de la Formation</CardTitle>
                    <CardDescription>
                      Organisez votre contenu en modules avec des vidéos
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addModule} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun module créé</p>
                    <p className="text-sm">Cliquez sur "Ajouter un Module" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <Card key={module.id} className={selectedModuleId === module.id ? "ring-2 ring-blue-500" : ""}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">Module {module.order}</Badge>
                                {selectedModuleId === module.id && (
                                  <Badge variant="default">Sélectionné</Badge>
                                )}
                              </div>
                              <Input
                                placeholder="Titre du module"
                                value={module.title}
                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                className="font-medium"
                              />
                              <Textarea
                                placeholder="Description du module"
                                value={module.description}
                                onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                rows={2}
                                className="mt-2"
                              />
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedModuleId(module.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => deleteModule(module.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center mb-3">
                              <Label>Vidéos ({module.videos.length})</Label>
                            </div>
                            
                            <FirebaseVideoUpload
                              onVideoSelect={(file, title, description) => {
                                const newVideo: Video = {
                                  id: Date.now().toString(),
                                  title,
                                  description,
                                  file,
                                  order: module.videos.length + 1
                                };
                                updateModule(module.id, {
                                  videos: [...module.videos, newVideo]
                                });
                              }}
                              onRemove={() => {}}
                              disabled={isUploading}
                            />
                            
                            {module.videos.length > 0 && (
                              <div className="space-y-3 mt-4">
                                {module.videos.map((video, videoIndex) => (
                                  <div key={video.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{videoIndex + 1}</Badge>
                                        <span className="text-sm font-medium">{video.title}</span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteVideo(module.id, video.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    {video.description && (
                                      <p className="text-sm text-gray-600">{video.description}</p>
                                    )}
                                    {video.file && (
                                      <div className="text-xs text-green-600 mt-2">
                                        Fichier: {video.file.name}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload de vidéo */}
            {isUploading && selectedModuleId && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une Vidéo</CardTitle>
                  <CardDescription>
                    Uploader une vidéo pour le module "{modules.find(m => m.id === selectedModuleId)?.title || 'sélectionné'}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-file">Sélectionner une vidéo</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleVideoUpload(file);
                          }
                        }}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formats supportés : MP4, MOV, AVI, WMV, FLV (max 100MB)
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUploading(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-900 mb-1">💡 Conseil :</p>
                    <p className="text-blue-800">
                      Les vidéos seront uploadées vers MongoDB GridFS lors de la création de la formation. 
                      Vous pouvez ajouter plusieurs vidéos à ce module en répétant cette étape.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="font-medium">Erreur :</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title || !formData.description || !formData.department || modules.length === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Upload des vidéos et création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer la Formation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
