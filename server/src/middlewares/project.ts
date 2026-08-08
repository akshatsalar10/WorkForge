import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { Project } from '../models/project.model';
import { ProjectMember, ProjectRole } from '../models/projectMember.model';
import { Types } from 'mongoose';

const projectRoleWeights: Record<ProjectRole, number> = {
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1
};

export const projectGuard = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return next(new AppError('Project identifier missing.', 400));
    }

    if (!Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid project identifier format.', 400));
    }

    if (!req.organization) {
      return next(new AppError('Organization tenant context missing.', 400));
    }

    const project = await Project.findOne({
      _id: projectId,
      organizationId: req.organization._id
    });

    if (!project) {
      return next(new AppError('Project not found in this organization.', 404));
    }

    req.project = project;

    // Check project membership (Org Owner/Admin bypasses project membership checks as MANAGER)
    const isOrgAdmin = req.membership && (req.membership.role === 'OWNER' || req.membership.role === 'ADMIN');

    if (isOrgAdmin) {
      req.projectMembership = {
        projectId: project._id,
        userId: req.user!._id,
        role: 'MANAGER'
      } as any;
    } else {
      const pm = await ProjectMember.findOne({
        projectId: project._id,
        userId: req.user!._id
      });
      req.projectMembership = pm || undefined;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectRole = (minRole: ProjectRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.projectMembership) {
      return next(new AppError('Access forbidden. You are not a member of this project.', 403));
    }

    const userWeight = projectRoleWeights[req.projectMembership.role] || 0;
    const requiredWeight = projectRoleWeights[minRole] || 0;

    if (userWeight < requiredWeight) {
      return next(new AppError(`Permission denied. Requires ${minRole} project role or higher.`, 403));
    }

    next();
  };
};
