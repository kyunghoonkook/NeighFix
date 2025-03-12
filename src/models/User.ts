import { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  location?: string;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, '이름은 필수입니다'] 
  },
  email: { 
    type: String, 
    required: [true, '이메일은 필수입니다'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, '비밀번호는 필수입니다'] 
  },
  image: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  location: { 
    type: String 
  }
});

// 이미 모델이 있으면 그것을 사용하고, 없으면 새로 생성합니다
const User = models.User || model<IUser>('User', userSchema);

export default User; 