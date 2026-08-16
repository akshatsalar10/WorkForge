# WorkForge — Enterprise Team Operations & Project Management Platform

> **Product Overview, Problem Statement, Solution Architecture, Feature Matrix & Client Showcase Guide**

---

## 1. Executive Summary

**WorkForge** is a production-grade, multi-tenant Project & Team Operations Management SaaS Platform engineered to streamline software development, product management, and cross-functional team collaboration.

Built with a modern **TypeScript Monorepo Architecture** (Node.js Express + React 18 Vite + MongoDB Atlas + Socket.IO), WorkForge provides an end-to-end alternative to fragmented enterprise tools like Jira, Trello, and Asana—combining real-time Kanban workflow boards, automated task tracking, team productivity analytics, file attachments, and instant email notifications into a single cohesive workspace.

---

## 2. Problem Statement Solved

### The Pain Points in Modern Team Collaboration:
1. **Tool Fragmentation & Context Switching**: Teams waste hours switching between separate apps for task management (Jira), real-time messaging (Slack), file sharing (Google Drive), and team analytics (Mixpanel).
2. **Lack of Real-Time Visibility**: Project managers struggle to track task progress across teams, leading to delayed releases and missed deadlines.
3. **High Per-Seat Software Costs**: Existing enterprise tools charge prohibitive per-user monthly fees that scale rapidly as organizations grow.
4. **Clunky User Experience**: Legacy project management tools are notoriously slow, confusing, and lack modern responsive dark-mode aesthetics.

### How WorkForge Solves It:
- **Unified All-in-One Workspace**: Consolidates task management, subtask checklists, Markdown discussions, file attachments, and analytics into a single application.
- **Instant Real-Time Synchronization**: Socket.IO event rooms ensure that every task status update, comment, or assignment is broadcast live to all active team members.
- **Optimistic UI Engine**: Interactive Kanban boards update instantly on drag-and-drop actions without waiting for network responses, backed by automatic rollback on errors.
- **Multi-Tenant Enterprise Isolation**: Robust Role-Based Access Controls (RBAC) isolate organization data while enabling seamless multi-workspace navigation.

---

## 3. Pre-Seeded Demo Accounts for Client Walkthrough

The platform includes a pre-seeded MongoDB database populated with real projects, team assignments, task cards across all 4 Kanban stages, discussion comments, file attachments, and activity logs.

> **Default Password for All Demo Accounts**: `Password123`

| Role | Demo Email | Password | What You Can Test & Showcase |
|---|---|---|---|
| **Organization Owner** | `alex@workforge.com` | `Password123` | Full Owner Access, Workspace Purging, Data Export JSON |
| **Organization Admin** | `sarah@workforge.com` | `Password123` | Admin Controls, Member Invitations, Security Audit Logs |
| **Project Manager** | `david@workforge.com` | `Password123` | Project Key Generation, Task Assignments, Board Triage |
| **Lead Frontend Eng** | `emily@workforge.com` | `Password123` | Drag & Drop Kanban Board, Subtask Progress Checklists |
| **Full Stack Engineer** | `michael@workforge.com` | `Password123` | Real-Time Socket Notifications, Backend API Tasks |
| **UI/UX Designer** | `jessica@workforge.com` | `Password123` | Mobile Wireframes, Attachment Previews |

---

## 4. Complete Feature Matrix (14 Core Modules)

### 🔐 Module 1: Authentication & Identity Security
- **JWT Access & Refresh Token Rotation**: 15-minute access tokens paired with 7-day HTTP-only refresh tokens.
- **Bcrypt Hashing**: Password hashing using 12 salt rounds.
- **Account Verification & Password Recovery**: Automated email dispatch for email verifications and password reset tokens.

### 🏢 Module 2: Multi-Tenant Organizations & Workspaces
- **Isolated Tenant Workspaces**: Workspace identification by unique URL slugs (`acme-corp`, `stark-tech`).
- **Role-Based Access Control (RBAC)**: Strict permission boundaries for `OWNER`, `ADMIN`, and `MEMBER`.
- **Tenant Guard Middleware**: Guarantees zero cross-tenant data leakage.

### 👥 Module 3: Team Management & Member Rosters
- **Department & Squad Allocation**: Create teams (e.g. *Frontend Engineering*, *DevOps*, *Core API*).
- **Roster Management**: Assign members to multiple teams and specify Team Lead designations.

### 📁 Module 4: Project Management & Key Generators
- **Human-Readable Project Keys**: Unique project prefixes (e.g. `WEB`, `API`, `MOB`).
- **Status & Priority Controls**: Filter projects by status (`ACTIVE`, `ARCHIVED`) and priority (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).

### 📌 Module 5: Task Management & Auto-Increment Key Generator
- **Sequential Task Identifiers**: Auto-incrementing key generation (`WEB-1`, `WEB-2`, `API-104`).
- **Subtask Checklists**: Interactive subtask items with percentage-complete progress bars.
- **Watcher Allocation**: Follow specific tasks for change notifications.

### 📋 Module 6: Drag-and-Drop Kanban Board
- **4 Kanban Columns**: `To Do`, `In Progress`, `In Review`, `Done`.
- **Optimistic UI Handler**: Immediate UI state mutation powered by `@dnd-kit` with automatic server rollback on network errors.

### 💬 Module 7: Comments & Activity Streams
- **Task Discussion Threads**: Markdown-enabled discussion feeds with relative timestamps.
- **Audit Logging**: Automated log records for task creation, status updates, and comment additions.

### 🔔 Module 8: Real-Time Socket.IO Notifications
- **Live Room Broadcasts**: Instant notification bell updates when tasks are assigned or commented on.
- **Notification Dropdown**: Popover list with unread counter badges.

### 📧 Module 9: Nodemailer SMTP Email Dispatch
- **Invitation Emails**: Sends tokenized invitation links to join organizations (`/accept-invitation?token=...`).
- **Assignment Alerts**: Instant email alerts sent to assignees when allocated a new task.
- **Comment Alerts**: Email notifications sent to task owners when team members post comments.

### 📎 Module 10: File Attachments Engine
- **Multipart Upload Engine**: Upload files up to 10MB (PDFs, images, text files, code snippets).
- **File Previews & Downloads**: Instant inline previews and secure file download links.

### 📊 Module 11: Team Productivity & Analytics Dashboard
- **MongoDB Aggregation Pipelines**: Real-time aggregation of task completion velocity and priority distribution.
- **Interactive Recharts Visualizations**: Status bar charts, priority pie breakdown, and team workload capacity tables.

### 🔍 Module 12: Global Command Palette (`Cmd/Ctrl + K`)
- **Multi-Collection Search**: Instant regex search across tasks, projects, teams, and members.
- **Keyboard Navigation**: Press `Cmd+K` or `Ctrl+K` anywhere in the app to launch the modal.

### ⚙️ Module 13: System Settings & Workspace Purging
- **JSON Data Backup Export**: Download complete workspace data backups with a single click.
- **Danger Zone Verification**: Protected organization deletion requiring exact slug input verification.

### 🚀 Module 14: Hardening & Cloud Production Deployment
- **Rate-Limiting Middleware**: Protects API endpoints against DDoS or brute-force attacks (`express-rate-limit`).
- **OpenAPI 3.0 Documentation**: Interactive spec JSON available at `/api-docs`.
- **Single-Origin SPA Serving**: Express backend serves Vite compiled frontend assets in production.

---

## 5. Technology Stack Summary

```
                       WORKFORGE PLATFORM ARCHITECTURE
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                               FRONTEND                                   │
 │   React 18  │  Vite  │  TypeScript  │  RTK Query  │  Tailwind CSS       │
 │   @dnd-kit (Kanban)  │  Recharts (Analytics)  │  Lucide Icons            │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │ REST API / WebSockets
 ┌────────────────────────────────────▼─────────────────────────────────────┐
 │                                BACKEND                                   │
 │   Node.js  │  Express  │  TypeScript  │  Socket.IO (Real-Time)          │
 │   JWT / Bcrypt Auth   │  Nodemailer (SMTP)   │  Multer File Storage     │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Mongoose ORM
 ┌────────────────────────────────────▼─────────────────────────────────────┐
 │                               DATABASE                                   │
 │   MongoDB Atlas (Cloud Cluster / Local Replica)                          │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. How Clients & Friends Can Use / Test the Platform

### Running Locally:
1. **Clone & Install**:
   ```bash
   npm run install:all
   ```
2. **Seed Database with Demo Data**:
   ```bash
   cd server && npm run seed
   ```
3. **Start Development Servers**:
   ```bash
   # Terminal 1 (Backend on http://localhost:5000)
   cd server && npm run dev

   # Terminal 2 (Frontend on http://localhost:5173)
   cd client && npm run dev
   ```
4. **Log In**: Open `http://localhost:5173` and log in as `alex@workforge.com` with `Password123`.

---

## 7. Summary for Showcase & Pitch

WorkForge is designed to give teams complete control over their project lifecycle—from initial feature definition to real-time execution and team velocity analytics—delivering a modern, high-performance experience.
