import { Attachment, IAttachment, AttachmentEntityType } from '../models/attachment.model';
import { AppError } from '../utils/appError';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';

export class AttachmentService {
  static async createAttachment(
    orgId: string,
    uploaderId: string,
    file: Express.Multer.File,
    entityType: AttachmentEntityType,
    entityId: string
  ): Promise<IAttachment> {
    if (!file) {
      throw new AppError('No file provided for upload.', 400);
    }

    const fileUrl = `/uploads/${file.filename}`;

    const attachment = await Attachment.create({
      organizationId: new Types.ObjectId(orgId),
      uploaderId: new Types.ObjectId(uploaderId),
      entityType,
      entityId: new Types.ObjectId(entityId),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      key: file.filename
    });

    return await attachment.populate('uploaderId', 'name email avatarUrl');
  }

  static async getEntityAttachments(
    orgId: string,
    entityType: AttachmentEntityType,
    entityId: string
  ): Promise<IAttachment[]> {
    const attachments = await Attachment.find({
      organizationId: orgId,
      entityType,
      entityId
    })
      .populate('uploaderId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    return attachments;
  }

  static async deleteAttachment(
    orgId: string,
    attachmentId: string,
    userId: string,
    isOrgAdmin: boolean
  ): Promise<void> {
    const attachment = await Attachment.findOne({ _id: attachmentId, organizationId: orgId });
    if (!attachment) {
      throw new AppError('Attachment not found.', 404);
    }

    if (attachment.uploaderId.toString() !== userId && !isOrgAdmin) {
      throw new AppError('Permission denied. You can only delete your own file uploads.', 403);
    }

    // Unlink file from local disk if it exists
    const filePath = path.join(__dirname, '../../uploads', attachment.key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        // Log error silently if unlinking fails
      }
    }

    await Attachment.findByIdAndDelete(attachmentId);
  }
}
