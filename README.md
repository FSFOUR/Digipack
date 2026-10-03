# DIGI PACK ERP — Manufacturing & MIS System

DIGI PACK ERP is a production-grade Manufacturing ERP & MIS application designed for corrugated duplex box manufacturers. It features role-based access control (RBAC), 2D cutting visualizer with real-time wastage minimization, live sheet-level stock tracking, job card floor management, sales orders, finished goods dispatch, and billing.

---

## 🚀 GitHub & Cloudflare Deployment Guide

The repository is pre-configured for seamless automated deployment to **Cloudflare Pages** and **Cloudflare Workers (with Assets)** via GitHub Actions.

### Method 1: Automated Deployment via GitHub Actions (CI/CD)

Whenever you push to `main` or `master`, the `.github/workflows/deploy.yml` pipeline will:
1. Validate TypeScript and Linting (`npm run lint`).
2. Build production assets (`npm run build`).
3. Verify client-side SPA routing (`dist/_redirects`, `dist/_headers`, and `dist/index.html`).
4. Automatically deploy to Cloudflare Pages.

#### Adding Cloudflare Credentials to GitHub:
In your GitHub repository:
1. Navigate to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token (Permissions: `Cloudflare Pages: Edit` or `Account: Cloudflare Pages: Edit`).
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (Found in your Cloudflare dashboard sidebar).
3. *(Optional)* If overriding Firebase variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_DATABASE_ID`

---

### Method 2: Direct Git Integration via Cloudflare Pages Dashboard

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete DIGI PACK ERP with Cloudflare support"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Connect in Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com).
   - Click **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select your repository.

3. **Build Configuration**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave blank)

4. **Click Save and Deploy**:
   Cloudflare will automatically compile and distribute your app globally across edge nodes in seconds.

---

### Method 3: Deploy via Wrangler CLI

You can also deploy directly from your local terminal:

```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Deploy to Cloudflare Pages
npm run deploy:pages

# OR deploy as Cloudflare Worker with Assets
npm run deploy
```

---

## 🛠️ Local Development & Scripts

```bash
# Start local dev server (port 3000)
npm run dev

# Lint & TypeScript validation
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Key Files for Cloudflare & GitHub

- `public/_redirects`: Directs all incoming URLs (`/* /index.html 200`) so deep links and page refreshes never throw 404 errors.
- `public/_headers`: Injects security headers (`X-Frame-Options`, `X-Content-Type-Options`) and caching for `/assets/*`.
- `wrangler.toml`: Configured with `[assets]` and `not_found_handling = "single-page-application"`.
- `firebase-applet-config.json`: Embedded fallback configuration ensuring the app works immediately even before Cloudflare environment variables are set.
- `.github/workflows/deploy.yml`: Production GitHub Actions workflow with linting, building, and Cloudflare Pages deployment.
