# 🚀 FitFuel Pro — Complete Production Deployment Guide

This guide explains how to deploy **FitFuel Pro** to production for **100% FREE** with high performance, HTTPS, and automated CI/CD deployments.

---

## 🌟 Recommended Deployment Approaches

We support two battle-tested deployment architectures:

| Approach | Frontend | Backend & Database | Difficulty | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1: Unified Full-Stack (All-in-One)** | Render (Static + API) | Render Web Service + MongoDB Atlas | ⭐ Easy | **Best for most users** (Single service, Zero CORS, 1 URL) |
| **Option 2: Decoupled Cloud** | Vercel (Edge CDN) | Render Web Service + MongoDB Atlas | ⭐⭐ Moderate | Best for global low-latency CDN frontend |

---

## 🗄️ Step 1: Free Cloud Database Setup (MongoDB Atlas)

Both deployment options require a production database (since Render dynos restart and lose local memory).

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **"Build a Database"** and select the **FREE M0 Cluster** (Shared).
3. Choose your closest region (e.g. AWS Mumbai or AWS Singapore) and click **Create**.
4. **Security Setup**:
   - **Database Access**: Create a username and password (e.g., User: `fitfuel_admin`, Password: `YourStrongPassword123`).
   - **Network Access**: Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so Render/Vercel can connect.
5. Click **Connect** → **Drivers** (Node.js) and copy your Connection String:
   ```text
   mongodb+srv://fitfuel_admin:<password>@cluster0.xxxxx.mongodb.net/fitfuel?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your real password and add `/fitfuel` before `?`)*.

---

## 🚀 Option 1: Deploy to Render (All-in-One — 100% FREE)

Deploy both the React frontend and Node.js backend together in **one single Web Service**.

### 1. Push Code to GitHub
Open your terminal in the `fitfuel` root folder:
```bash
git init
git add .
git commit -m "Initial commit of FitFuel Pro production platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fitfuel.git
git push -u origin main
```

### 2. Create Service on Render
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your `fitfuel` GitHub repository.
4. Configure the settings:
   - **Name**: `fitfuel-app` (or your choice)
   - **Region**: Singapore / Frankfurt / Oregon
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables on Render
Under **Environment Variables**, add:
| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & static serving |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `any_long_random_secret_string` | Used to sign login tokens |
| `JWT_EXPIRE` | `30d` | Token expiry |

5. Click **Deploy Web Service**!

Render will automatically run `npm run build`, build the Vite frontend, install server packages, and start the app.
Your app will be live at: **`https://fitfuel-app.onrender.com`**!

---

## ⚡ Option 2: Split Deploy (Frontend on Vercel + Backend on Render)

If you prefer having the React UI served on Vercel's global CDN:

### Part A: Deploy Backend on Render
1. On [render.com](https://render.com), click **New +** → **Web Service**.
2. Select your `fitfuel` repository.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `MONGODB_URI`: *Your Atlas URI*
     - `JWT_SECRET`: *Your secret key*
     - `JWT_EXPIRE`: `30d`
     - `CLIENT_URL`: `*` (or your Vercel URL once created)
4. Deploy! Your backend URL will be: `https://fitfuel-api.onrender.com`.

### Part B: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import your `fitfuel` repository.
3. In **Project Settings**:
   - **Root Directory**: Click `Edit` and select `client`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://fitfuel-api.onrender.com`
5. Click **Deploy**!

Your frontend will be live on Vercel (e.g. `https://fitfuel.vercel.app`) and automatically routed to your Render backend API!

---

## 🔍 Pre-Flight Checklist

Before public sharing or demoing:
- [x] Client builds with 0 errors (`npm run build` verified)
- [x] Server serves static build automatically when accessed at root `/`
- [x] Dynamic CORS supports both unified origin and decoupled Vercel domains
- [x] Pre-seeded demo user: `demo@fitfuel.com` / `password123` with 1-click login
- [x] 36 verified recipe YouTube masterclasses and badge definitions auto-seed on first launch
- [x] Clinical PDF report export works in browser with zero dependencies
