import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: string;
  value: string | number;
}

export interface IEvaluationResult extends Document {
  evaluation: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score?: number;
  completedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
    required: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const EvaluationResultSchema = new Schema<IEvaluationResult>({
  evaluation: {
    type: Schema.Types.ObjectId,
    ref: 'Evaluation',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour éviter les doublons
EvaluationResultSchema.index({ evaluation: 1, user: 1 }, { unique: true });

export default mongoose.models.EvaluationResult || mongoose.model<IEvaluationResult>('EvaluationResult', EvaluationResultSchema);
