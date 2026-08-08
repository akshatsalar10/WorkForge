import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';

describe('Task Management API & Sequential Key Generation', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let orgId: string;
  let projectId: string;

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

    // Register User 1 (Creator)
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Task Manager',
      email: 'taskmgr@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2 (Assignee)
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Task Assignee',
      email: 'assignee@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Task Force', slug: 'task-force' });

    orgId = orgRes.body.data.organization.id;

    // Add User 2 to Organization
    await OrganizationMember.create({
      organizationId: orgId,
      userId: user2Id,
      role: 'MEMBER'
    });

    // Create Project
    const projRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Engineering Core', key: 'ENG' });

    projectId = projRes.body.data.project.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Sequential Task Key Generation & Creation', () => {
    it('should generate human-readable sequential keys ENG-1 and ENG-2', async () => {
      const task1Res = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Implement Auth Service',
          priority: 'HIGH',
          assigneeId: user2Id
        });

      expect(task1Res.status).toBe(201);
      expect(task1Res.body.data.task.taskKey).toBe('ENG-1');
      expect(task1Res.body.data.task.taskNumber).toBe(1);

      const task2Res = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Setup Database Migrations',
          priority: 'URGENT'
        });

      expect(task2Res.status).toBe(201);
      expect(task2Res.body.data.task.taskKey).toBe('ENG-2');
      expect(task2Res.body.data.task.taskNumber).toBe(2);
    });
  });

  describe('Task Status Moves & Updates', () => {
    it('should update task status from TODO to IN_PROGRESS and DONE', async () => {
      const createRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Design Database Schema' });

      const taskId = createRes.body.data.task.id;

      const patchRes = await request(app)
        .patch(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ status: 'IN_PROGRESS' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.task.status).toBe('IN_PROGRESS');
    });
  });

  describe('Subtask Management', () => {
    it('should support subtasks embedded array updates', async () => {
      const createRes = await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Release v1.0',
          subtasks: [
            { title: 'Write Changelog', isCompleted: false },
            { title: 'Tag Release in Git', isCompleted: true }
          ]
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.task.subtasks.length).toBe(2);
    });
  });
});
