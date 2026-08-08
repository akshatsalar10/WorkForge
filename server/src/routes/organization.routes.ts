import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { TaskController } from '../controllers/task.controller';
import teamRoutes from './team.routes';
import projectRoutes from './project.routes';
import attachmentRoutes from './attachment.routes';
import analyticsRoutes from './analytics.routes';
import searchRoutes from './search.routes';
import { createLabelSchema } from '../validators/task.validator';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { requireOrgRole } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  changeMemberRoleSchema
} from '../validators/organization.validator';

const router = Router();

// All organization routes require authentication
router.use(authenticate);

// User Organization List & Creation
router.get('/', OrganizationController.getUserOrganizations);
router.post('/', validate(createOrganizationSchema), OrganizationController.createOrganization);

// Organization Scoped Endpoints
router.get('/:orgId', tenantGuard, OrganizationController.getOrganizationDetails);
router.put('/:orgId', tenantGuard, requireOrgRole('ADMIN'), validate(updateOrganizationSchema), OrganizationController.updateOrganization);

// Organization Export & Audit Logs
router.get('/:orgId/export', tenantGuard, requireOrgRole('OWNER'), OrganizationController.exportData);
router.get('/:orgId/audit-logs', tenantGuard, requireOrgRole('ADMIN'), OrganizationController.getAuditLogs);
router.delete('/:orgId', tenantGuard, requireOrgRole('OWNER'), OrganizationController.deleteOrganization);

// Members Management
router.get('/:orgId/members', tenantGuard, OrganizationController.getMembers);
router.patch('/:orgId/members/:memberId/role', tenantGuard, requireOrgRole('ADMIN'), validate(changeMemberRoleSchema), OrganizationController.changeMemberRole);
router.delete('/:orgId/members/:memberId', tenantGuard, requireOrgRole('ADMIN'), OrganizationController.removeMember);

// Invitations Management
router.get('/:orgId/invitations', tenantGuard, requireOrgRole('ADMIN'), OrganizationController.getPendingInvitations);
router.post('/:orgId/invitations', tenantGuard, requireOrgRole('ADMIN'), validate(inviteMemberSchema), OrganizationController.inviteMember);
router.delete('/:orgId/invitations/:invitationId', tenantGuard, requireOrgRole('ADMIN'), OrganizationController.revokeInvitation);

// Teams Management (nested router)
router.use('/:orgId/teams', teamRoutes);

// Projects Management (nested router)
router.use('/:orgId/projects', projectRoutes);

// File Attachments (nested router)
router.use('/:orgId/attachments', attachmentRoutes);

// Productivity Analytics (nested router)
router.use('/:orgId/analytics', analyticsRoutes);

// Global Search (nested router)
router.use('/:orgId/search', searchRoutes);

// Org-level Tasks & Labels
router.get('/:orgId/tasks', tenantGuard, TaskController.getOrganizationTasks);
router.get('/:orgId/labels', tenantGuard, TaskController.getLabels);
router.post('/:orgId/labels', tenantGuard, validate(createLabelSchema), TaskController.createLabel);

export default router;
