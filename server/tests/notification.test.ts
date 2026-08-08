import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Organization } from '../src/models/organization.model';
import { OrganizationMember } from '../src/models/organizationMember.model';
import { Project } from '../src/models/project.model';
import { Notification } from '../src/models/notification.model';

describe('Real-Time Notifications API', () => {
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
    await Notification.deleteMany({});

    // Register User 1 (Sender)
    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Notifier Boss',
      email: 'boss@example.com',
      password: 'Password123'
    });
    user1Token = reg1.body.data.tokens.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2 (Recipient)
    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Notifier Member',
      email: 'member@example.com',
      password: 'Password123'
    });
    user2Token = reg2.body.data.tokens.accessToken;
    user2Id = reg2.body.data.user.id;

    // Create Organization
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Notify Corp', slug: 'notify-corp' });

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
      .send({ name: 'Notification Engine', key: 'NTE' });

    projectId = projRes.body.data.project.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Task Assignment Notification Trigger & Unread Count', () => {
    it('should generate a notification for recipient when assigned a task', async () => {
      await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Implement Socket.IO notifications',
          assigneeId: user2Id
        });

      // Recipient checks notifications
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(notifRes.status).toBe(200);
      expect(notifRes.body.data.length).toBe(1);
      expect(notifRes.body.data[0].type).toBe('TASK_ASSIGNED');
      expect(notifRes.body.data[0].isRead).toBe(false);

      // Check unread count
      const unreadRes = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(unreadRes.status).toBe(200);
      expect(unreadRes.body.data.unreadCount).toBe(1);
    });

    it('should mark notification as read', async () => {
      await request(app)
        .post(`/api/v1/organizations/${orgId}/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Setup push alerts',
          assigneeId: user2Id
        });

      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      const notifList = notifRes.body.data.notifications || notifRes.body.data;
      const notifId = notifList[0].id || notifList[0]._id;

      const patchRes = await request(app)
        .patch(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.notification.isRead).toBe(true);
    });
  });
});
