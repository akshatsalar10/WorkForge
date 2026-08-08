import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';

describe('Global Search API', () => {
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
      name: 'Search Master',
      email: 'search@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Search Engine Inc', slug: 'search-inc' });

    orgId = orgRes.body.data.organization.id;

    // Create Project
    const projRes = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Frontend Redesign', key: 'FED' });

    projectId = projRes.body.data.project.id;

    // Create Task
    await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Build Search Bar Widget' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/organizations/:orgId/search', () => {
    it('should return categorized search results for tasks and projects', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/search`)
        .set('Authorization', `Bearer ${user1Token}`)
        .query({ q: 'Search' });

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Build Search Bar Widget');
    });

    it('should return empty categories when no matches found', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/search`)
        .set('Authorization', `Bearer ${user1Token}`)
        .query({ q: 'NonExistentTerm' });

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(0);
      expect(res.body.data.projects.length).toBe(0);
    });
  });
});
