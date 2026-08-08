import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { Team } from '../models/team.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Types } from 'mongoose';

export interface SearchResults {
  tasks: any[];
  projects: any[];
  teams: any[];
  members: any[];
}

export class SearchService {
  static async globalSearch(orgId: string, query: string): Promise<SearchResults> {
    if (!query || query.trim().length === 0) {
      return { tasks: [], projects: [], teams: [], members: [] };
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const [tasks, projects, teams, orgMembers] = await Promise.all([
      // Search Tasks
      Task.find({
        organizationId: orgId,
        $or: [{ title: searchRegex }, { taskKey: searchRegex }, { description: searchRegex }]
      })
        .populate('projectId', 'name key')
        .populate('assigneeId', 'name email avatarUrl')
        .limit(10)
        .lean(),

      // Search Projects
      Project.find({
        organizationId: orgId,
        $or: [{ name: searchRegex }, { key: searchRegex }, { description: searchRegex }]
      })
        .limit(5)
        .lean(),

      // Search Teams
      Team.find({
        organizationId: orgId,
        $or: [{ name: searchRegex }, { description: searchRegex }]
      })
        .limit(5)
        .lean(),

      // Search Members
      OrganizationMember.find({
        organizationId: orgId
      })
        .populate({
          path: 'userId',
          select: 'name email avatarUrl',
          match: {
            $or: [{ name: searchRegex }, { email: searchRegex }]
          }
        })
        .limit(10)
        .lean()
    ]);

    const filteredMembers = orgMembers
      .filter((m) => m.userId)
      .map((m: any) => ({
        id: m.userId._id || m.userId.id,
        name: m.userId.name,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
        role: m.role
      }))
      .slice(0, 5);

    return {
      tasks: tasks.map((t: any) => ({
        id: t._id || t.id,
        taskKey: t.taskKey,
        title: t.title,
        status: t.status,
        priority: t.priority,
        project: t.projectId
      })),
      projects: projects.map((p: any) => ({
        id: p._id || p.id,
        key: p.key,
        name: p.name,
        status: p.status
      })),
      teams: teams.map((tm: any) => ({
        id: tm._id || tm.id,
        name: tm.name,
        description: tm.description
      })),
      members: filteredMembers
    };
  }
}
