# DIGI PACK ERP — Manufacturing & MIS System

DIGI PACK ERP is a production-grade Manufacturing ERP & MIS application designed for corrugated duplex box manufacturers. It features role-based access control (RBAC), 2D cutting visualizer with real-time wastage minimization, live sheet-level stock tracking, job card floor management, sales orders, finished goods dispatch, and billing.

---

## 🚀 Quick Deployment to Cloudflare Pages

### Option 1: Automatic Deployment via Cloudflare Pages Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of DIGI PACK ERP"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Log into Cloudflare Dashboard**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
   - Select your GitHub repository.

3. **Configure Build Settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave blank)

4. **Environment Variables (Optional)**:
   The app includes preconfigured Firebase credentials in `firebase-applet-config.json`. If you prefer to override them with your own Firebase project:
   - `VITE_FIREBASE_API_KEY`: Your Firebase Web API Key
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase Project ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase App ID
   - `VITE_FIREBASE_AUTH_DOMAIN`: `your-project.firebaseapp.com`
   - `VITE_FIREBASE_DATABASE_ID`: Your Firestore Database ID

5. **Click Save and Deploy**:
   Cloudflare Pages will build the application and deploy it to `https://<your-project>.pages.dev` in less than 60 seconds!

---

### Option 2: Deploying via Cloudflare Wrangler CLI

```bash
# 1. Install dependencies
npm install

# 2. Build the production bundle
npm run build

# 3. Deploy dist to Cloudflare Pages
npx wrangler pages deploy dist --project-name=digipack-erp
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint and check TypeScript
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Key Files for Cloudflare & GitHub

- `public/_redirects`: Directs all routes to `index.html` with a 200 HTTP code so single-page routing never throws 404 on page refresh.
- `public/_headers`: Enforces security headers (`X-Frame-Options`, `X-Content-Type-Options`) and caching for `/assets/*`.
- `vite.config.ts`: Configured with manual chunking for optimal CDN performance and fast page load times.
- `.github/workflows/deploy.yml`: Automated GitHub Action to lint, build, and deploy.
