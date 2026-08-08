import { Schema, model, Document, Types } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

organizationSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Organization = model<IOrganization>('Organization', organizationSchema);
