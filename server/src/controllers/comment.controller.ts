import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { ActivityService } from '../services/activity.service';
import { ApiResponse } from '../utils/apiResponse';

export class CommentController {
  static async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.createComment(
        req.params.orgId,
        req.params.taskId,
        req.user!._id.toString(),
        req.body.content
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Comment added.',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.getTaskComments(req.params.orgId, req.params.taskId);
      return ApiResponse.success({
        res,
        message: 'Comments fetched.',
        data: { comments }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const isOrgAdmin = req.membership && (req.membership.role === 'OWNER' || req.membership.role === 'ADMIN');
      const comment = await CommentService.updateComment(
        req.params.orgId,
        req.params.commentId,
        req.user!._id.toString(),
        Boolean(isOrgAdmin),
        req.body.content
      );
      return ApiResponse.success({
        res,
        message: 'Comment updated.',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const isOrgAdmin = req.membership && (req.membership.role === 'OWNER' || req.membership.role === 'ADMIN');
      await CommentService.deleteComment(
        req.params.orgId,
        req.params.commentId,
        req.user!._id.toString(),
        Boolean(isOrgAdmin)
      );
      return ApiResponse.success({
        res,
        message: 'Comment deleted.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await ActivityService.getEntityActivities(req.params.orgId, req.params.taskId);
      return ApiResponse.success({
        res,
        message: 'Activity log fetched.',
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }
}
