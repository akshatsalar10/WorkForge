import { Schema, model, Document, Types } from 'mongoose';

export type ProjectRole = 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface IProjectMember extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['MANAGER', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound unique index ensuring a user is added to a project only once
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

projectMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const ProjectMember = model<IProjectMember>('ProjectMember', projectMemberSchema);
