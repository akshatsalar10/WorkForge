import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/apiResponse';

export class AnalyticsController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getOrganizationSummary(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Analytics summary fetched.',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const workload = await AnalyticsService.getWorkloadAnalytics(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Workload analytics fetched.',
        data: { workload }
      });
    } catch (error) {
      next(error);
    }
  }
}
