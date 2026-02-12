import mongoose, { Schema, Document } from 'mongoose';

export interface ILabel {
  id: string;
  name: string;
  color: string;
}

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface IComment {
  id: string;
  text: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  mentions?: mongoose.Types.ObjectId[];
}

export interface ICard extends Document {
  title: string;
  description?: string;
  position: number;
  dueDate?: Date;
  labels: ILabel[];
  checklist: IChecklistItem[];
  attachments: string[];
  comments: IComment[];
  list: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      maxlength: [200, 'Card title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    position: {
      type: Number,
      required: true,
      default: 0
    },
    dueDate: {
      type: Date
    },
    labels: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, required: true }
    }],
    checklist: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }],
    attachments: [{
      type: String
    }],
    comments: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now },
      mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }],
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ICard>('Card', CardSchema);
