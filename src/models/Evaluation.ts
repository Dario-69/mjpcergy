import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[];
  required: boolean;
}

export interface IEvaluation extends Document {
  formation: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'text', 'rating'],
    required: true,
  },
  options: [String],
  required: {
    type: Boolean,
    default: true,
  },
});

const EvaluationSchema = new Schema<IEvaluation>({
  formation: {
    type: Schema.Types.ObjectId,
    ref: 'Formation',
    required: true,
  },
  questions: [QuestionSchema],
}, {
  timestamps: true,
});

export default mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
