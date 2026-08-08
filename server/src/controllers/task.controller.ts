import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { ApiResponse } from '../utils/apiResponse';

export class TaskController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(
        req.params.orgId,
        req.params.projectId,
        req.user!._id.toString(),
        req.body
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Task created successfully.',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.getProjectTasks(req.params.orgId, req.params.projectId, {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assigneeId: req.query.assigneeId as string,
        search: req.query.search as string,
        labelId: req.query.labelId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      });

      return ApiResponse.success({
        res,
        message: 'Project tasks fetched.',
        data: result.tasks,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrganizationTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.getOrganizationTasks(req.params.orgId, {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assigneeId: req.query.assigneeId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      });

      return ApiResponse.success({
        res,
        message: 'Organization tasks fetched.',
        data: result.tasks,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.orgId, req.params.taskId);
      return ApiResponse.success({
        res,
        message: 'Task details fetched.',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTask(req.params.orgId, req.params.taskId, req.body);
      return ApiResponse.success({
        res,
        message: 'Task updated successfully.',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTaskStatus(
        req.params.orgId,
        req.params.taskId,
        req.body.status,
        req.body.order
      );
      return ApiResponse.success({
        res,
        message: 'Task status updated.',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteTask(req.params.orgId, req.params.taskId);
      return ApiResponse.success({
        res,
        message: 'Task deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await TaskService.getOrganizationLabels(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Labels fetched.',
        data: { labels }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await TaskService.createLabel(req.params.orgId, req.body.name, req.body.color);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Label created successfully.',
        data: { label }
      });
    } catch (error) {
      next(error);
    }
  }
}
