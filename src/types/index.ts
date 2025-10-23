export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'responsable' | 'membre';
  isActive: boolean;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  referent?: string; // ID du référent
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Formation {
  _id: string;
  title: string;
  description: string;
  videoUrl: string; // URL Vimeo
  department: string; // ID du département
  createdBy: string; // ID du responsable
  isArchived: boolean;
  evaluation?: string; // ID de l'évaluation
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
  _id: string;
  formation: string; // ID de la formation
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[]; // Pour les questions à choix multiples
  required: boolean;
}

export interface EvaluationResult {
  _id: string;
  evaluation: string; // ID de l'évaluation
  user: string; // ID de l'utilisateur
  answers: Answer[];
  score?: number;
  completedAt: Date;
}

export interface Answer {
  questionId: string;
  value: string | number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'responsable' | 'membre';
  isActive: boolean;
  department?: string;
}
