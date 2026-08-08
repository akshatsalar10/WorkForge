import { Schema, model, Document, Types } from 'mongoose';
import { OrgRole } from './organizationMember.model';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export interface IInvitation extends Document {
  organizationId: Types.ObjectId;
  email: string;
  role: OrgRole;
  invitedBy: Types.ObjectId;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER'],
      default: 'MEMBER',
      required: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // TTL index to cleanup old invitation documents
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

invitationSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Invitation = model<IInvitation>('Invitation', invitationSchema);
