import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { ProjectMember } from '../src/models/projectMember.model';

describe('Projects API & Access Controls', () => {
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
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});

    // Register Creator
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Project Creator',
      email: 'creator@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register Other User
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Other User',
      email: 'otheruser@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Tech Solutions', slug: 'tech-solutions' });

    orgId = orgRes.body.data.organization.id;

    // Add user 2 as MEMBER of Org
    await OrganizationMember.create({
      organizationId: orgId,
      userId: user2Id,
      role: 'MEMBER'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/organizations/:orgId/projects', () => {
    it('should create a project with auto-generated key and set owner as MANAGER', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Web Portal Engineering',
          description: 'Frontend SaaS UI rebuild',
          priority: 'HIGH'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('Web Portal Engineering');
      expect(res.body.data.project.key).toBe('WPE');
      expect(res.body.data.member.role).toBe('MANAGER');
    });

    it('should allow custom uppercase project key', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Mobile App',
          key: 'MOB'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.key).toBe('MOB');
    });
  });

  describe('Project Membership & Access Controls', () => {
    it('should allow project manager to add team members to project', async () => {
      const createRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Backend Services', key: 'API' });

      const projectId = createRes.body.data.project.id;

      const addMemberRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id, role: 'VIEWER' });

      expect(addMemberRes.status).toBe(201);
      expect(addMemberRes.body.data.member.role).toBe('VIEWER');
    });

    it('should reject non-project members from updating project', async () => {
      const createRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Secret R&D', key: 'RND' });

      const projectId = createRes.body.data.project.id;

      const updateRes = await request(app)
        .put(`/api/v1/organizations/${orgId}/projects/${projectId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacked Project' });

      expect(updateRes.status).toBe(403);
    });
  });

  describe('Project Archiving', () => {
    it('should allow project archiving by MANAGER', async () => {
      const createRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Legacy App', key: 'LEG' });

      const projectId = createRes.body.data.project.id;

      const archiveRes = await request(app)
        .patch(`/api/v1/organizations/${orgId}/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ isArchived: true });

      expect(archiveRes.status).toBe(200);
      expect(archiveRes.body.data.project.isArchived).toBe(true);
      expect(archiveRes.body.data.project.status).toBe('ARCHIVED');
    });
  });
});
