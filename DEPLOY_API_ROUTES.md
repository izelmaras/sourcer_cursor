# Deploying API Routes to Vercel

## Issue
The API routes are returning 404 errors because they need to be deployed to Vercel.

## Solution

1. **Commit the changes:**
   ```bash
   git add vercel.json api/
   git commit -m "Add API routes for Chrome extension"
   git push
   ```

2. **Wait for Vercel to redeploy** (usually automatic after push)

3. **Verify the API routes are working:**
   - Test in browser: `https://sources.izel.website/api/get-tags`
   - Should return JSON, not HTML

4. **Check Vercel Dashboard:**
   - Go to your Vercel project
   - Check "Functions" tab - you should see:
     - `/api/get-tags`
     - `/api/get-creators`
     - `/api/get-ideas`
     - `/api/add-atom`
     - `/api/add-child-atom`

5. **Verify Environment Variables:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Make sure these are set:
     - `VITE_SUPABASE_URL` (or `SUPABASE_URL`)
     - `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_ANON_KEY`)

## Current vercel.json Configuration

The `vercel.json` now excludes `/api/*` routes from the catch-all rewrite, allowing Vercel to automatically handle them as serverless functions.

## Testing Locally

If you want to test locally before deploying:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server
vercel dev
```

This will start a local server at `http://localhost:3000` with API routes enabled.



