"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  videoId?: string;
  file?: File;
  duration?: number;
  order: number;
}

export default function EditFormationPage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.id as string;
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formation, setFormation] = useState<any>(null);
  
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
    fetchFormation();
    // Récupérer les données de l'utilisateur connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
    }
  }, [formationId]);

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

  const fetchFormation = async () => {
    try {
      const response = await fetch(`/api/formations?id=${formationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const formationData = data[0];
          setFormation(formationData);
          setFormData({
            title: formationData.title,
            description: formationData.description,
            department: formationData.departmentId,
            tags: formationData.tags || [],
            tagInput: ""
          });
          setModules(formationData.modules || []);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la formation:', error);
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

  const addVideo = (moduleId: string) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      title: "",
      description: "",
      order: modules.find(m => m.id === moduleId)?.videos.length || 0 + 1
    };
    updateModule(moduleId, {
      videos: [...(modules.find(m => m.id === moduleId)?.videos || []), newVideo]
    });
  };

  const updateVideo = (moduleId: string, videoId: string, updates: Partial<Video>) => {
    updateModule(moduleId, {
      videos: modules.find(m => m.id === moduleId)?.videos.map(video => 
        video.id === videoId ? { ...video, ...updates } : video
      ) || []
    });
  };

  const deleteVideo = (moduleId: string, videoId: string) => {
    updateModule(moduleId, {
      videos: modules.find(m => m.id === moduleId)?.videos.filter(video => video.id !== videoId) || []
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!currentUser?.id) {
      setError('Utilisateur non identifié. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

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
      
      // 2. Mettre à jour la formation
      const formationData = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        modules: modules.map((module) => ({
          ...module,
          videos: module.videos.map((video, videoIndex) => {
            const uploadResult = uploadResults.find(result => 
              result.moduleId === module.id && result.videoIndex === videoIndex
            );
            
            return {
              ...video,
              videoId: uploadResult?.videoId || video.videoId,
              file: undefined
            };
          })
        })),
        tags: formData.tags,
        estimatedDuration: null,
        difficulty: 'débutant'
      };

      const response = await fetch(`/api/formations/${formationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formationData),
      });

      if (response.ok) {
        router.push('/dashboard/responsable/formations');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        setError(`Erreur lors de la mise à jour: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour de la formation');
    } finally {
      setLoading(false);
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

  if (!formation) {
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
          <h1 className="text-2xl font-bold">Modifier la formation</h1>
          <p className="text-gray-600">Mettez à jour les informations de votre formation</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>
              Définissez le titre, la description et le département de votre formation
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
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  placeholder="Ajouter un tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Modules de formation</CardTitle>
                <CardDescription>
                  Organisez votre formation en modules avec des vidéos
                </CardDescription>
              </div>
              <Button type="button" onClick={addModule} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Aucun module créé</p>
                <p className="text-sm">Commencez par ajouter votre premier module</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={module.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Module {index + 1}</Badge>
                          <div>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(module.id, { title: e.target.value })}
                              placeholder="Titre du module"
                              className="font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedModuleId(selectedModuleId === module.id ? null : module.id)}
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
                        <Textarea
                          value={module.description}
                          onChange={(e) => updateModule(module.id, { description: e.target.value })}
                          placeholder="Description du module"
                          rows={2}
                        />
                        
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

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || isUploading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Mise à jour...' : 'Mettre à jour la formation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
