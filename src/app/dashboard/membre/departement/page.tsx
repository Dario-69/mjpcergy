"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail, Calendar, Award, BookOpen } from "lucide-react";

interface DepartmentMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

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
}

export default function MonDepartementPage() {
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentInfo();
    fetchDepartmentMembers();
  }, []);

  const fetchDepartmentInfo = async () => {
    try {
      // Simuler les données du département (à remplacer par une vraie API)
      const mockDepartment: Department = {
        _id: '1',
        name: 'Musique',
        description: 'Département responsable de la musique et du chant dans l\'église des jeunes. Nous nous occupons de tous les aspects musicaux des services et événements.',
        referent: {
          _id: '1',
          name: 'Jean Dupont',
          email: 'jean@mjp.com'
        },
        isActive: true
      };
      setDepartment(mockDepartment);
    } catch (error) {
      console.error('Erreur lors du chargement du département:', error);
    }
  };

  const fetchDepartmentMembers = async () => {
    try {
      // Simuler les données des membres (à remplacer par une vraie API)
      const mockMembers: DepartmentMember[] = [
        {
          _id: '1',
          name: 'Marie Martin',
          email: 'marie@mjp.com',
          role: 'membre',
          isActive: true,
          createdAt: '2024-01-15'
        },
        {
          _id: '2',
          name: 'Pierre Durand',
          email: 'pierre@mjp.com',
          role: 'membre',
          isActive: true,
          createdAt: '2024-01-20'
        },
        {
          _id: '3',
          name: 'Sophie Bernard',
          email: 'sophie@mjp.com',
          role: 'membre',
          isActive: true,
          createdAt: '2024-02-01'
        }
      ];
      setMembers(mockMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Département</h1>
        <p className="text-gray-600">Découvrez votre équipe et collaborez avec vos collègues</p>
      </div>

      {/* Department Info */}
      {department && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{department.name}</CardTitle>
                <CardDescription className="mt-2">{department.description}</CardDescription>
              </div>
              <Badge variant={department.isActive ? 'default' : 'destructive'}>
                {department.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {department.referent && (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-blue-500 text-white">
                    {department.referent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">Référent du département</p>
                  <p className="text-sm text-gray-600">{department.referent.name}</p>
                  <p className="text-sm text-gray-500">{department.referent.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Membres</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Membres Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Formations Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Membres du Département
          </CardTitle>
          <CardDescription>
            Connectez-vous avec vos collègues et collaborez ensemble
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-green-500 text-white">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={member.isActive ? 'default' : 'destructive'}>
                        {member.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">Membre</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Rejoint le {new Date(member.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Les dernières activités de votre département
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nouvelle formation ajoutée</p>
                <p className="text-xs text-gray-500">"Introduction au Leadership" - Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Marie Martin a terminé une formation</p>
                <p className="text-xs text-gray-500">"Gestion du Temps" - Il y a 1 jour</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nouveau membre rejoint</p>
                <p className="text-xs text-gray-500">Sophie Bernard - Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
