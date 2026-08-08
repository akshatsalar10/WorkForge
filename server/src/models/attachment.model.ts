import { Schema, model, Document, Types } from 'mongoose';

export type AttachmentEntityType = 'TASK' | 'COMMENT' | 'ORGANIZATION';

export interface IAttachment extends Document {
  organizationId: Types.ObjectId;
  uploaderId: Types.ObjectId;
  entityType: AttachmentEntityType;
  entityId: Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  key: string;
  createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ['TASK', 'COMMENT', 'ORGANIZATION'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for fetching attachments by entity
attachmentSchema.index({ entityId: 1, createdAt: -1 });

attachmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Attachment = model<IAttachment>('Attachment', attachmentSchema);
