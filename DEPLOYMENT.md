# WorkForge SaaS Platform — Security & Production Deployment Guide

## 1. URGENT SECURITY ACTION: REGENERATE SECRETS

GitHub's Secret Scanning detected that active credentials were previously committed. Take these 2 quick steps immediately:

1. **Regenerate Gmail App Password**:
   - Go to [Google Account Security $\rightarrow$ App Passwords](https://myaccount.google.com/apppasswords).
   - Delete the old App Password and create a new one named `WorkForge-Prod`.
   - Never commit `.env` files to Git.

2. **Rotate MongoDB Database Password**:
   - Log into your MongoDB Atlas Dashboard $\rightarrow$ **Database Access**.
   - Edit user `akshatsalar_db_user` and update the password.

---

## 2. PRODUCTION BUILD PREPARATION

WorkForge is configured as a production-ready monorepo.

### Root Commands:
- **Install All Monorepo Dependencies**:
  ```bash
  npm run install:all
  ```
- **Build Client & Server Production Bundles**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm run start
  ```

---

## 3. DEPLOYMENT ON RENDER (RECOMMENDED - 1-CLICK SPA + API)

Render allows hosting both the Node.js Express server and React single-page frontend from a single web service instance using the included `render.yaml` configuration.

### Steps to Deploy on Render:
1. Push your latest code to your GitHub Repository.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Blueprint**.
3. Select your WorkForge repository.
4. Render will detect `render.yaml` automatically.
5. In Environment Variables, fill in your production values:
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/workforge`
   - `JWT_SECRET`: Random 32-character string
   - `REFRESH_TOKEN_SECRET`: Random 32-character string
   - `SMTP_USER`: Your Gmail address
   - `SMTP_PASS`: Your newly generated 16-character Gmail App Password
   - `CLIENT_URL`: `https://your-app-name.onrender.com`
6. Click **Apply**. Render will run `npm run install:all && npm run build` and launch your SaaS application!

---

## 4. DEPLOYMENT ON RAILWAY / HEROKU / VERCEL

### Environment Variables Checklist for Any Cloud Provider:

| Variable | Description | Example Value |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web server port | `5000` or `10000` |
| `MONGODB_URI` | Production MongoDB Atlas URI | `mongodb+srv://user:pass@cluster.mongodb.net/workforge` |
| `JWT_SECRET` | Secret key for JWT access tokens | `prod-jwt-secret-key-32-chars` |
| `REFRESH_TOKEN_SECRET` | Secret key for Refresh tokens | `prod-refresh-token-secret-32-chars` |
| `CLIENT_URL` | Frontend URL | `https://your-app.com` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Gmail username | `your-email@gmail.com` |
| `SMTP_PASS` | Gmail 16-char App Password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Sender display name | `"WorkForge Team" <your-email@gmail.com>` |

---

## 5. SEEDING PRODUCTION DATABASE (OPTIONAL)

To populate your production MongoDB Atlas cluster with demo users and projects:

```bash
# Set MONGODB_URI to your production Atlas cluster
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/workforge"

# Run seed script
cd server
npm run seed
```
