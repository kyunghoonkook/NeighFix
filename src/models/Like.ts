import mongoose, { Schema, models, model } from 'mongoose';

export interface ILike {
  _id: string;
  user: mongoose.Types.ObjectId;
  solution: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    solution: {
      type: Schema.Types.ObjectId,
      ref: 'Solution',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 한 사용자가 같은 솔루션에 중복 좋아요 방지
likeSchema.index({ user: 1, solution: 1 }, { unique: true });

const Like = models.Like || model<ILike>('Like', likeSchema);

export default Like; 