import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Invitation } from '../src/models/invitation.model';

describe('Organization & Tenant Isolation API', () => {
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
    await Invitation.deleteMany({});

    // Register User 1
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Owner User',
      email: 'owner@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // User 1 creates an Organization
    const createOrgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Acme Corp', slug: 'acme-corp' });

    expect(createOrgRes.status).toBe(201);
    orgId = createOrgRes.body.data.organization.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/organizations', () => {
    it('should create an organization and set creator as OWNER', async () => {
      const res = await request(app)
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Stark Industries', slug: 'stark-ind' });

      expect(res.status).toBe(201);
      expect(res.body.data.organization.name).toBe('Stark Industries');
      expect(res.body.data.member.role).toBe('OWNER');
    });
  });

  describe('Tenant Isolation & Cross-Tenant Access Controls', () => {
    it('should forbid User 2 from accessing Acme Corp without membership', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow User 1 (member) to access Acme Corp details', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.organization.name).toBe('Acme Corp');
      expect(res.body.data.role).toBe('OWNER');
    });
  });

  describe('RBAC Role Restrictions', () => {
    it('should reject non-owner deletion attempts', async () => {
      // Add User 2 as MEMBER
      await OrganizationMember.create({
        organizationId: orgId,
        userId: user2Id,
        role: 'MEMBER'
      });

      const deleteRes = await request(app)
        .delete(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(deleteRes.status).toBe(403);
    });

    it('should allow OWNER to update organization details', async () => {
      const updateRes = await request(app)
        .put(`/api/v1/organizations/${orgId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Acme Global Corp' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.organization.name).toBe('Acme Global Corp');
    });
  });

  describe('Invitation Flow', () => {
    it('should allow ADMIN/OWNER to invite a user and accept invitation', async () => {
      const inviteRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/invitations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ email: 'newmember@example.com', role: 'MEMBER' });

      expect(inviteRes.status).toBe(201);
      const token = inviteRes.body.data.invitation.token;

      const acceptRes = await request(app)
        .post('/api/v1/invitations/accept')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ token });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.member.role).toBe('MEMBER');
    });
  });
});
