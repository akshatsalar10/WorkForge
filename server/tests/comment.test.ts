import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';
import { Comment } from '../src/models/comment.model';
import { ActivityLog } from '../src/models/activityLog.model';

describe('Comments & Activity Log API', () => {
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
    await Comment.deleteMany({});
    await ActivityLog.deleteMany({});

    // Register User 1
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Comment Author',
      email: 'author@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Other Member',
      email: 'other@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Collab Workspace', slug: 'collab-ws' });

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
      .send({ name: 'Sprint 10', key: 'S10' });

    projectId = projRes.body.data.project.id;

    // Create Task
    const taskRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Implement Comments API' });

    taskId = taskRes.body.data.task.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST & GET /api/v1/organizations/:orgId/tasks/:taskId/comments', () => {
    it('should create a comment and auto-generate an activity log entry', async () => {
      const commentRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Looking good! Proceed with PR.' });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.data.comment.content).toBe('Looking good! Proceed with PR.');
      expect(commentRes.body.data.comment.authorId.name).toBe('Comment Author');

      const getCommentsRes = await request(app)
        .get(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(getCommentsRes.status).toBe(200);
      expect(getCommentsRes.body.data.comments.length).toBe(1);

      // Check Activity Log
      const activityRes = await request(app)
        .get(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/activity`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(activityRes.status).toBe(200);
      expect(activityRes.body.data.activities.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PUT & DELETE Comment Authorization', () => {
    it('should reject non-author from editing another user comment', async () => {
      const commentRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Author comment' });

      const commentId = commentRes.body.data.comment.id;

      const editRes = await request(app)
        .put(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Malicious edit' });

      expect(editRes.status).toBe(403);
    });
  });
});
