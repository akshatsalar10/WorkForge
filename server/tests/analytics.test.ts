import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';

describe('Productivity Analytics API', () => {
  let user1Token: string;
  let user1Id: string;
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

    // Register User
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Analytics Admin',
      email: 'analytics@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Data Dynamics', slug: 'data-dynamics' });

    orgId = orgRes.body.data.organization.id;

    // Create Project
    const projRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Analytics Platform', key: 'ANL' });

    projectId = projRes.body.data.project.id;

    // Create Tasks with mixed status & priorities
    await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task 1', status: 'DONE', priority: 'HIGH', assigneeId: user1Id });

    await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task 2', status: 'IN_PROGRESS', priority: 'URGENT', assigneeId: user1Id });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/organizations/:orgId/analytics/summary', () => {
    it('should aggregate metrics and status distributions', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/analytics/summary`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalTasks).toBe(2);
      expect(res.body.data.metrics.completedTasks).toBe(1);
      expect(res.body.data.metrics.completionRate).toBe(50);
      expect(res.body.data.statusDistribution).toBeDefined();
    });
  });

  describe('GET /api/v1/organizations/:orgId/analytics/workload', () => {
    it('should return assignee workload aggregation', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/analytics/workload`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.workload.length).toBe(1);
      expect(res.body.data.workload[0].totalTasks).toBe(2);
      expect(res.body.data.workload[0].completedTasks).toBe(1);
    });
  });
});

