import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring team names are unique per organization
teamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

teamSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Team = model<ITeam>('Team', teamSchema);
