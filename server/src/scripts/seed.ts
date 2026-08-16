import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Team } from '../models/team.model';
import { Project } from '../models/project.model';
import { ProjectMember } from '../models/projectMember.model';
import { Task } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { ActivityLog } from '../models/activityLog.model';
import { Notification } from '../models/notification.model';
import { Invitation } from '../models/invitation.model';

import { env } from '../config/env';
import { hashPassword } from '../utils/password';

async function seed() {
  const mongoUri = env.MONGODB_URI;
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    OrganizationMember.deleteMany({}),
    Team.deleteMany({}),
    Project.deleteMany({}),
    ProjectMember.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    ActivityLog.deleteMany({}),
    Notification.deleteMany({}),
    Invitation.deleteMany({})
  ]);

  console.log('Seeding Demo Users...');
  const passwordHash = await hashPassword('Password123');

  const userAlex = await User.create({
    name: 'Alex Mercer (Owner)',
    email: 'alex@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  const userSarah = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'sarah@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  const userDavid = await User.create({
    name: 'David Miller (PM)',
    email: 'david@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  const userEmily = await User.create({
    name: 'Emily Chen (Lead Frontend)',
    email: 'emily@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  const userMichael = await User.create({
    name: 'Michael Vance (Full Stack)',
    email: 'michael@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  const userJessica = await User.create({
    name: 'Jessica Taylor (UI/UX)',
    email: 'jessica@workforge.com',
    password: passwordHash,
    isEmailVerified: true
  });

  console.log('Seeding Demo Organizations...');
  const orgAcme = await Organization.create({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    ownerId: userAlex._id
  });

  const orgStark = await Organization.create({
    name: 'Stark Technologies',
    slug: 'stark-tech',
    ownerId: userAlex._id
  });

  console.log('Seeding Organization Memberships...');
  await OrganizationMember.create([
    { organizationId: orgAcme._id, userId: userAlex._id, role: 'OWNER' },
    { organizationId: orgAcme._id, userId: userSarah._id, role: 'ADMIN' },
    { organizationId: orgAcme._id, userId: userDavid._id, role: 'MEMBER' },
    { organizationId: orgAcme._id, userId: userEmily._id, role: 'MEMBER' },
    { organizationId: orgAcme._id, userId: userMichael._id, role: 'MEMBER' },
    { organizationId: orgAcme._id, userId: userJessica._id, role: 'MEMBER' },

    { organizationId: orgStark._id, userId: userAlex._id, role: 'OWNER' },
    { organizationId: orgStark._id, userId: userSarah._id, role: 'ADMIN' }
  ]);

  console.log('Seeding Teams...');
  const teamFrontend = await Team.create({
    organizationId: orgAcme._id,
    name: 'Frontend Engineering',
    description: 'React UI components, design tokens, responsive layouts, and user experience team.',
    members: [userEmily._id, userJessica._id, userDavid._id]
  });

  const teamBackend = await Team.create({
    organizationId: orgAcme._id,
    name: 'Core API & Backend',
    description: 'Express microservices, MongoDB aggregations, rate limiters, and Socket.IO engine.',
    members: [userSarah._id, userMichael._id, userAlex._id]
  });

  const teamDevOps = await Team.create({
    organizationId: orgAcme._id,
    name: 'DevOps & Infrastructure',
    description: 'Docker containerization, CI/CD deployment pipelines, and database optimization.',
    members: [userSarah._id, userMichael._id]
  });

  console.log('Seeding Projects...');
  const projWeb = await Project.create({
    organizationId: orgAcme._id,
    ownerId: userAlex._id,
    key: 'WEB',
    name: 'Web Application Redesign',
    description: 'Next-gen SaaS frontend dashboard with dark mode, glassmorphism styling, and RTK Query cache management.',
    status: 'ACTIVE',
    priority: 'HIGH'
  });

  const projApi = await Project.create({
    organizationId: orgAcme._id,
    ownerId: userSarah._id,
    key: 'API',
    name: 'Core API v2 Refactor',
    description: 'TypeScript refactor, OpenAPI documentation, and rate-limiting middleware.',
    status: 'ACTIVE',
    priority: 'URGENT'
  });

  const projMob = await Project.create({
    organizationId: orgAcme._id,
    ownerId: userDavid._id,
    key: 'MOB',
    name: 'Mobile Companion App (iOS & Android)',
    description: 'Native mobile companion app for task status updates, push notifications, and quick action triage.',
    status: 'ACTIVE',
    priority: 'MEDIUM'
  });

  console.log('Seeding Project Memberships...');
  await ProjectMember.create([
    { projectId: projWeb._id, userId: userAlex._id, role: 'MANAGER' },
    { projectId: projWeb._id, userId: userEmily._id, role: 'MEMBER' },
    { projectId: projWeb._id, userId: userJessica._id, role: 'MEMBER' },
    { projectId: projWeb._id, userId: userDavid._id, role: 'MEMBER' },

    { projectId: projApi._id, userId: userSarah._id, role: 'MANAGER' },
    { projectId: projApi._id, userId: userMichael._id, role: 'MEMBER' },
    { projectId: projApi._id, userId: userAlex._id, role: 'MEMBER' },

    { projectId: projMob._id, userId: userDavid._id, role: 'MANAGER' },
    { projectId: projMob._id, userId: userJessica._id, role: 'MEMBER' }
  ]);

  console.log('Seeding Tasks across all 4 Kanban Statuses...');
  const task1 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projWeb._id,
    taskNumber: 1,
    taskKey: 'WEB-1',
    title: 'Implement Dark Mode Theme & CSS Variable Tokens',
    description: 'Configure CSS variables for background glassmorphism, brand primary colors, and hover micro-animations.',
    status: 'DONE',
    priority: 'HIGH',
    assigneeId: userEmily._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Define brand colors in index.css', completed: true },
      { title: 'Test card hover transitions', completed: true }
    ]
  });

  const task2 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projWeb._id,
    taskNumber: 2,
    taskKey: 'WEB-2',
    title: 'Build Drag and Drop Kanban Board with Optimistic UI',
    description: 'Integrate @dnd-kit/core and @dnd-kit/sortable with optimistic state updates and server rollback error handling.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assigneeId: userEmily._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Setup KanbanBoardPage layout', completed: true },
      { title: 'Bind handleDragEnd optimistic update', completed: false }
    ]
  });

  const task3 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projWeb._id,
    taskNumber: 3,
    taskKey: 'WEB-3',
    title: 'Command Palette Shortcut (Cmd/Ctrl + K)',
    description: 'Global modal listener allowing multi-collection search across tasks, projects, teams, and members.',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    assigneeId: userDavid._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Create CommandPaletteModal component', completed: true },
      { title: 'Bind keydown listener in DashboardLayout', completed: true }
    ]
  });

  const task4 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projWeb._id,
    taskNumber: 4,
    taskKey: 'WEB-4',
    title: 'Responsive Navigation Drawer & Mobile Layout',
    description: 'Ensure sidebar navigation folds gracefully into mobile hamburger drawer on smaller screen viewports.',
    status: 'TODO',
    priority: 'LOW',
    assigneeId: userJessica._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Add mobile breakpoint styles', completed: false },
      { title: 'Test on iOS and Android viewports', completed: false }
    ]
  });

  const task5 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projApi._id,
    taskNumber: 1,
    taskKey: 'API-1',
    title: 'MongoDB Aggregation Engine for Productivity Analytics',
    description: 'Aggregate task status distributions, priority breakdowns, completion rates, and team member workloads.',
    status: 'DONE',
    priority: 'HIGH',
    assigneeId: userSarah._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Create AnalyticsService aggregation queries', completed: true },
      { title: 'Build Recharts AnalyticsPage frontend', completed: true }
    ]
  });

  const task6 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projApi._id,
    taskNumber: 2,
    taskKey: 'API-2',
    title: 'OpenAPI 3.0.3 Specification & Rate Limiting Hardening',
    description: 'Add express-rate-limit middleware and serve interactive openapi.json under /api-docs.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assigneeId: userSarah._id,
    reporterId: userAlex._id,
    createdById: userAlex._id,
    subtasks: [
      { title: 'Configure apiRateLimiter windowMs', completed: true },
      { title: 'Mount openapiSpec endpoint in app.ts', completed: true }
    ]
  });

  const task7 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projApi._id,
    taskNumber: 3,
    taskKey: 'API-3',
    title: 'Socket.IO Real-Time Notification Broadcast Engine',
    description: 'Broadcast instant notification room events to connected socket clients upon task assignments and comments.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assigneeId: userMichael._id,
    reporterId: userSarah._id,
    createdById: userSarah._id,
    subtasks: [
      { title: 'Initialize socket.ts server handler', completed: true },
      { title: 'Add header bell animated pulse badge', completed: true }
    ]
  });

  const task8 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projApi._id,
    taskNumber: 4,
    taskKey: 'API-4',
    title: 'Nodemailer SMTP Email Transport Integration',
    description: 'Integrate SMTP email sending for workspace invitations, email verification, password reset, and task assignments.',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: userMichael._id,
    reporterId: userSarah._id,
    createdById: userSarah._id,
    subtasks: [
      { title: 'Build EmailService class using Nodemailer', completed: true },
      { title: 'Connect invitation email trigger', completed: true }
    ]
  });

  const task9 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projMob._id,
    taskNumber: 1,
    taskKey: 'MOB-1',
    title: 'Mobile App Authentication Screen Wireframes',
    description: 'Design Figma wireframes for biometric login, dark theme layout, and project switcher.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assigneeId: userJessica._id,
    reporterId: userDavid._id,
    createdById: userDavid._id,
    subtasks: [
      { title: 'Create mobile login screen mockup', completed: true },
      { title: 'Review with product manager', completed: false }
    ]
  });

  const task10 = await Task.create({
    organizationId: orgAcme._id,
    projectId: projMob._id,
    taskNumber: 2,
    taskKey: 'MOB-2',
    title: 'Push Notification Payload Schema & Device Tokens',
    description: 'Define device token registration schema and APNS/FCM push notification payload structures.',
    status: 'TODO',
    priority: 'LOW',
    assigneeId: userDavid._id,
    reporterId: userDavid._id,
    createdById: userDavid._id,
    subtasks: [
      { title: 'Define APNS push schema', completed: false }
    ]
  });

  console.log('Seeding Pending Invitations...');
  await Invitation.create([
    {
      organizationId: orgAcme._id,
      email: 'jason.bourne@gmail.com',
      role: 'MEMBER',
      invitedBy: userAlex._id,
      token: 'invite-token-jason-12345',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      organizationId: orgAcme._id,
      email: 'lisa.simpson@techcorp.io',
      role: 'ADMIN',
      invitedBy: userSarah._id,
      token: 'invite-token-lisa-67890',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log('Seeding Comments...');
  await Comment.create([
    {
      organizationId: orgAcme._id,
      taskId: task2._id,
      authorId: userAlex._id,
      content: 'Great progress on the Kanban drag handles! Make sure optimistic state rollback works cleanly if the server returns a 500 error.'
    },
    {
      organizationId: orgAcme._id,
      taskId: task2._id,
      authorId: userEmily._id,
      content: 'Tested the rollback logic with network throttling enabled. Optimistic state works smooth!'
    },
    {
      organizationId: orgAcme._id,
      taskId: task5._id,
      authorId: userSarah._id,
      content: 'Analytics queries are using $match and $group pipelines with compound indexes for maximum performance.'
    },
    {
      organizationId: orgAcme._id,
      taskId: task7._id,
      authorId: userMichael._id,
      content: 'Socket.IO rooms emit event notifications directly to active organization members in real-time.'
    }
  ]);

  console.log('Seeding Activity Logs...');
  await ActivityLog.create([
    {
      organizationId: orgAcme._id,
      actorId: userAlex._id,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task1._id,
      details: { title: task1.title, taskKey: task1.taskKey }
    },
    {
      organizationId: orgAcme._id,
      actorId: userEmily._id,
      action: 'STATUS_CHANGED',
      entityType: 'TASK',
      entityId: task1._id,
      details: { from: 'IN_PROGRESS', to: 'DONE' }
    },
    {
      organizationId: orgAcme._id,
      actorId: userSarah._id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: projApi._id,
      details: { name: projApi.name, key: projApi.key }
    },
    {
      organizationId: orgAcme._id,
      actorId: userMichael._id,
      action: 'COMMENT_ADDED',
      entityType: 'TASK',
      entityId: task7._id,
      details: { content: 'Socket.IO rooms emit event notifications directly...' }
    }
  ]);

  console.log('Seeding Notifications...');
  await Notification.create([
    {
      organizationId: orgAcme._id,
      recipientId: userEmily._id,
      senderId: userAlex._id,
      type: 'TASK_ASSIGNED',
      title: 'Assigned to task WEB-2',
      message: 'Alex Mercer assigned you to "Build Drag and Drop Kanban Board with Optimistic UI".',
      entityId: task2._id,
      isRead: false
    },
    {
      organizationId: orgAcme._id,
      recipientId: userDavid._id,
      senderId: userAlex._id,
      type: 'TASK_ASSIGNED',
      title: 'Assigned to task WEB-3',
      message: 'Alex Mercer assigned you to "Command Palette Shortcut (Cmd/Ctrl + K)".',
      entityId: task3._id,
      isRead: true
    },
    {
      organizationId: orgAcme._id,
      recipientId: userJessica._id,
      senderId: userDavid._id,
      type: 'TASK_ASSIGNED',
      title: 'Assigned to task MOB-1',
      message: 'David Miller assigned you to "Mobile App Authentication Screen Wireframes".',
      entityId: task9._id,
      isRead: false
    }
  ]);

  console.log('\n==================================================');
  console.log(' WORKFORGE DATABASE SEEDED WITH RICH PRODUCTION DATA');
  console.log('==================================================');
  console.log('Demo Accounts Available (Password for all: Password123):');
  console.log('  1. Org Owner:       alex@workforge.com');
  console.log('  2. Org Admin:       sarah@workforge.com');
  console.log('  3. Project Manager: david@workforge.com');
  console.log('  4. Frontend Lead:   emily@workforge.com');
  console.log('  5. Full Stack Eng:  michael@workforge.com');
  console.log('  6. UI/UX Designer:  jessica@workforge.com');
  console.log('==================================================\n');

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
