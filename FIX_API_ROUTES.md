# Fix API Routes on Vercel

## Current Issue
The API routes are returning HTML (index.html) or TypeScript source code instead of executing as serverless functions.

## Solution

The `vercel.json` has been updated to explicitly handle API routes. However, you need to:

1. **Commit and push the changes:**
   ```bash
   git add vercel.json
   git commit -m "Fix API routes configuration"
   git push
   ```

2. **Wait for Vercel to redeploy** (automatic after push, usually 1-2 minutes)

3. **Verify the API routes work:**
   - Visit: `https://sources.izel.website/api/get-tags`
   - Should return JSON: `{"tags": [...]}`
   - NOT HTML or TypeScript source

4. **Check Vercel Dashboard:**
   - Go to your Vercel project
   - Check "Functions" tab
   - You should see:
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

## If API Routes Still Don't Work

If after redeploying the API routes still return HTML or source code:

1. **Check file structure:**
   - API files should be in `/api/` folder
   - Files should be `.ts` (TypeScript)
   - Files should export a default async function handler

2. **Try manual redeploy:**
   - In Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment

3. **Check build logs:**
   - In Vercel Dashboard → Deployments → Click on deployment
   - Check "Build Logs" for any errors

4. **Verify TypeScript compilation:**
   - Vercel should automatically compile `.ts` files in `/api/`
   - If not, you may need to add a build step

## Current vercel.json Configuration

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- `/api/*` routes go to the API serverless functions
- All other routes go to `index.html` (SPA routing)

