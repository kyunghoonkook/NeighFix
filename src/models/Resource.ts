import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IResource extends Document {
  name: string;
  type: 'public' | 'private' | 'ngo';
  category: string[];
  description: string;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  availableSupport: string[];
  owner: Types.ObjectId | IUser;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  name: {
    type: String,
    required: [true, '자원 이름은 필수입니다']
  },
  type: {
    type: String,
    enum: ['public', 'private', 'ngo'],
    required: [true, '자원 유형은 필수입니다']
  },
  category: [{
    type: String,
    required: [true, '카테고리는 필수입니다']
  }],
  description: {
    type: String,
    required: [true, '설명은 필수입니다']
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  address: {
    type: String,
    required: [true, '주소는 필수입니다']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, '좌표는 필수입니다']
    }
  },
  availableSupport: [{
    type: String,
    required: [true, '제공 가능한 지원 정보는 필수입니다']
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 인덱스 생성
ResourceSchema.index({ location: '2dsphere' });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ type: 1 });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema); 