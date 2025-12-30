# 🚀 FIZI Backend Deployment Guide

## Play Store Readiness

To publish your app on Google Play Store, you need:
1. ✅ **Backend deployed to a public server** (this guide)
2. ✅ **App configured with HTTPS endpoint**
3. ✅ **Build production APK/AAB using EAS**

---

## Quick Start: Deploy to Render.com (FREE)

Render is the easiest free option. Follow these steps:

### Step 1: Update Requirements.txt

The file `python_server/requirements.txt` is in `.gitignore`. Update it manually:

```txt
flask==3.0.0
flask-cors==4.0.0
mediapipe==0.10.9
opencv-python-headless==4.8.1.78
numpy==1.24.3
gunicorn==21.2.0
```

### Step 2: Push Code to GitHub

```bash
cd "C:\Users\Mahesh\OneDrive\Desktop\New folder\FIZI-main"
git add python_server/Dockerfile python_server/.dockerignore
git commit -m "Add Docker configuration for deployment"
git push origin main
```

### Step 3: Deploy on Render

1. **Sign up**: Go to https://render.com and sign up (free tier available)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `MaheshChalla2701/FIZI`
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `fizi-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `python_server`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - You'll get a URL like: `https://fizi-backend.onrender.com`

### Step 4: Test Your Backend

Test the deployment:
```bash
curl https://YOUR-RENDER-URL.onrender.com/health
```

Should return: `{"status": "healthy"}`

### Step 5: Update Frontend API URL

Update `src/config/appConfig.ts`:

```typescript
const AppConfig = {
  api: {
    // OLD (localhost)
    // baseURL: "http://192.168.1.100:5001",
    
    // NEW (production)
    baseURL: "https://YOUR-RENDER-URL.onrender.com",
  },
  // ... rest of config
};
```

---

## Alternative: Deploy to Railway

Railway is another excellent free option:

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select**: `MaheshChalla2701/FIZI`
4. **Root Directory**: `python_server`
5. **Deploy**: Railway auto-detects Dockerfile
6. **Domain**: Get URL from Railway dashboard

---

## For Play Store Build

Once backend is deployed:

### 1. Update App Configuration

In `app.json`:
```json
{
  "expo": {
    "name": "FIZI - AI Fitness Trainer",
    "slug": "fizi",
    "version": "1.0.0",
    "android": {
      "package": "com.maheshchalla.fizi",
      "versionCode": 1,
      "permissions": ["CAMERA"]
    }
  }
}
```

### 2. Build Production APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android --profile production
```

### 3. Test on Real Device

Download the APK from EAS and test thoroughly on real Android device.

### 4. Submit to Play Store

1. Create Google Play Console account ($25 one-time fee)
2. Create new app in console
3. Upload AAB (Android App Bundle)
4. Fill in store listing details
5. Submit for review

---

## Environment Variables (Optional)

If you need environment variables on Render:

1. Go to your service dashboard
2. Click "Environment" tab
3. Add variables like:
   - `PORT=5001`
   - `FLASK_ENV=production`

---

## Monitoring & Logs

### Render Logs
- Go to your service → "Logs" tab
- Real-time logs visible

### Health Check
Your backend already has a `/health` endpoint. Render will ping it automatically.

---

## Cost Breakdown

| Provider | Free Tier | Limitations |
|----------|-----------|-------------|
| **Render** | ✅ Yes | Sleeps after 15min inactivity, slower cold starts |
| **Railway** | ✅ $5 credit/month | ~500 hours/month, then pay-as-you-go |
| **Heroku** | ❌ No longer free | - |

**Recommendation**: Start with **Render** (completely free, perfect for testing).

---

## Troubleshooting

### Issue: Backend sleeps on Render free tier
**Solution**: First request takes 30-60s to wake up. Acceptable for testing. Upgrade to paid plan ($7/mo) for always-on.

### Issue: CORS errors
**Solution**: Your backend already has `flask-cors` configured. Should work out of the box.

### Issue: MediaPipe not loading
**Solution**: Dockerfile installs all required system dependencies. Should work automatically.

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend API URL
3. ✅ Test thoroughly
4. ✅ Build production APK with EAS
5. ✅ Submit to Play Store

**Your app is production-ready!** 🎉
