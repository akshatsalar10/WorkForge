import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  organizationId: Types.ObjectId;
  taskId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for fetching task comments in chronological order
commentSchema.index({ taskId: 1, createdAt: 1 });

commentSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Comment = model<IComment>('Comment', commentSchema);
