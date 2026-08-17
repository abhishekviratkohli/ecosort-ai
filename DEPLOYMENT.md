# 🚀 EcoSort AI — Vercel Deployment Guide

This project is configured for **turnkey single-click deployment on Vercel** with full support for:
- ⚡ **Client SPA:** React + Vite + Tailwind CSS + TensorFlow.js (built into `client/dist`)
- 🛠️ **Serverless Backend:** Express.js REST API running via Vercel Serverless Functions (`api/index.js`)

---

## 🎯 Method 1: Deploy with Vercel CLI (Fastest — 1 Minute)

Run the following command in your terminal from the project root:

```bash
cd /Users/abhishek/Desktop/waste_manage_system
npx vercel
```

### Steps during CLI prompt:
1. **Log in / Authorize:** If prompted, log into your Vercel account in the browser.
2. **Set up and deploy?** Press `y` (Yes).
3. **Which scope?** Select your personal account or team.
4. **Link to existing project?** Press `n` (No).
5. **What's your project's name?** Press `Enter` (default: `waste_manage_system` or `ecosort-ai`).
6. **In which directory is your code located?** Press `Enter` (`./`).
7. **Want to modify settings?** Press `n` (No — `vercel.json` handles everything automatically).

After ~60 seconds, Vercel will output your live URL (e.g. `https://ecosort-ai.vercel.app`)!

To deploy straight to **Production**:
```bash
npx vercel --prod
```

---

## 🐙 Method 2: Deploy via GitHub (Continuous Deployment)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete EcoSort AI platform with Vercel deployment config"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ecosort-ai.git
   git push -u origin main
   ```

2. **Import on Vercel Dashboard:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository (`ecosort-ai`).
   - Leave the **Root Directory** as `./` and all build settings default (the included `vercel.json` automatically configures `client/dist` and `/api` rewrites).
   - Click **Deploy**!

---

## ⚙️ Configuration Summary

| Config File | Role |
| :--- | :--- |
| **`vercel.json`** | Configures `buildCommand: npm run build --prefix client`, `outputDirectory: client/dist`, and routes `/api/*` to the serverless function. |
| **`api/index.js`** | Entrypoint wrapping the Express.js API into Vercel Serverless Functions. |
| **`.vercelignore`** | Prevents local cache and temporary folders from being uploaded. |
