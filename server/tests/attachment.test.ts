import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';
import { Attachment } from '../src/models/attachment.model';

describe('File Attachments API & Multi-Tenant Scoping', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let orgId: string;
  let projectId: string;
  let taskId: string;

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
    await Attachment.deleteMany({});

    // Register User 1
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Uploader User',
      email: 'uploader@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Non Uploader',
      email: 'nonuploader@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Asset Cloud', slug: 'asset-cloud' });

    orgId = orgRes.body.data.organization.id;

    await OrganizationMember.create({
      organizationId: orgId,
      userId: user2Id,
      role: 'MEMBER'
    });

    // Create Project
    const projRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Media Vault', key: 'MED' });

    projectId = projRes.body.data.project.id;

    // Create Task
    const taskRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Attach UI mockups' });

    taskId = taskRes.body.data.task.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST & GET /api/v1/organizations/:orgId/attachments', () => {
    it('should upload a file attachment and retrieve entity attachments', async () => {
      const buffer = Buffer.from('test text file content sample');

      const uploadRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .field('entityType', 'TASK')
        .field('entityId', taskId)
        .attach('file', buffer, 'spec.txt');

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.data.attachment.originalName).toBe('spec.txt');
      expect(uploadRes.body.data.attachment.mimeType).toBe('text/plain');

      const getRes = await request(app)
        .get(`/api/v1/organizations/${orgId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .query({ entityType: 'TASK', entityId: taskId });

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.attachments.length).toBe(1);
    });
  });

  describe('DELETE /api/v1/organizations/:orgId/attachments/:id', () => {
    it('should reject non-uploader member from deleting another user upload', async () => {
      const buffer = Buffer.from('sample pdf content');

      const uploadRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .field('entityType', 'TASK')
        .field('entityId', taskId)
        .attach('file', buffer, 'document.pdf');

      const attachmentId = uploadRes.body.data.attachment.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/organizations/${orgId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(deleteRes.status).toBe(403);
    });
  });
});
