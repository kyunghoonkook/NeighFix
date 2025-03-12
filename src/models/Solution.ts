import { Schema, model, models, Types } from 'mongoose';
import { IUser } from './User';
import { IProblem } from './Problem';

export interface ISolution {
  _id?: string;
  title: string;
  description: string;
  problem: Types.ObjectId | IProblem;
  author: Types.ObjectId | IUser;
  votes: number;
  likes: number;
  aiGenerated: boolean;
  status: 'proposed' | 'approved' | 'implemented';
  resources?: string;
  budget?: number;
  timeline?: string;
  createdAt: Date;
  updatedAt: Date;
  isSelected: boolean;
}

const solutionSchema = new Schema<ISolution>({
  title: { 
    type: String, 
    required: [true, '제목은 필수입니다'] 
  },
  description: { 
    type: String, 
    required: [true, '설명은 필수입니다'] 
  },
  problem: { 
    type: Schema.Types.ObjectId, 
    ref: 'Problem', 
    required: true 
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  aiGenerated: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['proposed', 'approved', 'implemented'], 
    default: 'proposed' 
  },
  resources: { 
    type: String 
  },
  budget: { 
    type: Number 
  },
  timeline: { 
    type: String 
  },
  isSelected: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const Solution = models.Solution || model<ISolution>('Solution', solutionSchema);

export default Solution; 