"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Edit, Trash2, Users, UserCheck } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  description: string;
  referent?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DepartementsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // États pour la création
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    referent: ''
  });
  
  // États pour la modification
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    referent: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const createDepartment = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/departements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          referent: createForm.referent || undefined,
        }),
      });

      if (response.ok) {
        const newDepartment = await response.json();
        setDepartments([...departments, newDepartment]);
        setCreateForm({ name: '', description: '', referent: '' });
        setIsCreateDialogOpen(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Erreur lors de la création du département');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDepartment = async () => {
    if (!selectedDepartment) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/departements/${selectedDepartment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          referent: editForm.referent || undefined,
        }),
      });

      if (response.ok) {
        const updatedDepartment = await response.json();
        setDepartments(departments.map(dept => 
          dept._id === selectedDepartment._id ? updatedDepartment : dept
        ));
        setIsEditDialogOpen(false);
        setSelectedDepartment(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      setError('Erreur lors de la modification du département');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDepartmentStatus = async (departmentId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/departements/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setDepartments(departments.map(dept => 
          dept._id === departmentId ? { ...dept, isActive: !isActive } : dept
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setEditForm({
      name: department.name,
      description: department.description,
      referent: department.referent?._id || ''
    });
    setIsEditDialogOpen(true);
  };

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && department.isActive) ||
                         (filterStatus === "inactive" && !department.isActive);
    
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Départements</h1>
          <p className="text-gray-600">Organisez votre équipe en départements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Département
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau département</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau département à votre organisation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du département</label>
                <Input 
                  placeholder="Ex: Musique, Multimédia, Accueil..." 
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea 
                  placeholder="Décrivez les responsabilités de ce département..."
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référent (optionnel)</label>
                <Select value={createForm.referent || "none"} onValueChange={(value) => setCreateForm({...createForm, referent: value === "none" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un référent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun référent</SelectItem>
                    {users.filter(user => user.role === 'responsable').map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setCreateForm({ name: '', description: '', referent: '' });
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={createDepartment}
                  disabled={isSubmitting || !createForm.name.trim() || !createForm.description.trim()}
                >
                  {isSubmitting ? "Création..." : "Créer le département"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le département</DialogTitle>
              <DialogDescription>
                Modifiez les informations du département {selectedDepartment?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du département</label>
                <Input 
                  placeholder="Ex: Musique, Multimédia, Accueil..." 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea 
                  placeholder="Décrivez les responsabilités de ce département..."
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référent (optionnel)</label>
                <Select value={editForm.referent || "none"} onValueChange={(value) => setEditForm({...editForm, referent: value === "none" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un référent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun référent</SelectItem>
                    {users.filter(user => user.role === 'responsable').map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedDepartment(null);
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={updateDepartment}
                  disabled={isSubmitting || !editForm.name.trim() || !editForm.description.trim()}
                >
                  {isSubmitting ? "Modification..." : "Modifier le département"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Départements</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(d => d.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avec Référent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(d => d.referent).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredDepartments.length} département(s) trouvé(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <div className="grid gap-4">
        {filteredDepartments.map((department) => (
          <Card key={department._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                    <Badge variant={department.isActive ? 'default' : 'destructive'}>
                      {department.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    {department.referent && (
                      <Badge variant="secondary">Avec référent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{department.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {department.referent ? (
                      <>
                        <span>Référent: {department.referent.name}</span>
                        <span>•</span>
                        <span>{department.referent.email}</span>
                      </>
                    ) : (
                      <span className="text-amber-600">Aucun référent assigné</span>
                    )}
                    <span>•</span>
                    <span>Créé le: {new Date(department.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDepartmentStatus(department._id, department.isActive)}
                  >
                    {department.isActive ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun département trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche."
                : "Commencez par créer votre premier département."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
