import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Types } from 'mongoose';

export class AnalyticsService {
  static async getOrganizationSummary(orgId: string) {
    const orgObjectId = new Types.ObjectId(orgId);

    const [
      totalProjects,
      totalMembers,
      totalTasks,
      statusBreakdown,
      priorityBreakdown
    ] = await Promise.all([
      Project.countDocuments({ organizationId: orgId, isArchived: false }),
      OrganizationMember.countDocuments({ organizationId: orgId }),
      Task.countDocuments({ organizationId: orgId }),

      // MongoDB Aggregation for Status Breakdown
      Task.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // MongoDB Aggregation for Priority Breakdown
      Task.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const statusCounts: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0
    };
    statusBreakdown.forEach((item) => {
      if (item._id) statusCounts[item._id] = item.count;
    });

    const priorityCounts: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    };
    priorityBreakdown.forEach((item) => {
      if (item._id) priorityCounts[item._id] = item.count;
    });

    const completedTasks = statusCounts['DONE'] || 0;
    const openTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      metrics: {
        totalProjects,
        totalMembers,
        totalTasks,
        completedTasks,
        openTasks,
        completionRate
      },
      statusDistribution: [
        { status: 'TODO', label: 'To Do', count: statusCounts['TODO'] },
        { status: 'IN_PROGRESS', label: 'In Progress', count: statusCounts['IN_PROGRESS'] },
        { status: 'IN_REVIEW', label: 'In Review', count: statusCounts['IN_REVIEW'] },
        { status: 'DONE', label: 'Done', count: statusCounts['DONE'] }
      ],
      priorityDistribution: [
        { priority: 'LOW', label: 'Low', count: priorityCounts['LOW'] },
        { priority: 'MEDIUM', label: 'Medium', count: priorityCounts['MEDIUM'] },
        { priority: 'HIGH', label: 'High', count: priorityCounts['HIGH'] },
        { priority: 'URGENT', label: 'Urgent', count: priorityCounts['URGENT'] }
      ]
    };
  }

  static async getWorkloadAnalytics(orgId: string) {
    const orgObjectId = new Types.ObjectId(orgId);

    const workloadAggregation = await Task.aggregate([
      { $match: { organizationId: orgObjectId, assigneeId: { $ne: null } } },
      {
        $group: {
          _id: '$assigneeId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] }
          },
          openTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'DONE'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          avatarUrl: '$user.avatarUrl',
          totalTasks: 1,
          completedTasks: 1,
          openTasks: 1
        }
      },
      { $sort: { totalTasks: -1 } }
    ]);

    return workloadAggregation;
  }
}
