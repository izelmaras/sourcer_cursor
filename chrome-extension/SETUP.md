# Chrome Extension Setup Guide

## Default Configuration

The extension is configured to use the production URL by default: `https://sources.izel.website`

## Local Development Setup

If you want to test with local development, you have two options:

### Option 1: Use Vercel CLI

1. Install Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Run the Vercel dev server:
   ```bash
   vercel dev
   ```
   
   This will start the server on `http://localhost:3000` with API routes enabled.

3. Update the extension's API URL to `http://localhost:3000` (see "Changing the API URL" below)

### Option 2: Use Production URL (Default)

The extension uses `https://sources.izel.website` by default, which works out of the box.

## Troubleshooting

### 404 Error on API Routes

If you get a 404 error, it means:
- You're using `npm run dev` (Vite) which doesn't support API routes
- You need to use `vercel dev` instead
- Or use your production Vercel URL

### Changing the API URL

The extension stores the API URL in Chrome's local storage. To change it:

1. Open Chrome DevTools in the extension popup
2. Go to Application > Local Storage
3. Set `apiUrl` to your desired URL

Or modify the default in `popup.js`:
```javascript
let apiUrl = 'http://localhost:3000'; // Change this
```

