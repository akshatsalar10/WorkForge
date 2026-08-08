import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { OrgRole } from '../models/organizationMember.model';

const roleHierarchy: Record<OrgRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1
};

export const requireOrgRole = (minRole: OrgRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership) {
      return next(new AppError('Tenant membership context missing.', 403));
    }

    const userRoleWeight = roleHierarchy[req.membership.role] || 0;
    const requiredRoleWeight = roleHierarchy[minRole] || 0;

    if (userRoleWeight < requiredRoleWeight) {
      return next(
        new AppError(
          `Permission denied. Requires ${minRole} privileges or higher.`,
          403
        )
      );
    }

    next();
  };
};
