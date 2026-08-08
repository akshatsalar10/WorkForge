import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Team } from '../src/models/team.model';

describe('Teams API & Authorization', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let orgId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforge-test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await OrganizationMember.deleteMany({});
    await Team.deleteMany({});

    // Register Owner
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Team Owner',
      email: 'teamowner@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register Member
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Team Member',
      email: 'teammember@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Org
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Dev Corp', slug: 'dev-corp' });

    orgId = orgRes.body.data.organization.id;

    // Add user 2 as MEMBER
    await OrganizationMember.create({
      organizationId: orgId,
      userId: user2Id,
      role: 'MEMBER'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/organizations/:orgId/teams', () => {
    it('should allow ADMIN/OWNER to create a team', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/${orgId}/teams`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Engineering', description: 'Core product dev' });

      expect(res.status).toBe(201);
      expect(res.body.data.team.name).toBe('Engineering');
    });

    it('should reject duplicate team name in same organization', async () => {
      await request(app)
        .post(`/api/v1/organizations/${orgId}/teams`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Engineering' });

      const res = await request(app)
        .post(`/api/v1/organizations/${orgId}/teams`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Engineering' });

      expect(res.status).toBe(409);
    });

    it('should reject team creation by non-ADMIN MEMBER', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/${orgId}/teams`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Design' });

      expect(res.status).toBe(403);
    });
  });

  describe('Team Member Management', () => {
    it('should allow adding org member to team', async () => {
      const teamRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/teams`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'QA Team' });

      const teamId = teamRes.body.data.team.id;

      const addRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id });

      expect(addRes.status).toBe(200);
      expect(addRes.body.data.team.members.some((m: any) => m.id === user2Id || m._id === user2Id)).toBe(true);
    });
  });
});
