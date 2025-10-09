# Deployment Guide - Cloudflare Pages

## Prerequisites
- GitHub account
- Cloudflare account (free tier works)
- Project code pushed to GitHub repository

## Step 1: Prepare for Production Build

### 1.1 Update Firebase Config for Production

Create environment file `.env.production`:

```env
# Firebase Production Config
VITE_FIREBASE_API_KEY=AIzaSyBpJ9lIVcDPdp5IlJuqBxVBXV4P4NAW_bk
VITE_FIREBASE_AUTH_DOMAIN=fit5032-youthwell-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fit5032-youthwell-project
VITE_FIREBASE_STORAGE_BUCKET=fit5032-youthwell-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=490878725011
VITE_FIREBASE_APP_ID=1:490878725011:web:9aec1778a989059c3f1666
VITE_FIREBASE_MEASUREMENT_ID=G-X44N526509

# SendGrid
VITE_SENDGRID_API_KEY=SG.1bc6af9c-b278-4d11-a624-e75ae4773752

# MapBox (add your token)
VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN_HERE
```

### 1.2 Test Production Build Locally

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### 1.3 Push to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin master
```

## Step 2: Deploy to Cloudflare Pages

### 2.1 Create Cloudflare Account

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Sign up or log in
3. Click "Create a project"

### 2.2 Connect GitHub Repository

1. Click "Connect to Git"
2. Authorize Cloudflare to access your GitHub account
3. Select your repository: `fit5032-youthwell-project`
4. Click "Begin setup"

### 2.3 Configure Build Settings

**Set up builds and deployments:**

- **Project name:** `youthwell` (or your choice)
- **Production branch:** `master` (or `main`)
- **Framework preset:** Select "Vue"
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)

**Environment variables:**

Add the following environment variables:

| Variable Name | Value |
|--------------|-------|
| `NODE_VERSION` | `20.19.0` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBpJ9lIVcDPdp5IlJuqBxVBXV4P4NAW_bk` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `fit5032-youthwell-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `fit5032-youthwell-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `fit5032-youthwell-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `490878725011` |
| `VITE_FIREBASE_APP_ID` | `1:490878725011:web:9aec1778a989059c3f1666` |
| `VITE_MAPBOX_TOKEN` | Your MapBox token |

### 2.4 Deploy

1. Click "Save and Deploy"
2. Cloudflare will build and deploy your site
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Custom Domain

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain name (e.g., `youthwell.com`)
5. Follow DNS configuration instructions

### 3.2 Configure DNS

Add these DNS records in your domain registrar:

```
Type: CNAME
Name: www
Target: youthwell.pages.dev
Proxy: Yes
```

## Step 4: Configure Firebase for Production

### 4.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/project/fit5032-youthwell-project)
2. Navigate to Authentication > Settings > Authorized domains
3. Add your Cloudflare Pages domains:
   - `youthwell.pages.dev`
   - `www.yourdomain.com` (if using custom domain)

### 4.2 Update Firestore Security Rules

In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth == null; // Allow user creation during signup
      allow update, delete: if request.auth.uid == userId;
    }

    match /posts/{postId} {
      allow read: if true; // Public read access
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
        (resource.data.authorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## Step 5: Verify Deployment

### 5.1 Test Production Site

Visit your deployed site: `https://youthwell.pages.dev`

Test the following:
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Forum posts can be created
- [ ] Forum posts can be rated
- [ ] Map view displays
- [ ] Admin dashboard accessible (admin role)
- [ ] Data tables work (search, sort, pagination)
- [ ] CSV export works
- [ ] All navigation links work
- [ ] Mobile responsive design

### 5.2 Check Performance

Use these tools:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (in Chrome DevTools)

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Step 6: Set Up Continuous Deployment

Cloudflare Pages automatically deploys when you push to GitHub.

### Automatic Deployments

Every push to `master` branch triggers:
1. Build process
2. Automatic deployment
3. Preview deployment URL

### Preview Deployments

Pull requests create preview deployments:
- Each PR gets unique URL
- Test changes before merging
- Automatic cleanup after merge

## Step 7: Monitor and Optimize

### 7.1 Analytics

Enable Cloudflare Web Analytics:
1. In Cloudflare Pages dashboard
2. Go to "Analytics"
3. Enable Web Analytics
4. Add tracking snippet (optional for Pages)

### 7.2 Performance Optimization

Already implemented:
- ✅ Code splitting with Vite
- ✅ Lazy loading routes
- ✅ Minified CSS and JS
- ✅ Gzip compression
- ✅ CDN distribution via Cloudflare

### 7.3 Set Up Error Tracking (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/vue
```

## Troubleshooting

### Common Issues:

1. **Build fails**
   - Check build logs in Cloudflare dashboard
   - Verify `package.json` has all dependencies
   - Ensure Node version matches

2. **Firebase authentication errors**
   - Verify domain is authorized in Firebase Console
   - Check Firebase config in environment variables

3. **404 errors on page refresh**
   - Cloudflare Pages should handle this automatically
   - If not, create `_redirects` file in `public/`:
   ```
   /*    /index.html   200
   ```

4. **Environment variables not working**
   - Prefix all vars with `VITE_`
   - Rebuild after adding variables
   - Check variable names match exactly

5. **CORS errors**
   - Verify Firebase domain authorization
   - Check API endpoints allow your domain

## Alternative Deployment Options

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

## Production Checklist

Before going live:

- [ ] All Firebase services configured
- [ ] SendGrid sender email verified
- [ ] MapBox token added
- [ ] Environment variables set
- [ ] Firestore security rules updated
- [ ] Firebase authorized domains configured
- [ ] Production build tested locally
- [ ] Site deployed to Cloudflare Pages
- [ ] All features tested on production
- [ ] Performance scores meet targets
- [ ] Accessibility tested
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active (automatic with Cloudflare)
- [ ] Error tracking configured (optional)
- [ ] Analytics enabled
- [ ] Custom domain configured (optional)

## Maintenance

### Update Deployment

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin master

# Cloudflare automatically deploys
```

### Rollback to Previous Version

1. Go to Cloudflare Pages dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "Rollback to this deployment"

### View Deployment Logs

1. Cloudflare Pages dashboard
2. Click on deployment
3. View build logs

---

## Production URL

After deployment, your site will be available at:
- **Cloudflare Pages:** `https://youthwell.pages.dev`
- **Custom domain:** `https://www.yourdomain.com` (if configured)

---

**Congratulations! Your YouthWell application is now live! 🎉**

For support:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Production Guide](https://vitejs.dev/guide/build.html)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
