import { User } from './auth';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Organization {
  id: string;
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOrganization {
  organization: Organization;
  role: OrgRole;
  joinedAt: string;
}

export interface OrganizationMember {
  id: string;
  _id: string;
  organizationId: string;
  userId: User;
  role: OrgRole;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  _id: string;
  organizationId: string;
  email: string;
  role: OrgRole;
  invitedBy: User;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}
