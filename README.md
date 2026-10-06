# 🏋️ FitFuel Pro - AI-Powered Nutrition, Meals & Performance Platform

FitFuel Pro is a production-ready, full-stack metabolic tracking and culinary nutrition web application designed for athletes, fitness enthusiasts, and everyday health champions.

---

## 🌟 Key Features

1. **🍽️ Meal Planner & Kitchen Hub**:
   - **36 Verified High-Protein Recipes** across Breakfast, Lunch, Snacks, and Dinner.
   - Dedicated authentic **Indian recipes** (Moong Dal Chilla, Paneer Bhurji, Dal Tadka, Rajma Chawal, Palak Paneer, Tawa Paneer Tikka, Chicken Tikka Masala, and more).
   - **Verified YouTube Video Tutorials** from top culinary masters (Chef Ranveer Brar, Kabita's Kitchen, Hebbar's Kitchen, Kunal Kapur).
   - **Resilient Player**: embedded privacy-enhanced `youtube-nocookie.com` player, direct "Watch on YouTube ↗" launcher, dynamic fallback search, interactive ingredients checklist with strikethrough, and step-by-step cooking directions.
   - One-click "Log Meal" button syncing directly into daily nutritional totals.

2. **📊 Advanced Metabolic Dashboard**:
   - Real-time calorie budget breakdown (Remaining, Consumed, Burned).
   - Interactive macro distribution doughnut chart (Protein, Carbohydrates, Healthy Fats).
   - Dynamic Hydration Ring & 1-click water glass logger.
   - Gamified streak counter & tier-based XP rank.
   - Active Goal countdown and progress gauge.

3. **🎯 Goal Strategy & Milestones**:
   - Target weight projection timeline with milestone phases (Kickoff, Breakthrough, Final Stretch, Goal Realized).
   - Calorie deficit/surplus optimization based on desired pace (relaxed, moderate, aggressive).
   - Visual trajectory charts powered by Chart.js.

4. **📈 Metabolic Tracker & Daily Logs**:
   - Comprehensive multi-day trend analysis (Weight history, Net calories, Burned calories, Hydration).
   - Mood and wellness correlation scoring.
   - Quick Log modal for recording weight, calories, water, and daily workout reflections.

5. **🧮 Scientific Nutrition Calculator**:
   - Accurate **Mifflin-St Jeor BMR** calculation.
   - Harris-Benedict revised multipliers for **TDEE**.
   - WHO standard **BMI** classification.
   - Devine formula for **Ideal Body Weight (IBW)**.
   - One-click profile and goal synchronization.

6. **⚡ Authentication & Instant Testing**:
   - JWT-based authentication with bcrypt hashed security.
   - One-click **⚡ Demo Autofill Button** (`demo@fitfuel.com` / `password123`) on login page.
   - Automatic database seeding with in-memory MongoDB fallback (runs out of the box with zero external database setup required!).

---

## 🚀 Quick Start (Local Run)

### Method 1: Windows 1-Click
Double-click `start.bat` in the root folder, or run:
```powershell
.\start.bat
```

### Method 2: Manual Terminal
**Terminal 1 (Backend):**
```bash
cd server
npm install
npm start
```
*Backend runs on: `http://localhost:5000` (API & In-Memory MongoDB)*

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🌐 Production Deployment Guide

FitFuel is engineered with **dual deployment support**:
- **Single-Service Unified Deployment** (Backend serves compiled frontend on 1 port — simplest & cheapest!)
- **Split Deployment** (Frontend on Vercel/Netlify, Backend on Render/Railway)

### Option A: Render (Unified Full-Stack — Recommended ⚡)
1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com) and click **New + > Web Service**.
3. Select your repository.
4. Set the following fields:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `fitfuel_super_secret_jwt_key_2026`
   - `PORT`: `5000` (or leave default assigned by Render)
   *(Optional) If using MongoDB Atlas, add `MONGODB_URI` with your connection string. If omitted, the server automatically boots with high-performance MongoDB Memory Server.*
6. Click **Deploy Web Service**! Render will build the Vite frontend and host both the API and client on your Render URL.

### Option B: Vercel (Frontend) + Render (Backend)
- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL` = `https://your-backend.onrender.com/api`
- **Backend (Render)**:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node server.js`
  - Environment variable: `CLIENT_URL` = `https://your-app.vercel.app`

---

## 🔑 Default Demo Account
- **Email**: `demo@fitfuel.com`
- **Password**: `password123`
*(Pre-loaded with sample goals, workout logs, and daily macros)*

