import { IUser } from '../models/user.model';
import { IOrganization } from '../models/organization.model';
import { IOrganizationMember } from '../models/organizationMember.model';
import { IProject } from '../models/project.model';
import { IProjectMember } from '../models/projectMember.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
      organization?: IOrganization;
      membership?: IOrganizationMember;
      project?: IProject;
      projectMembership?: IProjectMember;
    }
  }
}
