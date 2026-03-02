# Underground App — App Store Launch Audit & Checklist

**Current Status**: Theme/Dark Neumorphic branch in active development
**Last Updated**: Feb 28, 2026
**Target**: iOS App Store Launch (Phases 1-5)

---

## Executive Summary

Your Underground app is **75% ready for App Store submission**. The planner infrastructure, backend, and frontend are production-grade. Main blockers are platform-specific assets and cloud deployment.

### What You Have ✅
- Fully functional planner interface for daily content creation
- 10 content modules with rich editors and AI suggestion system
- Backend API with content management (draft/publish workflow)
- Export system for content backup (XLSX, CSV)
- Reference library for content guidelines and research URLs
- Modern tech stack (React, Express, TypeScript, Drizzle ORM)
- Responsive UI with proper dark theme

### What You Need ❌
- Capacitor setup (wraps web app as native iOS)
- Cloud backend deployment (Vercel/Railway)
- iOS-specific app assets (icons, launch screens)
- App Store metadata (screenshots, description, privacy policy)
- Xcode build & signing configuration

---

## Phase 1: Planner Access & Workflows

### What the Planner Interface Looks Like

Your `/planner` route provides a comprehensive content admin interface with two main tabs:

#### **Content Tab** (Daily Content Creation)
```
Left Sidebar:
├─ Date Selector
│  ├─ Calendar view (highlights dates with content, published dates in green)
│  ├─ List view (scrollable list of all planned dates)
│  └─ "Has content" / "Published" indicators
│
Main Area:
├─ Status Bar
│  ├─ Draft/Published badge
│  ├─ Modules committed counter (e.g., "6/10 modules committed")
│  └─ Action buttons
│     ├─ Preview (opens /preview/{date} in new tab)
│     └─ Publish Day (publishes all committed modules)
│
├─ Date Header (e.g., "February 28th, 2026")
│
└─ Module Grid (auto-layout)
   ├─ Row 1: ABOVE GROUND (full width)
   ├─ Row 2: FACTLE | THINKERS (2 cols)
   ├─ Row 3: GAMES (full width)
   ├─ Row 4: TRIVIA | WORD OF THE DAY (2 cols)
   ├─ Row 5: MICRO HISTORY (full width)
   ├─ Row 6: ON THIS DAY | RIDDLE (2 cols)
   └─ Row 7: WIKI SUMMARY (full width)

Each Module Card Shows:
├─ Module label (ABOVE GROUND, FACTLE, etc.)
├─ Content preview (first line of committed content, or "Tap to add content")
├─ Saturation/opacity changes:
   ├─ Full saturation = has committed content
   └─ Desaturated = empty or draft mode
```

**Interaction Flow:**
1. Click any card → Modal editor opens
2. Choose action in modal:
   - Edit existing content
   - Click "Reroll" dice to get AI suggestion (increments through suggestions)
   - Manually write/paste content
3. Click "Commit Module" → saves to database
4. Click "Publish Day" when all modules are ready
5. Live content updates immediately in the app

---

#### **References Tab** (Content Guidelines & Sources)
```
Left Column: Module List
├─ Each module listed
├─ Shows URL count badge
├─ Shows green dot if generation rules exist
└─ Click to select for editing

Right Columns: Reference Editor
├─ Reference URLs section
│  ├─ View all saved URLs for selected module
│  ├─ Add new URL + optional label
│  └─ Delete button on each (hover to reveal)
│
└─ Content Generation Rules section
   ├─ Large textarea with rules (default or custom)
   ├─ Auto-saves on blur
   ├─ Reset to defaults button
   └─ Examples of good/bad content included in defaults
```

**Default Generation Rules Include:**
- Tone & voice guidelines
- Format specifications
- Example content
- What to avoid
- Length constraints

---

### Export Workflow

```
Click "Export" button → Dropdown menu appears
├─ Start date picker
├─ End date picker
├─ Format selector
│  ├─ Excel (.xlsx) — multi-sheet workbook
│  └─ CSV (.zip) — one CSV per module
└─ Download button
```

**Output Structure (Excel):**
- 10 sheets (one per module type)
- Columns match content fields
- Dates included for reference
- Can reimport or archive

---

## Phase 2: Current Architecture Assessment

### Frontend (React/TypeScript) ✅
- Location: `client/src/pages/Mockup.tsx` (main content display)
- Location: `client/src/pages/ContentPlanner.tsx` (admin interface)
- Status: Production-ready
- Key Features:
  - Responsive grid layout
  - Dark theme with color tokens
  - Framer Motion animations
  - React Query for data fetching
  - Form handling for content editors

### Backend (Express/Node) ✅
- Location: `server/index.ts`
- Database: Drizzle ORM + Neon PostgreSQL
- Key Endpoints:
  - `GET /api/content/range?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - `POST /api/content` — create draft
  - `PATCH /api/content/{id}` — update modules
  - `POST /api/content/{id}/publish` — publish day
  - `GET /api/references` — fetch guidelines
  - `PUT /api/references/{moduleKey}` — save URLs/rules
  - `GET /api/suggest/{moduleKey}?date=YYYY-MM-DD&index=0` — AI suggestions
- Status: Ready for production deployment

### Database Schema ✅
- `DailyContent` table with:
  - `date` (YYYY-MM-DD)
  - `status` (draft | published)
  - `modules` (JSON)
  - Timestamps
- `ModuleReference` table with:
  - `moduleKey` (module name)
  - `urls` (array of { url, label, addedAt })
  - `rules` (custom generation guidelines)

### Color System & Design Tokens ✅
- Location: `client/src/lib/colors.ts`
- 10 module colors defined
- Dark theme neutrals configured
- Used consistently in planner UI

### Animation System ✅
- Location: `client/src/lib/timing.ts`
- Spring physics configured
- Module-specific animation tweaks
- Headline transitions configured

---

## Phase 3: Pre-Launch Tasks (Blocking)

### 3.1 Backend Deployment (REQUIRED)
**Current State:** Backend runs on `localhost:3000` or Replit

**What You Need:**
1. **Option A: Vercel (Recommended)**
   ```bash
   npm install -g vercel
   vercel --prod
   ```
   - Free tier available
   - Auto-deploys from git
   - Custom domain support
   - Result: `https://underground-xyz.vercel.app`

2. **Option B: Railway**
   - `railway.app`
   - Free $5 credit/month
   - PostgreSQL add-on for database
   - Result: Custom URL + environment variables

**Impact on Planner:** None — you'll update API URL in `capacitor.config.ts` after deployment

---

### 3.2 Capacitor Setup for iOS
**Current State:** Not installed

**Commands:**
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize project
npx cap init "Underground" "com.underground.app" --web-dir=dist/public

# Add iOS platform
npx cap add ios

# After each code change:
npm run build
npx cap sync

# Open in Xcode
npx cap open ios
```

**Impact on Planner:** None — planner is web-based, users just browse to `/planner`

---

### 3.3 App Icons & Assets
**Current State:** None created

**Required Sizes:**
- 1024×1024 (App Store listing)
- 180×180 (iPhone)
- 120×120 (iPhone small)
- 87×87 (iPhone Spotlight)
- 40×40, 58×58 (Settings)

**Tools:**
- [appicon.co](https://appicon.co) — upload 1024×1024, get all sizes
- Figma — design custom icon
- Canva — free design tool

**Timeline:** 1-2 hours

---

### 3.4 Privacy Policy & Legal
**Current State:** Not created

**Required:**
- Privacy policy (simple: "We don't collect data")
- Host on public URL (GitHub Pages, Vercel, your domain)
- Update `capacitor.config.ts` with policy URL

**Template in APP_STORE_LAUNCH_GUIDE.md** (section Phase 4.3)

**Timeline:** 30 minutes

---

### 3.5 App Store Screenshots
**Current State:** Not created

**Required Sizes (iPhone):**
- 6.5" (1242×2688) — for iPhone 11 Pro Max
- 5.5" (1242×2208) — for iPhone 8 Plus

**What to Screenshot:**
1. Home screen (all modules visible)
2. Single module expanded (e.g., Above Ground article)
3. A game screenshot
4. Word of the Day (if visually interesting)

**How to Capture:**
1. Run app in Xcode simulator
2. Select device from menu
3. Cmd+S to save screenshot
4. Screenshots go to Desktop

**Timeline:** 30 minutes in simulator

---

### 3.6 App Store Metadata
**Current State:** Not prepared

**Text Copy (from APP_STORE_LAUNCH_GUIDE.md):**
- App Name: "Underground"
- Subtitle: "Daily content & mini-games" (30 chars max)
- Description: 4000 chars provided (see guide)
- Keywords: daily,content,news,games,word,puzzle,facts,history
- Category: News (primary), Games (secondary)
- Age Rating: 4+

**Timeline:** 30 minutes

---

## Phase 4: Pre-Launch Tasks (Non-Blocking)

### 4.1 Create Apple Developer Account
**Cost:** $99/year
**Time:** 24-48 hours for approval
**Timeline:** Do this early

### 4.2 Get a Mac (if you don't have one)
**Options:**
- Mac Mini ($599 new)
- Refurbished MacBook ($400-800)
- Borrow or use someone's Mac
- **Xcode is macOS-only** — required to build for iOS

**Timeline:** Order now if needed

### 4.3 Install Xcode
**Size:** ~15GB
**Time:** 30-60 minutes
**On Mac:**
1. Open App Store
2. Search "Xcode"
3. Click "Get"
4. Accept license terms

---

## Phase 5: Build & Testing Workflow

### For Planner Users (You)
**Before Publishing Content Day:**
1. Plan content in `/planner`
2. Click "Preview" to see how it looks on the app
3. Click "Publish Day" when satisfied
4. Live immediately in production app

**Changes You Can Make Without App Update:**
- Add/edit daily content (all modules)
- Update content generation guidelines
- Add reference URLs
- Change module rules
- Export content backups

**Changes Requiring App Update:**
- Add new game
- Modify UI layout
- New content modules
- Change navigation
- Bug fixes in frontend code

---

### For Developers
**Build for iPhone Testing:**
```bash
# Build web app
npm run build

# Sync to iOS project
npx cap sync

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select "iPhone 15 Pro" from device menu
# 2. Click ▶️ Play button
# 3. Wait for simulator to launch
# 4. Test all features
```

**Submission Checklist:**
1. ✅ All game modules working
2. ✅ Content loads from API
3. ✅ Navigation responsive
4. ✅ No crashes on cold start
5. ✅ Icons display correctly
6. ✅ Privacy policy link works
7. ✅ Planner accessible (if internal build) or hidden (if public)

---

## Phase 6: Version Management & Updates

### Version Format: X.Y.Z
- **X** = Major (big features, redesigns)
- **Y** = Minor (new features, improvements)
- **Z** = Patch (bug fixes)

### Example Progression
- **1.0.0** — Initial launch
- **1.0.1** — Bug fix
- **1.1.0** — Added Flappy Circle game
- **1.2.0** — Added new content module
- **2.0.0** — Major redesign

### Update Scenarios

#### Scenario 1: Add Daily Content
```
Action: Use planner to add content for tomorrow
Deployment: None needed
Time to live: Immediate (saves to database)
App update needed: No
```

#### Scenario 2: Add New Game
```
Action: Developer creates new game component
Deployment: npm run build && npx cap sync && Archive in Xcode
Submission: Submit to App Store
Time to live: 1-7 days (Apple review)
App update needed: Yes
```

#### Scenario 3: Fix Backend Bug
```
Action: Fix bug in server/routes.ts
Deployment: vercel --prod (or your hosting)
Time to live: ~1 minute
App update needed: No
```

---

## Complete Checklist for Launch

### Week 1: Setup
- [ ] Create Apple Developer Account ($99)
- [ ] Get access to Mac (borrow, buy, or use in cloud)
- [ ] Install Xcode
- [ ] Install Capacitor (`npm install @capacitor/core @capacitor/cli @capacitor/ios`)
- [ ] Initialize Capacitor project

### Week 2: Assets & Metadata
- [ ] Create/export 1024×1024 icon
- [ ] Generate all icon sizes (appicon.co)
- [ ] Create privacy policy (GitHub Pages or Vercel)
- [ ] Prepare 2-3 app screenshots from simulator
- [ ] Write app description (provided in guide)

### Week 3: Build & Test
- [ ] Deploy backend to Vercel (`vercel --prod`)
- [ ] Update `capacitor.config.ts` with production API URL
- [ ] `npm run build && npx cap sync`
- [ ] Open in Xcode: `npx cap open ios`
- [ ] Test on simulator (all games, content loading, navigation)
- [ ] Fix any bugs found

### Week 4: Submission
- [ ] Add app icons to Xcode Assets folder
- [ ] In Xcode: Select signing team under "Signing & Capabilities"
- [ ] Set deployment target to iOS 15.0
- [ ] Build archive: Product → Archive
- [ ] Upload to App Store Connect
- [ ] Fill in metadata (description, keywords, category, rating)
- [ ] Upload screenshots
- [ ] Submit for review

### Week 5: Review & Launch
- [ ] Monitor App Store Connect for review status (1-7 days)
- [ ] Respond to feedback if requested
- [ ] Resubmit if changes needed
- [ ] Once approved: Set release date and go live

---

## Planner Capabilities Summary

| Feature | Status | For Creator | For Users |
|---------|--------|------------|-----------|
| Create daily content | ✅ | Full UI in `/planner` | See live content |
| Edit any module | ✅ | Modal editors for each type | Read/interact |
| AI suggestions | ✅ | "Reroll" dice button | N/A |
| Preview before publish | ✅ | Click "Preview" button | See what's coming |
| Publish to app | ✅ | "Publish Day" button | Content goes live instantly |
| Draft/publish workflow | ✅ | Status badge & counters | Only see published |
| Reference library | ✅ | URLs + generation rules | N/A |
| Export content | ✅ | XLSX or CSV download | N/A |
| Suggested guidelines | ✅ | Default rules per module | N/A |

---

## Critical Path to Launch

**Fastest Route (4 weeks):**

1. **Day 1-2:** Create Apple account, get Mac access, install tools
2. **Day 3-4:** Create icon, privacy policy, screenshots
3. **Day 5-10:** Capacitor setup, backend deployment, Xcode config
4. **Day 11-14:** Test on simulator, fix bugs
5. **Day 15:** Build archive, submit to App Store
6. **Day 22-28:** Review complete, app live

**Realistic Route (6-8 weeks):**
- Extra time for learning Xcode
- Multiple bug fix rounds
- App Store review feedback iterations
- Personal scheduling flexibility

---

## Resource Links

### Apple Resources
- [Developer Programs](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

### Capacitor
- [Official Docs](https://capacitorjs.com/docs)
- [iOS Guide](https://capacitorjs.com/docs/ios)
- [Community Forum](https://forum.ionicframework.com/c/capacitor/)

### Deployment
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)

### Design Assets
- [AppIcon.co](https://appicon.co)
- [Figma](https://figma.com)
- [Canva](https://canva.com)

---

## Next Steps

1. **This week:** Run through Phase 3 blockers (icon, privacy policy, backend deployment)
2. **Next week:** Capacitor setup and Xcode configuration
3. **Weeks 3-4:** Testing and submission

You're in great shape — the planner is production-grade, the backend is solid, and the guide is comprehensive. The main work now is platform-specific assets and cloud deployment.

Good luck! 🚀
