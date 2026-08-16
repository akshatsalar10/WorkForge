import { Task, ITask, TaskStatus, TaskPriority, ISubtask } from '../models/task.model';
import { Project } from '../models/project.model';
import { Label, ILabel } from '../models/label.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { User } from '../models/user.model';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export class TaskService {
  static async createTask(
    orgId: string,
    projectId: string,
    reporterUserId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      labels?: string[];
      subtasks?: { title: string; isCompleted: boolean }[];
      dependencies?: string[];
    }
  ): Promise<ITask> {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) {
      throw new AppError('Project not found in this organization.', 404);
    }

    if (data.assigneeId) {
      const isOrgMember = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: data.assigneeId
      });
      if (!isOrgMember) {
        throw new AppError('Assignee must be a member of the organization.', 400);
      }
    }

    // Auto-increment taskNumber calculation
    const highestTask = await Task.findOne({ projectId }).sort({ taskNumber: -1 }).select('taskNumber');
    const taskNumber = (highestTask?.taskNumber || 0) + 1;
    const taskKey = `${project.key}-${taskNumber}`;

    // Calculate order positioning
    const highestOrderTask = await Task.findOne({ projectId, status: data.status || 'TODO' })
      .sort({ order: -1 })
      .select('order');
    const order = (highestOrderTask?.order || 0) + 1000;

    const task = await Task.create({
      organizationId: orgId,
      projectId,
      taskKey,
      taskNumber,
      title: data.title,
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      order,
      assigneeId: data.assigneeId ? new Types.ObjectId(data.assigneeId) : undefined,
      reporterId: reporterUserId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      labels: data.labels ? data.labels.map((l) => new Types.ObjectId(l)) : [],
      watchers: [new Types.ObjectId(reporterUserId)],
      subtasks: data.subtasks || [],
      dependencies: data.dependencies ? data.dependencies.map((d) => new Types.ObjectId(d)) : []
    });

    await ActivityService.logEvent(orgId, 'TASK', task._id.toString(), reporterUserId, 'TASK_CREATED', {
      taskKey,
      title: data.title
    });

    if (data.assigneeId) {
      await NotificationService.createNotification({
        recipientId: data.assigneeId,
        senderId: reporterUserId,
        organizationId: orgId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assignment',
        message: `You were assigned to task ${taskKey}: "${data.title}"`,
        link: `/tasks`
      });

      const [assignee, assigner] = await Promise.all([
        User.findById(data.assigneeId),
        User.findById(reporterUserId)
      ]);
      if (assignee && assigner) {
        EmailService.sendTaskAssignedEmail(
          assignee.email,
          assignee.name,
          data.title,
          taskKey,
          assigner.name
        ).catch((err) => console.error('Failed to send task assignment email:', err));
      }
    }

    return await this.getTaskById(orgId, task._id.toString());
  }

  static async getProjectTasks(
    orgId: string,
    projectId: string,
    query: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      search?: string;
      labelId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const filter: any = { organizationId: orgId, projectId };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }
    if (query.assigneeId) {
      filter.assigneeId = query.assigneeId;
    }
    if (query.labelId) {
      filter.labels = query.labelId;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { taskKey: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assigneeId', 'name email avatarUrl')
        .populate('reporterId', 'name email avatarUrl')
        .populate('labels', 'name color')
        .sort({ status: 1, order: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getOrganizationTasks(
    orgId: string,
    query: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const filter: any = { organizationId: orgId };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assigneeId) filter.assigneeId = query.assigneeId;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { taskKey: { $regex: query.search, $options: 'i' } }
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('projectId', 'name key')
        .populate('assigneeId', 'name email avatarUrl')
        .populate('labels', 'name color')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    return {
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  static async getTaskById(orgId: string, taskId: string): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId })
      .populate('projectId', 'name key')
      .populate('assigneeId', 'name email avatarUrl')
      .populate('reporterId', 'name email avatarUrl')
      .populate('labels', 'name color')
      .populate('watchers', 'name email avatarUrl')
      .populate('dependencies', 'taskKey title status');

    if (!task) {
      throw new AppError('Task not found in this organization.', 404);
    }

    return task;
  }

  static async updateTask(
    orgId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      order?: number;
      labels?: string[];
      subtasks?: ISubtask[];
      dependencies?: string[];
    }
  ): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) {
      throw new AppError('Task not found in this organization.', 404);
    }

    if (data.assigneeId !== undefined) {
      if (data.assigneeId) {
        const isOrgMember = await OrganizationMember.findOne({
          organizationId: orgId,
          userId: data.assigneeId
        });
        if (!isOrgMember) {
          throw new AppError('Assignee must be a member of the organization.', 400);
        }
        task.assigneeId = new Types.ObjectId(data.assigneeId);
      } else {
        task.assigneeId = undefined;
      }
    }

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    if (data.order !== undefined) task.order = data.order;
    if (data.labels !== undefined) task.labels = data.labels.map((l) => new Types.ObjectId(l));
    if (data.subtasks !== undefined) task.subtasks = data.subtasks;
    if (data.dependencies !== undefined) task.dependencies = data.dependencies.map((d) => new Types.ObjectId(d));

    await task.save();
    return await this.getTaskById(orgId, taskId);
  }

  static async updateTaskStatus(
    orgId: string,
    taskId: string,
    status: TaskStatus,
    order?: number
  ): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) {
      throw new AppError('Task not found in this organization.', 404);
    }

    task.status = status;
    if (order !== undefined) {
      task.order = order;
    }

    await task.save();
    return await this.getTaskById(orgId, taskId);
  }

  static async deleteTask(orgId: string, taskId: string): Promise<void> {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) {
      throw new AppError('Task not found in this organization.', 404);
    }

    await Task.findByIdAndDelete(taskId);
  }

  static async getOrganizationLabels(orgId: string): Promise<ILabel[]> {
    return await Label.find({ organizationId: orgId }).sort({ name: 1 });
  }

  static async createLabel(orgId: string, name: string, color?: string): Promise<ILabel> {
    const existing = await Label.findOne({ organizationId: orgId, name: name.trim() });
    if (existing) return existing;

    return await Label.create({
      organizationId: orgId,
      name: name.trim(),
      color: color || '#3b82f6'
    });
  }
}
