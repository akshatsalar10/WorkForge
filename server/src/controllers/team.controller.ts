import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';
import { ApiResponse } from '../utils/apiResponse';

export class TeamController {
  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.createTeam(req.params.orgId, req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Team created successfully.',
        data: { team }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamService.getOrganizationTeams(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Teams fetched successfully.',
        data: { teams }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.getTeamById(req.params.orgId, req.params.teamId);
      return ApiResponse.success({
        res,
        message: 'Team details fetched.',
        data: { team }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.updateTeam(req.params.orgId, req.params.teamId, req.body);
      return ApiResponse.success({
        res,
        message: 'Team updated successfully.',
        data: { team }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await TeamService.deleteTeam(req.params.orgId, req.params.teamId);
      return ApiResponse.success({
        res,
        message: 'Team deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.addMemberToTeam(req.params.orgId, req.params.teamId, req.body.userId);
      return ApiResponse.success({
        res,
        message: 'Member added to team.',
        data: { team }
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.removeMemberFromTeam(req.params.orgId, req.params.teamId, req.params.userId);
      return ApiResponse.success({
        res,
        message: 'Member removed from team.',
        data: { team }
      });
    } catch (error) {
      next(error);
    }
  }
}
