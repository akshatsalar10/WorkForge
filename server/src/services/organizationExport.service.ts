import { Organization } from '../models/organization.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Project } from '../models/project.model';
import { Team } from '../models/team.model';
import { Task } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { Attachment } from '../models/attachment.model';
import { ActivityLog } from '../models/activityLog.model';
import { Notification } from '../models/notification.model';
import { Invitation } from '../models/invitation.model';
import { AppError } from '../utils/appError';

export class OrganizationExportService {
  static async exportOrganizationData(orgId: string) {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new AppError('Organization not found.', 404);
    }

    const [members, projects, teams, tasks, comments, attachments, activityLogs] = await Promise.all([
      OrganizationMember.find({ organizationId: orgId }).populate('userId', 'name email').lean(),
      Project.find({ organizationId: orgId }).lean(),
      Team.find({ organizationId: orgId }).lean(),
      Task.find({ organizationId: orgId }).lean(),
      Comment.find({ organizationId: orgId }).lean(),
      Attachment.find({ organizationId: orgId }).lean(),
      ActivityLog.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(500).lean()
    ]);

    return {
      exportedAt: new Date().toISOString(),
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        createdAt: organization.createdAt
      },
      members: members.map((m: any) => ({
        userId: m.userId?._id || m.userId,
        name: m.userId?.name,
        email: m.userId?.email,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      projects: projects.map((p) => ({
        id: p._id,
        key: p.key,
        name: p.name,
        status: p.status,
        priority: p.priority
      })),
      teams: teams.map((t) => ({
        id: t._id,
        name: t.name,
        description: t.description
      })),
      tasks: tasks.map((tk) => ({
        id: tk._id,
        taskKey: tk.taskKey,
        title: tk.title,
        status: tk.status,
        priority: tk.priority
      })),
      commentsCount: comments.length,
      attachmentsCount: attachments.length,
      activityLogs
    };
  }

  static async deleteOrganization(orgId: string, confirmationSlug: string): Promise<void> {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new AppError('Organization not found.', 404);
    }

    if (organization.slug !== confirmationSlug.trim()) {
      throw new AppError('Confirmation slug does not match organization slug.', 400);
    }

    // Cascading deletion across all organization collections
    await Promise.all([
      Organization.findByIdAndDelete(orgId),
      OrganizationMember.deleteMany({ organizationId: orgId }),
      Project.deleteMany({ organizationId: orgId }),
      Team.deleteMany({ organizationId: orgId }),
      Task.deleteMany({ organizationId: orgId }),
      Comment.deleteMany({ organizationId: orgId }),
      Attachment.deleteMany({ organizationId: orgId }),
      ActivityLog.deleteMany({ organizationId: orgId }),
      Notification.deleteMany({ organizationId: orgId }),
      Invitation.deleteMany({ organizationId: orgId })
    ]);
  }
}
