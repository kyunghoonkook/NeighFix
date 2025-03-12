import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IMessage {
  sender: Types.ObjectId | IUser;
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  problemId: Types.ObjectId;
  messages: IMessage[];
  participants: Types.ObjectId[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatSchema = new Schema<IChat>({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  messages: [MessageSchema],
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 인덱스 생성
ChatSchema.index({ problemId: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);