import { Organization, IOrganization } from '../models/organization.model';
import { OrganizationMember, IOrganizationMember, OrgRole } from '../models/organizationMember.model';
import { Invitation, IInvitation } from '../models/invitation.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';
import { generateRandomToken } from '../utils/token';
import { EmailService } from './email.service';
import { Types } from 'mongoose';

export class OrganizationService {
  static async createOrganization(
    userId: string,
    data: { name: string; slug?: string; logoUrl?: string }
  ): Promise<{ organization: IOrganization; member: IOrganizationMember }> {
    let slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

    const existingSlug = await Organization.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const organization = await Organization.create({
      name: data.name,
      slug,
      logoUrl: data.logoUrl || '',
      ownerId: userId
    });

    const member = await OrganizationMember.create({
      organizationId: organization._id,
      userId,
      role: 'OWNER'
    });

    return { organization, member };
  }

  static async getUserOrganizations(userId: string) {
    const memberships = await OrganizationMember.find({ userId }).populate<{ organizationId: IOrganization }>('organizationId');

    return memberships
      .filter((m) => m.organizationId)
      .map((m) => ({
        organization: m.organizationId,
        role: m.role,
        joinedAt: m.joinedAt
      }));
  }

  static async getOrganizationDetails(orgId: string, userId: string) {
    const organization = await Organization.findById(orgId);
    if (!organization) throw new AppError('Organization not found.', 404);

    const membership = await OrganizationMember.findOne({ organizationId: orgId, userId });
    if (!membership) throw new AppError('Not a member of this organization.', 403);

    const memberCount = await OrganizationMember.countDocuments({ organizationId: orgId });

    return {
      organization,
      role: membership.role,
      memberCount
    };
  }

  static async updateOrganization(
    orgId: string,
    data: { name?: string; logoUrl?: string }
  ): Promise<IOrganization> {
    const organization = await Organization.findById(orgId);
    if (!organization) throw new AppError('Organization not found.', 404);

    if (data.name !== undefined) organization.name = data.name;
    if (data.logoUrl !== undefined) organization.logoUrl = data.logoUrl;

    await organization.save();
    return organization;
  }

  static async deleteOrganization(orgId: string, requesterUserId: string): Promise<void> {
    const organization = await Organization.findById(orgId);
    if (!organization) throw new AppError('Organization not found.', 404);

    if (organization.ownerId.toString() !== requesterUserId) {
      throw new AppError('Only the organization owner can delete the organization.', 403);
    }

    await OrganizationMember.deleteMany({ organizationId: orgId });
    await Invitation.deleteMany({ organizationId: orgId });
    await Organization.findByIdAndDelete(orgId);
  }

  static async getOrganizationMembers(orgId: string) {
    const members = await OrganizationMember.find({ organizationId: orgId })
      .populate('userId', 'name email avatarUrl isEmailVerified')
      .sort({ joinedAt: 1 });

    return members;
  }

  static async changeMemberRole(
    orgId: string,
    memberId: string,
    newRole: OrgRole,
    requesterUserId: string
  ): Promise<IOrganizationMember> {
    const targetMember = await OrganizationMember.findById(memberId);
    if (!targetMember || targetMember.organizationId.toString() !== orgId) {
      throw new AppError('Member not found in this organization.', 404);
    }

    if (targetMember.role === 'OWNER') {
      throw new AppError('Cannot change the role of the Organization Owner.', 400);
    }

    targetMember.role = newRole;
    await targetMember.save();

    // Send role update email notification
    const [organization, targetUser] = await Promise.all([
      Organization.findById(orgId),
      User.findById(targetMember.userId)
    ]);
    if (organization && targetUser) {
      EmailService.sendRoleUpdatedEmail(
        targetUser.email,
        targetUser.name,
        organization.name,
        newRole
      ).catch((err) => console.error('Failed to send role updated email:', err));
    }

    return targetMember;
  }

  static async removeMember(
    orgId: string,
    memberId: string,
    requesterUserId: string
  ): Promise<void> {
    const targetMember = await OrganizationMember.findById(memberId);
    if (!targetMember || targetMember.organizationId.toString() !== orgId) {
      throw new AppError('Member not found in this organization.', 404);
    }

    if (targetMember.role === 'OWNER') {
      throw new AppError('Cannot remove the Organization Owner.', 400);
    }

    await OrganizationMember.findByIdAndDelete(memberId);
  }

  static async inviteMember(
    orgId: string,
    data: { email: string; role: OrgRole },
    invitedByUserId: string
  ): Promise<IInvitation> {
    const email = data.email.toLowerCase();

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: existingUser._id
      });
      if (existingMember) {
        throw new AppError('User is already a member of this organization.', 409);
      }
    }

    // Check if there is already a pending invitation
    const existingInvite = await Invitation.findOne({
      organizationId: orgId,
      email,
      status: 'PENDING'
    });
    if (existingInvite) {
      throw new AppError('A pending invitation has already been sent to this email.', 409);
    }

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      organizationId: orgId,
      email,
      role: data.role,
      invitedBy: invitedByUserId,
      token,
      status: 'PENDING',
      expiresAt
    });

    // Send Invitation Email via Nodemailer
    const [organization, inviter] = await Promise.all([
      Organization.findById(orgId),
      User.findById(invitedByUserId)
    ]);

    if (organization && inviter) {
      try {
        await EmailService.sendInvitationEmail(
          email,
          organization.name,
          token,
          inviter.name
        );
      } catch (err) {
        console.error('Failed to send invitation email:', err);
      }
    }

    return invitation;
  }

  static async getPendingInvitations(orgId: string) {
    return await Invitation.find({ organizationId: orgId, status: 'PENDING' })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async revokeInvitation(orgId: string, invitationId: string): Promise<void> {
    const invitation = await Invitation.findOne({ _id: invitationId, organizationId: orgId });
    if (!invitation) throw new AppError('Invitation not found.', 404);
    await Invitation.findByIdAndDelete(invitationId);
  }

  static async acceptInvitation(
    token: string,
    userId: string
  ): Promise<{ organization: IOrganization; member: IOrganizationMember }> {
    const invitation = await Invitation.findOne({
      token,
      status: 'PENDING',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      throw new AppError('Invalid or expired invitation token.', 400);
    }

    const organization = await Organization.findById(invitation.organizationId);
    if (!organization) {
      throw new AppError('Organization no longer exists.', 404);
    }

    // Check if member already joined
    let member = await OrganizationMember.findOne({
      organizationId: invitation.organizationId,
      userId
    });

    if (!member) {
      member = await OrganizationMember.create({
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role
      });
    }

    invitation.status = 'ACCEPTED';
    await invitation.save();

    return { organization, member };
  }
}
