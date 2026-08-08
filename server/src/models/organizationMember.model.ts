import { Schema, model, Document, Types } from 'mongoose';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface IOrganizationMember extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrgRole;
  joinedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
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
      enum: ['OWNER', 'ADMIN', 'MEMBER'],
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

// Compound unique index ensuring a user can belong to an org only once
organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

organizationMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const OrganizationMember = model<IOrganizationMember>(
  'OrganizationMember',
  organizationMemberSchema
);
