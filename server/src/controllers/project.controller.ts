import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/apiResponse';

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { project, member } = await ProjectService.createProject(
        req.params.orgId,
        req.user!._id.toString(),
        req.body
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Project created successfully.',
        data: { project, member }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProjectService.getOrganizationProjects(req.params.orgId, {
        status: req.query.status as string,
        priority: req.query.priority as string,
        isArchived: req.query.isArchived as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      });

      return ApiResponse.success({
        res,
        message: 'Projects fetched successfully.',
        data: result.projects,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await ProjectService.getProjectById(req.params.orgId, req.params.projectId);
      return ApiResponse.success({
        res,
        message: 'Project details fetched.',
        data: details
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(req.params.orgId, req.params.projectId, req.body);
      return ApiResponse.success({
        res,
        message: 'Project updated successfully.',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  static async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const isArchived = req.body.isArchived !== false;
      const project = await ProjectService.archiveProject(req.params.orgId, req.params.projectId, isArchived);
      return ApiResponse.success({
        res,
        message: isArchived ? 'Project archived.' : 'Project unarchived.',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectService.deleteProject(req.params.orgId, req.params.projectId);
      return ApiResponse.success({
        res,
        message: 'Project deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await ProjectService.getProjectMembers(req.params.projectId);
      return ApiResponse.success({
        res,
        message: 'Project members fetched.',
        data: { members }
      });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.addProjectMember(
        req.params.orgId,
        req.params.projectId,
        req.body.userId,
        req.body.role
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Member added to project.',
        data: { member }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.updateProjectMemberRole(
        req.params.projectId,
        req.params.userId,
        req.body.role
      );
      return ApiResponse.success({
        res,
        message: 'Project member role updated.',
        data: { member }
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectService.removeProjectMember(req.params.projectId, req.params.userId);
      return ApiResponse.success({
        res,
        message: 'Member removed from project.'
      });
    } catch (error) {
      next(error);
    }
  }
}
