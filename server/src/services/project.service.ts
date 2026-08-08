import { Project, IProject, ProjectStatus, ProjectPriority } from '../models/project.model';
import { ProjectMember, IProjectMember, ProjectRole } from '../models/projectMember.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export class ProjectService {
  static async createProject(
    orgId: string,
    userId: string,
    data: {
      name: string;
      key?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: string;
      dueDate?: string;
      teamId?: string;
    }
  ): Promise<{ project: IProject; member: IProjectMember }> {
    let key = data.key;
    if (!key) {
      // Auto-generate key from name: e.g., "Web App Dev" -> "WEB"
      const words = data.name.trim().split(/\s+/);
      if (words.length === 1) {
        key = words[0].slice(0, 3).toUpperCase();
      } else {
        key = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
      }
      if (key.length < 2) key = 'PRJ';
    }

    key = key.toUpperCase();

    const existingKey = await Project.findOne({ organizationId: orgId, key });
    if (existingKey) {
      // Append random number if generated key exists
      key = `${key}${Math.floor(10 + Math.random() * 90)}`;
    }

    const project = await Project.create({
      organizationId: orgId,
      name: data.name,
      key,
      description: data.description || '',
      status: data.status || 'ACTIVE',
      priority: data.priority || 'MEDIUM',
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      ownerId: userId,
      teamId: data.teamId ? new Types.ObjectId(data.teamId) : undefined,
      isArchived: false
    });

    const member = await ProjectMember.create({
      projectId: project._id,
      userId,
      role: 'MANAGER'
    });

    return { project, member };
  }

  static async getOrganizationProjects(
    orgId: string,
    query: {
      status?: string;
      priority?: string;
      isArchived?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const filter: any = { organizationId: orgId };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }
    if (query.isArchived !== undefined) {
      filter.isArchived = query.isArchived === 'true';
    } else {
      filter.isArchived = false;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { key: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('ownerId', 'name email avatarUrl')
        .populate('teamId', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter)
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getProjectById(orgId: string, projectId: string) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId })
      .populate('ownerId', 'name email avatarUrl')
      .populate('teamId', 'name members');

    if (!project) {
      throw new AppError('Project not found in this organization.', 404);
    }

    const memberCount = await ProjectMember.countDocuments({ projectId });

    return { project, memberCount };
  }

  static async updateProject(
    orgId: string,
    projectId: string,
    data: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: string | null;
      dueDate?: string | null;
      teamId?: string | null;
    }
  ): Promise<IProject> {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) {
      throw new AppError('Project not found in this organization.', 404);
    }

    if (data.name !== undefined) project.name = data.name;
    if (data.description !== undefined) project.description = data.description;
    if (data.status !== undefined) project.status = data.status;
    if (data.priority !== undefined) project.priority = data.priority;
    if (data.startDate !== undefined) project.startDate = data.startDate ? new Date(data.startDate) : undefined;
    if (data.dueDate !== undefined) project.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    if (data.teamId !== undefined) project.teamId = data.teamId ? new Types.ObjectId(data.teamId) : undefined;

    await project.save();
    return project;
  }

  static async archiveProject(orgId: string, projectId: string, isArchived: boolean): Promise<IProject> {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) {
      throw new AppError('Project not found in this organization.', 404);
    }

    project.isArchived = isArchived;
    if (isArchived) project.status = 'ARCHIVED';
    else if (project.status === 'ARCHIVED') project.status = 'ACTIVE';

    await project.save();
    return project;
  }

  static async deleteProject(orgId: string, projectId: string): Promise<void> {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) {
      throw new AppError('Project not found in this organization.', 404);
    }

    await ProjectMember.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);
  }

  static async getProjectMembers(projectId: string) {
    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'name email avatarUrl isEmailVerified')
      .sort({ joinedAt: 1 });

    return members;
  }

  static async addProjectMember(
    orgId: string,
    projectId: string,
    userId: string,
    role: ProjectRole = 'MEMBER'
  ): Promise<IProjectMember> {
    // Verify user is part of the Organization
    const isOrgMember = await OrganizationMember.findOne({ organizationId: orgId, userId });
    if (!isOrgMember) {
      throw new AppError('User must be a member of the organization before joining a project.', 400);
    }

    const existingPM = await ProjectMember.findOne({ projectId, userId });
    if (existingPM) {
      throw new AppError('User is already a member of this project.', 409);
    }

    const pm = await ProjectMember.create({
      projectId,
      userId,
      role
    });

    return pm;
  }

  static async updateProjectMemberRole(
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<IProjectMember> {
    const pm = await ProjectMember.findOne({ projectId, userId });
    if (!pm) {
      throw new AppError('Member not found in this project.', 404);
    }

    pm.role = role;
    await pm.save();
    return pm;
  }

  static async removeProjectMember(projectId: string, userId: string): Promise<void> {
    const pm = await ProjectMember.findOne({ projectId, userId });
    if (!pm) {
      throw new AppError('Member not found in this project.', 404);
    }

    await ProjectMember.findByIdAndDelete(pm._id);
  }
}
