import { Schema, model, Document, Types } from 'mongoose';

export type ActivityEntityType = 'TASK' | 'PROJECT' | 'ORGANIZATION';
export type ActivityAction =
  | 'TASK_CREATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'DUE_DATE_CHANGED'
  | 'TITLE_UPDATED'
  | 'COMMENT_ADDED'
  | 'SUBTASK_TOGGLED';

export interface IActivityLog extends Document {
  organizationId: Types.ObjectId;
  entityType: ActivityEntityType;
  entityId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: ActivityAction;
  details?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ['TASK', 'PROJECT', 'ORGANIZATION'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for querying entity audit logs in reverse chronological order
activityLogSchema.index({ entityId: 1, createdAt: -1 });

activityLogSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
