# 🚀 Deployment Guide

Complete guide for deploying RockMa Creator AI to production.

---

## 📋 Prerequisites

- GitHub account with repository pushed
- [Render](https://render.com/) account (for backend)
- [Vercel](https://vercel.com/) account (for frontend)
- OpenAI API key

---

## 🔧 Backend Deployment (Render)

### Step 1: Push to GitHub
Ensure all changes are committed and pushed to your GitHub repository.

### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure the service

### Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key from platform.openai.com |
| `ACCESS_CODE` | `ROCKMA-LOVE-2025` | Your chosen access code (change as needed) |
| `DEBUG` | `False` | Production debug mode (must be False) |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Copy your backend URL (e.g., `https://rockma-creator-ai-backend.onrender.com`)

### Step 5: Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "healthy",
  "service": "RockMa Creator AI API"
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository

### Step 2: Configure Project Settings

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### Step 3: Add Environment Variable

Add this environment variable in Vercel:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend-url.onrender.com` |

**Important:** Use your actual Render backend URL from Step 4 above.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~1-2 minutes)
3. Copy your Vercel URL (e.g., `https://rockma-creator-ai.vercel.app`)

### Step 5: Update Backend CORS

**Important:** You must update the backend CORS configuration with your actual Vercel URL.

1. Open `backend/app.py`
2. Update line 10 to replace `https://rockma-creator-ai.vercel.app` with your actual Vercel URL
3. Commit and push changes
4. Render will automatically redeploy

---

## ✅ Post-Deployment Checklist

After both services are deployed:

- [ ] Visit your Vercel URL
- [ ] Enter access code (`ROCKMA-LOVE-2025` or your custom code)
- [ ] Test **Daily Inspiration** - generate content ideas
- [ ] Test **Adapt Competitor** - rewrite competitor content
- [ ] Test **Platform Translator** - translate content between platforms
- [ ] Test **Quick Actions**:
  - [ ] Pin Competitor - save and load pinned clips
  - [ ] Brain Dump - save raw ideas (test voice input in Chrome/Safari)
  - [ ] Remix Favorite - star content and remix it
- [ ] Verify localStorage persistence (refresh page, check if access code is remembered)
- [ ] Test on mobile device

---

## 🔒 Security Notes

1. **Never commit `.env` files** - they are gitignored
2. **Change ACCESS_CODE** from default before production use
3. **Rotate OpenAI API key** if accidentally exposed
4. **Monitor API usage** in OpenAI dashboard to prevent credit drain

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors

**Problem:** Frontend can't connect to backend.

**Solutions:**
1. Verify `VITE_API_BASE_URL` in Vercel matches your Render URL exactly
2. Check backend CORS configuration includes your Vercel URL
3. Ensure Render service is running (check Render dashboard)

### "Invalid access code" loop

**Problem:** Access code validation failing.

**Solutions:**
1. Verify `ACCESS_CODE` is set correctly in Render
2. Check browser localStorage isn't corrupted (clear site data)
3. Try logging in with the exact code set in Render

### Backend 500 errors

**Problem:** Backend crashes or errors.

**Solutions:**
1. Check Render logs for Python errors
2. Verify `OPENAI_API_KEY` is set correctly
3. Ensure all `requirements.txt` dependencies installed
4. Check for missing environment variables

### OpenAI rate limit errors

**Problem:** "Rate limit exceeded" errors.

**Solutions:**
1. Check your OpenAI account has available credits
2. Verify API key has correct permissions
3. Check if you've exceeded usage limits
4. Wait and retry (rate limits reset over time)

---

## 📊 Monitoring

### Render
- View logs: Render Dashboard → Your Service → Logs
- Monitor uptime: Render Dashboard → Your Service → Metrics

### Vercel
- View deployments: Vercel Dashboard → Your Project → Deployments
- Check analytics: Vercel Dashboard → Your Project → Analytics

### OpenAI
- Monitor usage: [OpenAI Platform](https://platform.openai.com/usage)
- Set usage limits: Platform → Settings → Billing

---

## 🔄 Updating the App

When you make changes:

1. **Backend changes:**
   - Commit and push to GitHub
   - Render auto-deploys from `main` branch

2. **Frontend changes:**
   - Commit and push to GitHub
   - Vercel auto-deploys from `main` branch

3. **Environment variable changes:**
   - Update in Render/Vercel dashboard
   - Manual redeploy may be required

---

## 💰 Cost Estimates

### Render (Backend)
- **Free Tier:** Available (services sleep after 15min inactivity)
- **Paid Tier:** $7/month (recommended for production)

### Vercel (Frontend)
- **Hobby:** Free (perfect for this app)
- **Pro:** $20/month (if you need more)

### OpenAI API
- **Pay-as-you-go** based on usage
- Estimated: $5-20/month for moderate use
- Set spending limits in OpenAI dashboard

---

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Review Render and Vercel logs
3. Verify all environment variables are set correctly
4. Check OpenAI API key and credits

---

**Ready to deploy?** Start with the backend on Render, then deploy the frontend to Vercel! 🎉

