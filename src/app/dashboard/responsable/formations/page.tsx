"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit, Archive, BarChart3, Clock, Users } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: Array<{
    id: string;
    title: string;
    description: string;
    videoId: string;
    duration?: number;
    order: number;
  }>;
}

interface Formation {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  department: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
  };
  modules: Module[];
  isArchived: boolean;
  evaluation?: {
    _id: string;
    questions: any[];
  };
  estimatedDuration?: number;
  tags?: string[];
  createdAt: string;
}

export default function FormationsPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");

  useEffect(() => {
    fetchFormations();
    fetchDepartments();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations');
      if (response.ok) {
        const data = await response.json();
        setFormations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleArchiveStatus = async (formationId: string, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/formations/${formationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !isArchived }),
      });

      if (response.ok) {
        setFormations(formations.map(formation => 
          formation._id === formationId ? { ...formation, isArchived: !isArchived } : formation
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || 
                             formation.department._id === filterDepartment;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && !formation.isArchived) ||
                         (filterStatus === "archived" && formation.isArchived);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Formations</h1>
          <p className="text-gray-600">Créez et gérez les formations pour vos membres</p>
        </div>
        <Button onClick={() => router.push('/dashboard/responsable/formations/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Formation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formations.filter(f => !f.isArchived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Archivées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formations.filter(f => f.isArchived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formations.reduce((total, f) => total + f.modules.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avec Évaluations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formations.filter(f => f.evaluation).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                placeholder="Rechercher par titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="archived">Archivées</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredFormations.length} formation(s) trouvée(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formations List */}
      <div className="grid gap-4">
        {filteredFormations.map((formation) => (
          <Card key={formation._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{formation.title}</h3>
                    <Badge variant={formation.isArchived ? 'destructive' : 'default'}>
                      {formation.isArchived ? 'Archivée' : 'Active'}
                    </Badge>
                    {formation.evaluation && (
                      <Badge variant="secondary">Avec évaluation</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{formation.description}</p>
                  
                  {/* Informations sur les modules et vidéos */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {formation.modules.length} module{formation.modules.length > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formation.modules.reduce((total, module) => total + module.videos.length, 0)} vidéo{formation.modules.reduce((total, module) => total + module.videos.length, 0) > 1 ? 's' : ''}
                      </span>
                      {formation.estimatedDuration && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formation.estimatedDuration} min
                        </span>
                      )}
                    </div>
                    {formation.tags && formation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formation.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Département: {formation.department.name}</span>
                    <span>•</span>
                    <span>Créée par: {formation.createdBy.name}</span>
                    <span>•</span>
                    <span>Créée le: {new Date(formation.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/responsable/formations/${formation._id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleArchiveStatus(formation._id, formation.isArchived)}
                  >
                    {formation.isArchived ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                  {formation.evaluation && (
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFormations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500">
              {searchTerm || filterDepartment !== "all" || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche."
                : "Commencez par créer votre première formation."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
