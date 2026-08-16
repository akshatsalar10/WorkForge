# WorkForge SaaS Platform — 100% FREE Deployment Guide ($0 / Month)

Here are the best **100% FREE** hosting options available for WorkForge where **NO Credit Card** or payment is required.

---

## METHOD 1: RENDER FREE TIER (100% FREE — $0 / MONTH)

Render offers a **100% Free Web Service tier**. To deploy for free without requiring a paid plan:

### Step-by-Step Free Deployment on Render:

1. Push your repository to GitHub.
2. Go to **[Render Dashboard](https://dashboard.render.com/)** and click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository (`WorkForge`).
4. Fill in the settings:
   - **Name**: `workforge` (or any unique name)
   - **Region**: Oregon or Singapore (choose nearest)
   - **Branch**: `main`
   - **Root Directory**: (Leave blank)
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command**: 
     ```bash
     cd server && npm start
     ```
   - **Instance Type**: Select **FREE ($0 / month)**.

5. Scroll down to **Environment Variables** and click **Add Environment Variable**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://akshatsalar_db_user:<your-password>@cluster0.hxgvuxp.mongodb.net/workforge`
   - `JWT_SECRET`: `workforge-production-jwt-secret-key-32chars`
   - `REFRESH_TOKEN_SECRET`: `workforge-production-refresh-secret-key-32chars`
   - `SMTP_USER`: `akshatpersonal2@gmail.com`
   - `SMTP_PASS`: `rjpm hkgx hslf tjyd`
   - `CLIENT_URL`: `https://workforge.onrender.com` (replace with your Render service URL)

6. Click **Create Web Service**.
   - Render will build both the frontend and backend, host the single-page application, and assign you a free `https://workforge.onrender.com` URL!

---

## METHOD 2: KOYEB (100% FREE — NO CREDIT CARD REQUIRED)

[Koyeb](https://www.koyeb.com/) provides **2 Free Micro Instances** ($0 / month) with 512 MB RAM each.

### Step-by-Step Free Deployment on Koyeb:
1. Log into [Koyeb Dashboard](https://app.koyeb.com/).
2. Click **Create Service** $\rightarrow$ **GitHub**.
3. Select your `WorkForge` repository.
4. Set Build Command: `npm run install:all && npm run build`
5. Set Run Command: `cd server && npm start`
6. Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS`).
7. Click **Deploy**. Koyeb will deploy your full-stack SaaS application on a free `.koyeb.app` URL.

---

## METHOD 3: VERCEL (FRONTEND) + RENDER (BACKEND) — 100% FREE

If you prefer Vercel for lightning-fast frontend delivery:
- **Frontend**: Deploy `client` folder on Vercel ($0 / month).
- **Backend API**: Deploy `server` folder on Render Free Web Service ($0 / month).
- Set `VITE_API_BASE_URL` on Vercel to your Render backend URL.

---

## SUMMARY OF FREE PLATFORMS

| Provider | Cost | Credit Card Required? | Includes Free SSL? |
|---|---|---|---|
| **Render Web Service** | **$0 / Month** | **NO** | YES (`https://...onrender.com`) |
| **Koyeb Micro** | **$0 / Month** | **NO** | YES (`https://...koyeb.app`) |
| **Vercel Hobby** | **$0 / Month** | **NO** | YES (`https://...vercel.app`) |
| **MongoDB Atlas Free** | **$0 / Month** | **NO** | YES (512 MB M0 Cluster) |
