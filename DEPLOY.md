# Deployment Guide

## Quick Deploy Options

### Option 1: Render (Recommended - Free & Easy)

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `srqai/authlete-recipe-demo`
4. Configure:
   - **Name**: `authlete-recipe-demo` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)
5. Add Environment Variables:
   - `AUTHLETE_BASE_URL` = `https://us.authlete.com`
   - `AUTHLETE_SERVICE_ID` = (your service ID)
   - `AUTHLETE_SERVICE_SECRET` = (your service secret)
   - `AUTHLETE_CLIENT_ID` = (your client ID)
   - `AUTHLETE_CLIENT_SECRET` = (your client secret)
   - `AUTHLETE_AUTHLETE` = (your service access token)
6. Click "Create Web Service"
7. Wait ~2-3 minutes for deployment
8. Your app will be live at: `https://your-app-name.onrender.com`

### Option 2: Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `srqai/authlete-recipe-demo`
4. Railway auto-detects Node.js
5. Add Environment Variables (same as above)
6. Deploy automatically starts
7. Your app will be live at: `https://your-app-name.up.railway.app`

### Option 3: Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import `srqai/authlete-recipe-demo`
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. Add Environment Variables (same as above)
6. Click "Deploy"
7. Your app will be live at: `https://your-app-name.vercel.app`

### Option 4: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly launch` in project directory
3. Follow prompts to create app
4. Set secrets: `fly secrets set AUTHLETE_SERVICE_ID=xxx AUTHLETE_SERVICE_SECRET=xxx ...`
5. Deploy: `fly deploy`
6. Your app will be live at: `https://your-app-name.fly.dev`

## Environment Variables Required

Make sure to set these in your hosting platform:

- `AUTHLETE_BASE_URL` (optional, defaults to `https://us.authlete.com`)
- `AUTHLETE_SERVICE_ID`
- `AUTHLETE_SERVICE_SECRET`
- `AUTHLETE_CLIENT_ID`
- `AUTHLETE_CLIENT_SECRET`
- `AUTHLETE_AUTHLETE` (Service Access Token)

## Notes

- Free tiers may have cold starts (first request takes longer)
- Render free tier sleeps after 15 minutes of inactivity
- Railway free tier has usage limits
- Vercel free tier is generous for demos

