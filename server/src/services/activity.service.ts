import { ActivityLog, IActivityLog, ActivityEntityType, ActivityAction } from '../models/activityLog.model';
import { Types } from 'mongoose';

export class ActivityService {
  static async logEvent(
    orgId: string,
    entityType: ActivityEntityType,
    entityId: string,
    actorId: string,
    action: ActivityAction,
    details?: Record<string, any>
  ): Promise<IActivityLog> {
    return await ActivityLog.create({
      organizationId: new Types.ObjectId(orgId),
      entityType,
      entityId: new Types.ObjectId(entityId),
      actorId: new Types.ObjectId(actorId),
      action,
      details: details || {}
    });
  }

  static async getEntityActivities(orgId: string, entityId: string, limit: number = 30): Promise<IActivityLog[]> {
    return await ActivityLog.find({
      organizationId: orgId,
      entityId
    })
      .populate('actorId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
