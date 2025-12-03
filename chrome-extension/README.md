# Sourcer Chrome Extension

A Chrome extension that allows you to right-click on any image and save it to Sourcer with the website source.

## Features

- Right-click on any image to save it to Sourcer
- Automatically captures the image URL and source website
- Matches the Sourcer website design (glassmorphism, Source Code Pro font)
- Allows adding title, description, tags, and creators
- Configurable API URL

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension is now installed!

## Usage

1. Navigate to any webpage with images
2. Right-click on an image
3. Select "Save image to Sourcer" from the context menu
4. The popup will open with the image and source information
5. Fill in the details (title, description, tags, creators)
6. Enter your API URL (defaults to `http://localhost:5173`)
7. Click "Save to Sourcer"

## API Endpoint

The extension expects an API endpoint at `/api/add-atom` that accepts POST requests with the following format:

```json
{
  "title": "Image title",
  "description": "Image description",
  "media_source_link": "https://example.com/image.jpg",
  "link": "https://example.com",
  "content_type": "image",
  "tags": ["tag1", "tag2"],
  "creator_name": "creator1, creator2",
  "store_in_database": true
}
```

## Development

To modify the extension:

1. Edit the files in `chrome-extension/`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker for context menu and message handling
- `content.js` - Content script that runs on web pages
- `popup.html` - Popup UI structure
- `popup.css` - Popup styling (matches Sourcer design)
- `popup.js` - Popup functionality

## Icons

You'll need to create icon files:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

These can be simple placeholder images for now.

