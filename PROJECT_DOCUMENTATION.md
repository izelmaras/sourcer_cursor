# Project Documentation: Sourcer Application

## Table of Contents
1. [Project Overview](#project-overview)
2. [Root Configuration Files](#root-configuration-files)
3. [Source Code Structure](#source-code-structure)
4. [Database & Backend](#database--backend)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Utilities & Libraries](#utilities--libraries)

---

## Project Overview

**Sourcer** is a React-based content management and curation application built with TypeScript, Vite, and Supabase. It allows users to collect, organize, and manage various types of content (images, videos, links, notes, etc.) with tags, categories, and creators.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL database + Storage)
- **State Management:** Zustand
- **Styling:** TailwindCSS with custom glassmorphism design
- **UI Components:** Custom components + Radix UI primitives
- **Deployment:** Vercel

---

## Root Configuration Files

### **index.html**
- Main HTML entry point for the application
- Loads Google Fonts (Plus Jakarta Sans, Montserrat)
- Mounts React app to `#app` div
- Includes TailwindCSS stylesheet

### **package.json**
- Node.js project configuration and dependencies
- **Scripts:**
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run lint` - Run ESLint
  - `npm run preview` - Preview production build
- **Key Dependencies:**
  - React ecosystem (react, react-dom, react-router-dom)
  - Supabase client
  - TailwindCSS + utilities
  - DnD Kit (drag and drop)
  - Rich text editing (TipTap)
  - Video handling (fluent-ffmpeg)
  - Image lazy loading and masonry layout

### **vite.config.ts**
- Vite bundler configuration
- Configures React plugin
- TailwindCSS PostCSS integration
- Build output settings

### **tailwind.config.js**
- TailwindCSS configuration
- Custom color palette (glassmorphism design)
- Custom font families and typography
- Border radius extensions
- Animation keyframes
- Typography plugin configuration

### **tailwind.css**
- Global CSS styles
- TailwindCSS directives
- Custom utility classes for glassmorphism effects
- Scrollbar customizations
- Masonry layout styles
- Smooth scrolling behavior

### **tsconfig.json** & **tsconfig.app.json** & **tsconfig.node.json**
- TypeScript compiler configurations
- Strict mode enabled
- React JSX transformation
- ES2020 target
- Module resolution and bundler settings

### **.eslintrc.json**
- ESLint configuration for code quality
- React and TypeScript rules
- Warns on console.log usage
- Enforces unused variable detection

### **vercel.json**
- Vercel deployment configuration
- Rewrites all routes to index.html (SPA routing)
- Cache-control headers for assets

### **.env** (not in repo, gitignored)
- Environment variables for Supabase connection
- Required variables:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### **video-thumbnail-server.js**
- Express server for generating video thumbnails
- Uses ffmpeg to extract frames from videos
- Runs on port 4000
- **Not actively used in current implementation**

### **tag_grouping_service.py**
- Python service (currently empty)
- Likely intended for AI-powered tag categorization
- **Not actively used**

---

## Source Code Structure

### **src/index.tsx**
- Application entry point
- Sets up React root with StrictMode
- Configures React Router with authentication
- Routes:
  - `/password` - Password protection page
  - `/*` - Main application (protected)

---

## Screens (Main Application Views)

### **src/screens/Home/Home.tsx**
**Purpose:** Main application screen that displays the content gallery

**Features:**
- Initializes all data (atoms, tags, categories, creators)
- Manages search term, content type filters, and selected creator
- Displays active filters as chips
- Opens Add and Organize modals
- Shows loading skeleton during initial data fetch

**Key Components Used:**
- `AddAndNavigationByAnima` - Top navigation bar
- `GallerySection` - Content gallery grid
- `Add` - Add new content modal
- `Organize` - Organize tags/categories/creators modal

---

### **src/screens/Home/sections/AddAndNavigationByAnima/AddAndNavigationByAnima.tsx**
**Purpose:** Top navigation bar with search and filters

**Features:**
- Search bar for content
- Filter dropdown for content types
- Organize button (opens organize modal)
- Add button (opens add modal)
- Category carousel (horizontal scrollable category buttons)
- Tag row (appears when category is selected)
- Displays item counts for categories and tags

**Key State:**
- Search term
- Selected content types
- Filter dropdown open/closed
- Tags expanded/collapsed

---

### **src/screens/Home/sections/FrameByAnima/FrameByAnima.tsx**
**Purpose:** Main content gallery grid with masonry layout

**Features:**
- Filters atoms based on search, content types, selected creator, tags, and categories
- Implements lazy loading (loads 12 items at a time)
- Displays different UI for image vs video vs other content types
- Inline detail view expansion
- Navigation between items
- Delete functionality

**Key Components:**
- `Gallery` (memoized) - Renders masonry grid of content tiles
- `InlineDetail` - Expanded detail view
- `LazyImage` - Lazy-loaded images
- `VideoThumbnail` - Video preview thumbnails
- `LiveLinkPreview` - Link preview cards

**Performance Optimizations:**
- Memoized gallery component
- Lazy loading with intersection observer
- Rate limiting for load more (1 second minimum interval)
- Virtualization through batch loading

---

### **src/screens/Home/sections/CategoryCarouselByAnima/CategoryCarouselByAnima.tsx**
**Purpose:** Category and tag management sidebar (legacy component, not currently used)

**Features:**
- Displays categories with expandable tag lists
- Tag selection and filtering
- Uncategorized tags section
- Collapsible drawer

**Note:** This component is not actively used in the current UI. The functionality has been integrated into `AddAndNavigationByAnima.tsx`

---

### **src/screens/Add/Add.tsx**
**Purpose:** Modal for adding new content items

**Features:**
- Content type selector (image, video, link, note, recipe, etc.)
- Source link input (with type-specific fields)
- External link input
- Tag selection and creation
- Creator selection and creation
- Title and description inputs
- Special fields for recipes (steps, materials) and locations (address, coordinates)
- Rich text editor for description

**Workflow:**
1. Select content type
2. Fill in source link (if applicable)
3. Add external link (optional)
4. Add tags (search existing or create new)
5. Add creators (search existing or create new)
6. Add title and description
7. Click Save

---

### **src/screens/Detail/Detail.tsx**
**Purpose:** Full-screen detail view for a single content item

**Features:**
- Two-column layout (media on left, details on right)
- Edit mode for all fields (title, description, tags, source link, external link)
- General "Save All Changes" button when editing
- Content type switcher
- Navigation between items (arrow keys and buttons)
- Zoom functionality for images
- Download media button
- Duplicate item functionality
- Flag for review toggle
- Delete confirmation

**Key State:**
- Current atom and navigation index
- Edit states for each field
- Zoom state (scale, position, dragging)
- Upload states for media

**Keyboard Shortcuts:**
- `←` Previous item
- `→` Next item
- `Escape` Close detail view

---

### **src/screens/Organize/Organize.tsx**
**Purpose:** Modal for managing tags, categories, and creators

**Features:**
- Tab navigation (Categories, Tags, Tags by Categories, Creators)
- Search and filter items
- Add new items
- Edit existing items (rename, add links for creators)
- Delete items with confirmation
- Merge items (combine duplicates)
- Assign tags to categories or creators
- Toggle private/public status
- Right-click context menu for tag assignment

**Workflow Examples:**
- **Merge tags:** Click merge icon → Search target tag → Confirm merge
- **Assign tag to category:** Right-click tag → Select category
- **Edit creator:** Click edit → Update name/links → Save

---

### **src/screens/PasswordProtect/PasswordProtect.tsx**
**Purpose:** Password protection screen for the application

**Features:**
- 4-digit PIN entry (default: "1234")
- Auto-focus and auto-advance between digits
- Stores authentication in localStorage
- Provides AuthContext for protected routes

**Components:**
- `AuthProvider` - Context provider for authentication state
- `PasswordProtect` - PIN entry UI

---

### **src/screens/ProtectedRoute.tsx**
**Purpose:** Route wrapper for authentication

**Functionality:**
- Checks if user is authenticated
- Redirects to `/password` if not authenticated
- Allows access to protected routes if authenticated

---

## Component Architecture

### **UI Components (`src/components/ui/`)**

#### **Layout & Structure**

**badge.tsx**
- Generic badge component with variants (default, secondary, destructive, outline)
- Uses class-variance-authority for variant management

**card.tsx**
- Glassmorphism gallery tile components
- `GalleryTile` - Main tile container with hover effects
- `GalleryTileHeader`, `GalleryTileTitle`, `GalleryTileDescription`, `GalleryTileContent` - Sub-components

**modal.tsx**
- Main modal component using Radix Dialog
- Dark background with backdrop blur
- Customizable content area
- Auto-close on overlay click

**modal-wrapper.tsx**
- Glassmorphism wrapper for modal content
- Consistent styling across modals

**modal/** (directory)
- `index.tsx` - Simple modal wrapper
- `modal-header.tsx` - Modal header component
- `modal-body.tsx` - Modal body with scrolling
- `modal-content.tsx` - Full modal content wrapper
- `modal-container.tsx` - Container with size variants

**dialog.tsx**
- Radix UI Dialog primitive wrappers
- Overlay, content, header, footer, title, description components

**delete-confirmation-modal.tsx**
- Reusable delete confirmation dialog
- Customizable title and description
- Cancel and Delete actions

---

#### **Input Components**

**input.tsx**
- Text input with multiple variants
- Colors: light, dark, glass (glassmorphism)
- Sizes: sm, lg
- Focus states and transitions

**search-bar.tsx**
- Search input with icon
- Glassmorphism styling
- Light/dark variants

**search.tsx**
- Alternative search component
- Dark theme with search icon

**base-search.tsx**
- Base search component with icon
- Customizable container and icon styling

**rich-text-editor.tsx**
- TipTap-based WYSIWYG editor
- Starter kit extensions
- Placeholder support
- Glassmorphism styling

**dropdown.tsx**
- Generic dropdown container
- Light/dark color variants
- Shadow and border styling

**switch.tsx**
- Radix UI Switch wrapper
- Toggle component for boolean values

---

#### **Button Components**

**button.tsx**
- Primary button component with glassmorphism
- Sizes: sm, md, lg
- Selected state support
- Left and right icon support
- Hover and active animations

**button-dark.tsx**
- Dark-themed button variant
- Variants: default, outline, ghost
- Sizes: sm, default, lg

**icon-button.tsx**
- Icon-only button
- Glassmorphism styling
- Sizes: sm, md, lg
- Hover scale effect

---

#### **Content Display Components**

**content-badge.tsx**
- Badge for displaying content type
- Light background with dark text

**content-tile.tsx**
- Gallery tile button component
- Two-part layout (metadata + title)

**content-fields.tsx**
- Dynamic fields based on content type
- Source link input
- Recipe-specific fields (steps, materials with add/remove)
- Location-specific fields (address, coordinates)

**html-content.tsx**
- Renders sanitized HTML content using DOMPurify
- Prevents XSS attacks
- Prose styling for rich text

**lazy-image.tsx**
- Intersection Observer-based lazy loading
- Fade-in animation on load
- Placeholder during loading

**video-player.tsx**
- Universal video player component
- YouTube embed support
- Direct video file support (.mp4, .webm, etc.)
- CORS error handling
- Timeout fallback (opens in new tab)
- Loading states and error messages

**video-thumbnail.tsx**
- Video thumbnail generator
- Auto-plays muted video for preview
- Fallback icon for errors

**LiveLinkPreview.tsx**
- OpenGraph preview for external links
- Fetches metadata from `/api/og-preview`
- Falls back to children if preview fails
- Disabled in development mode

**IframeWithFallback.tsx**
- Iframe wrapper with timeout and error handling
- 8-second grace period before fallback
- Falls back to link if iframe fails

---

#### **Specialized Components**

**creator-info.tsx**
- Displays creator name with user icon
- Compact inline display

**creator-upload.tsx**
- Dropzone for uploading creator images
- Uploads to Supabase Storage (`creators` bucket)
- Updates creator record with image URL
- Preview support

**dropzone.tsx**
- React Dropzone wrapper
- Drag and drop file uploads
- Accepts images only
- Shows upload progress and preview

**tag-list.tsx**
- Displays list of tags as buttons
- Shows selected state
- Click to toggle tag selection
- Close icon for removal

**inline-detail.tsx**
- Inline detail view component (used in gallery)
- Compact version of detail view
- Edit mode for all fields
- Navigation buttons
- Image zoom support
- Video playback
- Delete confirmation

---

#### **Image Components**

**image-view/** (directory)
- `image-container.tsx` - Container with zoom cursor
- `zoomable-image.tsx` - Image with zoom and pan support

---

#### **Utility Components**

**scroll-area.tsx**
- Radix UI ScrollArea wrapper
- Custom scrollbar styling

**separator.tsx**
- Radix UI Separator wrapper
- Horizontal/vertical dividers

**typography.tsx**
- Typography component with design tokens
- Variants: h1, h2, h3, body, small, caption
- Color variants: primary, secondary, muted

**plus-menu.tsx**
- Dropdown menu with plus icon
- List of selectable items
- Click outside to close

---

## State Management

### **src/store/atoms.ts**
**Purpose:** Zustand store for global state management

**State:**
- `atoms` - All content items
- `tags` - All tags
- `categories` - All categories
- `creators` - All creators
- `categoryTags` - Tag-to-category relationships
- `creatorTags` - Tag-to-creator relationships
- `selectedTags` - Currently selected tags for filtering
- `selectedCreator` - Currently selected creator for filtering
- `defaultCategoryId` - Default category to show
- `deletingIds` - IDs of items being deleted (for optimistic UI)
- `isTagDrawerCollapsed` - Tag drawer state
- `categoryTagLookup` - Performance optimization map
- `creatorTagLookup` - Performance optimization map

**Key Functions:**
- **CRUD Operations:**
  - `fetchAtoms`, `addAtom`, `updateAtom`, `deleteAtom`
  - `fetchTags`, `addTag`, `updateTag`, `deleteTag`, `mergeTag`
  - `fetchCategories`, `addCategory`, `updateCategory`, `deleteCategory`, `mergeCategory`
  - `fetchCreators`, `addCreator`, `updateCreator`, `deleteCreator`, `mergeCreator`
  
- **Relationships:**
  - `assignTagToCategory`, `removeTagFromCategory`
  - `assignTagToCreator`, `removeTagFromCreator`
  - `getCategoryTags`, `getCreatorTags`
  
- **Filtering:**
  - `toggleTag`, `clearSelectedTags`
  - `setSelectedCreator`
  - `setDefaultCategory`, `fetchDefaultCategory`

**Special Features:**
- Tag normalization (lowercase, trim, remove extra spaces)
- Multi-creator support (comma-separated creators)
- Performance optimization with lookup maps

---

## Utilities & Libraries

### **src/lib/supabase.ts**
**Purpose:** Supabase client configuration and initialization

**Features:**
- Creates Supabase client with environment variables
- Connection testing with retries (exponential backoff)
- Initial data loading (atoms, tags, categories, creators)
- Error handling and logging
- Connection failure UI display

---

### **src/lib/storage.ts**
**Purpose:** Media upload functionality

**Features:**
- Upload images and videos to Supabase Storage (`atoms` bucket)
- File validation (type and size)
- Max file size: 100MB
- Allowed types: images (jpeg, png, gif, webp, svg) and videos (mp4, mov, webm, ogg, mkv)
- Generates unique filenames with UUIDs
- Returns public URL for uploaded files

---

### **src/lib/upload.ts**
**Purpose:** Creator image upload functionality

**Features:**
- Upload creator profile images to Supabase Storage (`creators` bucket)
- Filename format: `{creatorId}-{timestamp}.{ext}`
- Returns public URL or null on error
- Delete creator images from storage

---

### **src/lib/utils.ts**
**Purpose:** Utility functions

**Functions:**
- `cn()` - Merge and deduplicate Tailwind classes
- `getYouTubeVideoId()` - Extract YouTube video ID from URL
- `getYouTubeEmbedUrl()` - Convert YouTube URL to embed URL
- `isVideoUrl()` - Detect if URL is a video (YouTube or file extension)
- `isLikelyCorsRestricted()` - Detect problematic domains (S3, CloudFront, etc.)
- `getVideoFormat()` - Extract video format from URL
- `validateVideoUrl()` - Check if video URL is accessible (async)

---

### **src/lib/design-tokens.ts**
**Purpose:** Centralized design system tokens

**Tokens:**
- **Typography:** Scale (h1-h3, body, small, caption) and colors (primary, secondary, muted)
- **Colors:** Background variants, borders, hovers, button styles, tag styles
- **Spacing:** Container, stack, cluster, wrap, inset, squish, position
- **Layout:** Modal variants and sizes, input base styles

**Usage:** Import tokens instead of hardcoding values for consistency

---

### **src/lib/performance-monitor.ts**
**Purpose:** Performance monitoring utility

**Features:**
- Singleton instance
- Start/stop timers for operations
- Track metrics (avg, min, max, count)
- Warn on slow operations (>100ms)
- Enabled in development mode only

**Usage:**
```typescript
const stopTimer = performanceMonitor.startTimer('Operation Name');
// ... do operation ...
stopTimer();
```

---

### **src/lib/mock-api.ts**
**Purpose:** Mock API for development

**Features:**
- Mock OpenGraph preview data
- Simulates network delay (100ms)
- Returns mock title and description

**Note:** Currently not actively used

---

## Database & Backend

### **src/types/supabase.ts**
**Purpose:** TypeScript types generated from Supabase schema

**Tables:**
- `atoms` - Main content items
- `tags` - Tags for organizing content
- `categories` - Categories for grouping tags
- `creators` - Content creators
- `category_tags` - Many-to-many relationship between categories and tags
- `category_creators` - Many-to-many relationship between categories and creators
- `creator_tags` - Many-to-many relationship between creators and tags

**Key Fields (atoms table):**
- `id`, `title`, `description`, `content_type`
- `link` (external webpage), `media_source_link` (direct media URL)
- `creator_name` (legacy field, use `atom_creators` table instead)
- `tags` (array of tag names)
- `thumbnail_path`, `image_path`
- `metadata` (JSON for type-specific data like recipe steps)
- `location_address`, `location_latitude`, `location_longitude`
- `flag_for_deletion` (boolean flag for review)
- `prompt` (AI generation prompt for images/videos)
- `created_at`, `updated_at`

---

### **supabase/migrations/**
**Purpose:** Database schema migrations

**Key Migrations:**
- `20240607180000_add_atom_creators.sql` - Many-to-many table for atom-creator relationships
- `20250115000000_add_software_design_category.sql` - Adds Software Design category with 100+ UI/UX tags
- `20250115000001_add_prompt_field.sql` - Adds prompt field for AI-generated content
- `20250427143131_late_palace.sql` - Enables Row Level Security (RLS)
- `20250427144418_divine_manor.sql` - Creates category_tags and category_creators tables
- `20250427155201_heavy_glade.sql` - Adds location fields
- `20250430030146_green_poetry.sql` - Creates storage bucket for atoms
- `20250508220829_muddy_silence.sql` - Adds private item support
- `20250520172339_fragrant_dew.sql` - Adds flag_for_deletion field
- `20250520174851_copper_crystal.sql` - Creates settings table
- `20250523013818_rapid_reef.sql` - Storage policies for atoms bucket
- `20250524000000_creator_uploads.sql` - Storage bucket for creators
- `20250524000001_add_creator_image.sql` - Adds image_url to creators
- `20250713214941_reset_categories_and_assign_tags.sql` - Resets categories and assigns tags to new structure

---

### **api/og-preview.ts**
**Purpose:** Vercel serverless function for OpenGraph scraping

**Features:**
- Fetches OpenGraph metadata from URLs
- Uses `open-graph-scraper` package
- Returns title, description, image
- POST endpoint
- Handles errors gracefully

**Endpoint:** `/api/og-preview`

---

## Data Flow

### **Adding Content:**
1. User clicks Add button → Opens `Add.tsx` modal
2. User selects content type and fills fields
3. Clicks Save → `addAtom()` in store
4. Store normalizes tags and inserts to Supabase
5. Creates missing tags and creators
6. Refreshes atoms list
7. Modal closes

### **Editing Content:**
1. User clicks on item → Opens `Detail.tsx`
2. User clicks pencil icon next to field → Enables edit mode
3. User makes changes to one or more fields
4. Clicks "Save All Changes" → `updateAtom()` in store
5. Store updates Supabase with all changes
6. Edit states close
7. UI reflects new data

### **Filtering Content:**
1. User selects tags/categories/creator/content type
2. Store updates `selectedTags`, `selectedCreator`, `defaultCategoryId`
3. `GallerySection` filters atoms using useMemo
4. Gallery re-renders with filtered results

### **Tag Management:**
1. User opens Organize modal
2. Views tags by category or all tags
3. Can assign tags to categories (right-click)
4. Can merge duplicate tags
5. Changes sync to Supabase via store

---

## Key Features & Design Patterns

### **Glassmorphism Design System**
- Frosted glass effect with `backdrop-blur`
- Semi-transparent backgrounds (`bg-white/5`, `bg-white/10`)
- Border overlays (`border-white/10`, `border-white/20`)
- Consistent across all components

### **Performance Optimizations**
- `useMemo` for expensive filters and computations
- `useCallback` for event handlers
- Lazy loading with intersection observer
- Lookup maps for O(1) category/creator tag access
- Rate limiting for scroll-triggered loads
- Memoized gallery component

### **Tag Normalization**
- All tags converted to lowercase
- Trimmed whitespace
- Multiple spaces replaced with single space
- Consistent across all operations

### **Multi-Creator Support**
- Creators stored as comma-separated string in atoms table (legacy)
- Also uses `atom_creators` junction table for many-to-many relationships
- UI supports adding multiple creators to a single item

### **Accessibility**
- Keyboard navigation (arrow keys, escape)
- ARIA labels and roles
- Focus states
- Screen reader support

---

## Environment Setup

### **Required Environment Variables:**
Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Development:**
```bash
npm install
npm run dev
```

### **Production Build:**
```bash
npm run build
npm run preview
```

### **Deployment:**
- Deployed to Vercel
- Environment variables configured in Vercel dashboard
- Automatic deployments on git push

---

## File Count Summary

**Total Files:**
- **React Components:** ~40 files
- **Screens:** 6 main screens
- **Database Migrations:** 28 files
- **Configuration Files:** 10+ files
- **Utility Libraries:** 7 files

**Lines of Code (approx):**
- **Components:** ~5,000 lines
- **Store:** ~850 lines
- **Screens:** ~3,000 lines
- **Total TypeScript/React:** ~9,000 lines

---

## Common Tasks

### **Add a New Content Type:**
1. Add to `contentTypes` array in `Add.tsx`, `Detail.tsx`, and `AddAndNavigationByAnima.tsx`
2. Add icon from `lucide-react`
3. Optionally add type-specific fields in `ContentFields.tsx`

### **Add a New Database Field:**
1. Create migration in `supabase/migrations/`
2. Update `src/types/supabase.ts` with new field
3. Update `addAtom` and `updateAtom` in store
4. Add UI for field in `Add.tsx` and `Detail.tsx`

### **Add a New Category:**
1. Use Organize modal → Categories tab → Add button
2. Or create SQL migration with category and tag assignments

### **Debug Database Issues:**
1. Check browser console for Supabase errors
2. Verify `.env` file has correct credentials
3. Check Supabase dashboard for RLS policies
4. Use `testConnection()` function in `lib/supabase.ts`

---

## Architecture Decisions

### **Why Zustand instead of Redux?**
- Simpler API, less boilerplate
- Better TypeScript support
- Smaller bundle size
- Easier to use with React hooks

### **Why Supabase?**
- PostgreSQL-based (powerful relational queries)
- Real-time subscriptions (future feature)
- Built-in storage for media files
- Row Level Security for access control
- Free tier for development

### **Why Masonry Layout?**
- Better visual flow for mixed content sizes
- Optimal use of screen space
- Modern gallery aesthetic

### **Why Individual Edit States?**
- Better UX - only show fields being edited
- Prevents accidental changes to other fields
- Clear visual indication of what's being modified

---

## Future Enhancements (Suggestions)

1. **Real-time Collaboration:** Use Supabase real-time subscriptions
2. **Bulk Operations:** Select multiple items and bulk edit/delete
3. **Advanced Search:** Full-text search with highlighting
4. **AI Features:** Auto-tagging, content summarization
5. **Export/Import:** Export library to JSON/CSV
6. **Sharing:** Public links for specific items or collections
7. **Mobile App:** React Native version
8. **Offline Support:** Service worker and IndexedDB caching

---

## Troubleshooting

### **Application won't start:**
- Check `.env` file exists with correct credentials
- Run `npm install` to ensure dependencies are installed
- Check console for Supabase connection errors

### **Images/videos not displaying:**
- Check media_source_link is valid URL
- Verify Supabase Storage bucket permissions
- Check CORS settings for external media

### **Tags not saving:**
- Check browser console for errors
- Verify tag normalization is working
- Check Supabase RLS policies for tags table

### **Performance issues:**
- Enable performance monitor in `lib/performance-monitor.ts`
- Check for slow database queries
- Optimize filters with additional indexes

---

## Contributing Guidelines

1. **Code Style:** Follow existing patterns and ESLint rules
2. **Components:** Create reusable components in `src/components/ui/`
3. **State:** Use Zustand store for global state, local state for UI-only state
4. **Types:** Always use TypeScript types from `src/types/supabase.ts`
5. **Performance:** Use `useMemo` and `useCallback` for expensive operations
6. **Design:** Follow glassmorphism design tokens from `lib/design-tokens.ts`
7. **Testing:** Test all CRUD operations before committing
8. **Migrations:** Never modify existing migrations, create new ones

---

*Last Updated: October 15, 2025*


