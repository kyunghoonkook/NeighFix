import { Schema, model, models, Types } from 'mongoose';
import { IUser } from './User';

export interface IProblem {
  _id?: string;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number]; // [경도, 위도]
    address: string;
  };
  category: string;
  images?: string[];
  author: Types.ObjectId | IUser;
  status: 'pending' | 'processing' | 'resolved';
  votes: number;
  priority: number;
  frequency: number; // 유사 문제 빈도
  participants: Types.ObjectId[]; // 참여 의사를 표한 사용자들
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  lastAnalysis: string;
  isCompleted: boolean; // 문제가 완료되었는지 여부
  selectedSolution?: Types.ObjectId; // 선택된 해결책 ID
}

const problemSchema = new Schema<IProblem>({
  title: { 
    type: String, 
    required: [true, '제목은 필수입니다'] 
  },
  description: { 
    type: String, 
    required: [true, '설명은 필수입니다'] 
  },
  location: { 
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [경도, 위도] 순서
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    }
  },
  category: { 
    type: String, 
    required: [true, '카테고리는 필수입니다'] 
  },
  images: [{ 
    type: String 
  }],
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'resolved'], 
    default: 'pending' 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  priority: {
    type: Number,
    default: 1, // 1: 낮음, 2: 중간, 3: 높음
    min: 1,
    max: 3
  },
  frequency: {
    type: Number,
    default: 1 // 유사한 문제가 등록된 빈도
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{ 
    type: String 
  }],
  lastAnalysis: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  selectedSolution: {
    type: Schema.Types.ObjectId,
    ref: 'Solution'
  }
}, { 
  timestamps: true 
});

// 지리공간 인덱스 추가
problemSchema.index({ 'location.coordinates': '2dsphere' });

const Problem = models.Problem || model<IProblem>('Problem', problemSchema);

export default Problem; 