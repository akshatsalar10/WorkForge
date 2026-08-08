import { Request, Response, NextFunction } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { ApiResponse } from '../utils/apiResponse';
import { AttachmentEntityType } from '../models/attachment.model';

export class AttachmentController {
  static async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.body;
      const attachment = await AttachmentService.createAttachment(
        req.params.orgId,
        req.user!._id.toString(),
        req.file!,
        entityType as AttachmentEntityType,
        entityId
      );

      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'File uploaded successfully.',
        data: { attachment }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.query;
      const attachments = await AttachmentService.getEntityAttachments(
        req.params.orgId,
        entityType as AttachmentEntityType,
        entityId as string
      );

      return ApiResponse.success({
        res,
        message: 'Attachments fetched.',
        data: { attachments }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const isOrgAdmin = req.membership && (req.membership.role === 'OWNER' || req.membership.role === 'ADMIN');
      await AttachmentService.deleteAttachment(
        req.params.orgId,
        req.params.id,
        req.user!._id.toString(),
        Boolean(isOrgAdmin)
      );

      return ApiResponse.success({
        res,
        message: 'Attachment deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
}
