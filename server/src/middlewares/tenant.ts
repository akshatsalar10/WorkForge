import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { Organization } from '../models/organization.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Types } from 'mongoose';

export const tenantGuard = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let orgId = req.headers['x-organization-id'] as string;

    if (!orgId && req.params.orgId) {
      orgId = req.params.orgId;
    }

    if (!orgId) {
      return next(new AppError('Organization context missing. Please select an organization.', 400));
    }

    if (!Types.ObjectId.isValid(orgId)) {
      return next(new AppError('Invalid organization identifier format.', 400));
    }

    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const membership = await OrganizationMember.findOne({
      organizationId: orgId,
      userId: req.user._id
    });

    if (!membership) {
      return next(
        new AppError(
          'Access forbidden. You are not a member of this organization.',
          403
        )
      );
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return next(new AppError('Organization not found.', 404));
    }

    req.organization = organization;
    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};
