import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';
import { OrganizationExportService } from '../services/organizationExport.service';
import { ActivityService } from '../services/activity.service';
import { ApiResponse } from '../utils/apiResponse';

export class OrganizationController {
  static async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, member } = await OrganizationService.createOrganization(
        req.user!._id.toString(),
        req.body
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Organization created successfully.',
        data: { organization, member }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const organizations = await OrganizationService.getUserOrganizations(req.user!._id.toString());
      return ApiResponse.success({
        res,
        message: 'User organizations fetched.',
        data: { organizations }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrganizationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await OrganizationService.getOrganizationDetails(
        req.params.orgId,
        req.user!._id.toString()
      );
      return ApiResponse.success({
        res,
        message: 'Organization details fetched.',
        data: details
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await OrganizationService.updateOrganization(req.params.orgId, req.body);
      return ApiResponse.success({
        res,
        message: 'Organization updated successfully.',
        data: { organization }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const confirmationSlug = req.body?.confirmationSlug || req.params.orgId;
      await OrganizationExportService.deleteOrganization(req.params.orgId, confirmationSlug);
      return ApiResponse.success({
        res,
        message: 'Organization deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await OrganizationService.getOrganizationMembers(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Organization members fetched.',
        data: { members }
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await OrganizationService.changeMemberRole(
        req.params.orgId,
        req.params.memberId,
        req.body.role,
        req.user!._id.toString()
      );
      return ApiResponse.success({
        res,
        message: 'Member role updated.',
        data: { membership }
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.removeMember(
        req.params.orgId,
        req.params.memberId,
        req.user!._id.toString()
      );
      return ApiResponse.success({
        res,
        message: 'Member removed from organization.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const invitation = await OrganizationService.inviteMember(
        req.params.orgId,
        req.body,
        req.user!._id.toString()
      );
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Invitation sent successfully.',
        data: { invitation }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const invitations = await OrganizationService.getPendingInvitations(req.params.orgId);
      return ApiResponse.success({
        res,
        message: 'Pending invitations fetched.',
        data: { invitations }
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.revokeInvitation(req.params.orgId, req.params.invitationId);
      return ApiResponse.success({
        res,
        message: 'Invitation revoked.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationExportService.exportOrganizationData(req.params.orgId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=workforge-export-${data.organization.slug}.json`);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await ActivityService.getEntityActivities(req.params.orgId, req.params.orgId, 100);
      return ApiResponse.success({
        res,
        message: 'Security audit logs fetched.',
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganizationService.acceptInvitation(req.body.token, req.user!._id.toString());
      return ApiResponse.success({
        res,
        message: 'Invitation accepted successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
