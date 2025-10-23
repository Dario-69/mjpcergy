import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo {
  id: string;
  title: string;
  description: string;
  videoId: string; // ID GridFS
  duration?: number; // en secondes
  order: number;
}

export interface IModule {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: IVideo[];
}

export interface IFormation extends Document {
  title: string;
  description: string;
  thumbnailUrl?: string;
  department: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  modules: IModule[];
  isArchived: boolean;
  evaluation?: mongoose.Types.ObjectId;
  estimatedDuration?: number; // durée totale en minutes
  difficulty?: 'débutant' | 'intermédiaire' | 'avancé';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  order: {
    type: Number,
    required: true,
  },
}, { _id: false });

const ModuleSchema = new Schema<IModule>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  videos: [VideoSchema],
}, { _id: false });

const FormationSchema = new Schema<IFormation>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  thumbnailUrl: {
    type: String,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  modules: [ModuleSchema],
  isArchived: {
    type: Boolean,
    default: false,
  },
  evaluation: {
    type: Schema.Types.ObjectId,
    ref: 'Evaluation',
  },
  estimatedDuration: {
    type: Number,
  },
  difficulty: {
    type: String,
    enum: ['débutant', 'intermédiaire', 'avancé'],
    default: 'débutant',
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Formation || mongoose.model<IFormation>('Formation', FormationSchema);
