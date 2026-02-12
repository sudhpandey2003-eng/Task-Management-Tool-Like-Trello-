import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  background?: string;
  visibility: 'private' | 'team' | 'public';
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  lists: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Board title cannot exceed 100 characters']
    },
    background: {
      type: String,
      default: null
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'private'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    lists: [{
      type: Schema.Types.ObjectId,
      ref: 'List'
    }]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IBoard>('Board', BoardSchema);
