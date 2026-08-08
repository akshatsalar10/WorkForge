import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';

describe('Organization System Settings & Export API', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let orgId: string;
  let orgSlug: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforge-test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await OrganizationMember.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    // Register User 1 (Owner)
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Org Owner',
      email: 'owner@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2 (Member)
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular Member',
      email: 'member@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Security Vault Inc', slug: 'security-vault' });

    orgId = orgRes.body.data.organization.id;
    orgSlug = orgRes.body.data.organization.slug;

    await OrganizationMember.create({
      organizationId: orgId,
      userId: user2Id,
      role: 'MEMBER'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/organizations/:orgId/export', () => {
    it('should allow OWNER to export full organization JSON dataset', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/export`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.organization.slug).toBe(orgSlug);
      expect(res.body.members.length).toBe(2);
    });

    it('should reject non-OWNER from exporting organization data', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/export`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/organizations/:orgId', () => {
    it('should require matching confirmation slug to delete organization', async () => {
      const wrongSlugRes = await request(app)
        .delete(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ confirmationSlug: 'wrong-slug' });

      expect(wrongSlugRes.status).toBe(400);

      const deleteRes = await request(app)
        .delete(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ confirmationSlug: orgSlug });

      expect(deleteRes.status).toBe(200);

      const checkOrg = await Organization.findById(orgId);
      expect(checkOrg).toBeNull();
    });
  });
});
