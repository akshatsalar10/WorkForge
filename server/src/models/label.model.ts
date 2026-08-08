import { Schema, model, Document, Types } from 'mongoose';

export interface ILabel extends Document {
  organizationId: Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
}

const labelSchema = new Schema<ILabel>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Label name is required'],
      trim: true,
      minlength: [1, 'Label name cannot be empty'],
      maxlength: [30, 'Label name cannot exceed 30 characters']
    },
    color: {
      type: String,
      default: '#3b82f6', // Default blue hex
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

labelSchema.index({ organizationId: 1, name: 1 }, { unique: true });

labelSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Label = model<ILabel>('Label', labelSchema);
