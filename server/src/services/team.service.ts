import { Team, ITeam } from '../models/team.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export class TeamService {
  static async createTeam(
    orgId: string,
    data: { name: string; description?: string; members?: string[] }
  ): Promise<ITeam> {
    const existing = await Team.findOne({ organizationId: orgId, name: data.name });
    if (existing) {
      throw new AppError('A team with this name already exists in this organization.', 409);
    }

    const memberObjectIds: Types.ObjectId[] = [];
    if (data.members && data.members.length > 0) {
      for (const uid of data.members) {
        const isOrgMember = await OrganizationMember.findOne({ organizationId: orgId, userId: uid });
        if (isOrgMember) {
          memberObjectIds.push(new Types.ObjectId(uid));
        }
      }
    }

    const team = await Team.create({
      organizationId: orgId,
      name: data.name,
      description: data.description || '',
      members: memberObjectIds
    });

    return team;
  }

  static async getOrganizationTeams(orgId: string) {
    const teams = await Team.find({ organizationId: orgId })
      .populate('members', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    return teams;
  }

  static async getTeamById(orgId: string, teamId: string): Promise<ITeam> {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId }).populate(
      'members',
      'name email avatarUrl isEmailVerified'
    );

    if (!team) {
      throw new AppError('Team not found in this organization.', 404);
    }

    return team;
  }

  static async updateTeam(
    orgId: string,
    teamId: string,
    data: { name?: string; description?: string }
  ): Promise<ITeam> {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId });
    if (!team) {
      throw new AppError('Team not found in this organization.', 404);
    }

    if (data.name && data.name !== team.name) {
      const existing = await Team.findOne({ organizationId: orgId, name: data.name });
      if (existing) {
        throw new AppError('A team with this name already exists in this organization.', 409);
      }
      team.name = data.name;
    }

    if (data.description !== undefined) {
      team.description = data.description;
    }

    await team.save();
    return team;
  }

  static async deleteTeam(orgId: string, teamId: string): Promise<void> {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId });
    if (!team) {
      throw new AppError('Team not found in this organization.', 404);
    }

    await Team.findByIdAndDelete(teamId);
  }

  static async addMemberToTeam(orgId: string, teamId: string, userId: string): Promise<ITeam> {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId });
    if (!team) {
      throw new AppError('Team not found in this organization.', 404);
    }

    // Verify user belongs to the Organization
    const isOrgMember = await OrganizationMember.findOne({ organizationId: orgId, userId });
    if (!isOrgMember) {
      throw new AppError('User must be a member of the organization before joining a team.', 400);
    }

    const userObjId = new Types.ObjectId(userId);
    if (team.members.some((m) => m.toString() === userId)) {
      throw new AppError('User is already a member of this team.', 409);
    }

    team.members.push(userObjId);
    await team.save();
    return await this.getTeamById(orgId, teamId);
  }

  static async removeMemberFromTeam(orgId: string, teamId: string, userId: string): Promise<ITeam> {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId });
    if (!team) {
      throw new AppError('Team not found in this organization.', 404);
    }

    team.members = team.members.filter((m) => m.toString() !== userId);
    await team.save();
    return await this.getTeamById(orgId, teamId);
  }
}
