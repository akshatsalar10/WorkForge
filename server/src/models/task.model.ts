import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ISubtask {
  _id?: Types.ObjectId;
  title: string;
  isCompleted: boolean;
}

export interface ITask extends Document {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  taskKey: string;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  assigneeId?: Types.ObjectId;
  reporterId: Types.ObjectId;
  dueDate?: Date;
  labels: Types.ObjectId[];
  watchers: Types.ObjectId[];
  subtasks: ISubtask[];
  dependencies: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const taskSchema = new Schema<ITask>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    taskKey: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    taskNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters'],
      maxlength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'TODO',
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true
    },
    order: {
      type: Number,
      default: 0
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    dueDate: {
      type: Date,
      index: true
    },
    labels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Label'
      }
    ],
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    subtasks: [subtaskSchema],
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring taskKey is unique per organization
taskSchema.index({ organizationId: 1, taskKey: 1 }, { unique: true });

// Compound index for querying project tasks by status and order (Kanban optimization)
taskSchema.index({ projectId: 1, status: 1, order: 1 });

taskSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Task = model<ITask>('Task', taskSchema);
