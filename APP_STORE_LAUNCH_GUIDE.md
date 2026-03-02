# Underground App - App Store Launch Guide
**Complete guide for when you're ready to launch**

---

## What You'll Need

### Required Accounts
- **Apple Developer Account**: $99/year - https://developer.apple.com/programs/
- **Mac computer**: MacBook, iMac, or Mac Mini (required for iOS development)
- **Cloud hosting account**: Vercel (free tier) or Railway ($5+/month)

### Optional (Not Needed Initially)
- ❌ iPad support - We'll keep it iPhone-only for simplicity
- ❌ Google Play Console - Can add Android later
- ❌ Physical iPhone - Can test on simulator first

---

## Phase 1: Prerequisites (Before You Start)

### 1. Get a Mac Computer
**Why you need it**: Apple requires Xcode (Mac-only software) to build iOS apps.

**Options**:
- **New Mac Mini**: ~$599 - most affordable new Mac
- **Refurbished MacBook**: $400-800 - portable option
- **Borrow a Mac**: If you know someone with a Mac, you can use theirs

### 2. Install Xcode
**After you have a Mac**:
1. Open App Store on Mac
2. Search for "Xcode"
3. Click "Get" (free, ~15GB download)
4. Wait for installation (~30-60 minutes)
5. Open Xcode and agree to terms

### 3. Create Apple Developer Account
**Steps**:
1. Go to https://developer.apple.com/programs/enroll/
2. Sign in with Apple ID (or create one)
3. Choose "Individual" account type
4. Pay $99 annual fee
5. Wait for approval (~24-48 hours)

---

## Phase 2: Prepare the App

### Step 1: Install Capacitor (Wraps web app as native iOS app)

```bash
cd /Users/taliamalchin/Documents/Underground/Replit

# Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor
npx cap init "Underground" "com.underground.app" --web-dir=dist/public

# Add iOS platform
npx cap add ios
```

**What this does**: Creates an `ios/` folder with Xcode project that wraps your React web app.

### Step 2: Configure for iPhone Only

**Edit `capacitor.config.ts`**:
```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.underground.app',
  appName: 'Underground',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Backend API URL (update after backend deployment)
    url: 'https://your-backend-url.vercel.app',
    cleartext: true
  },
  ios: {
    // iPhone only - no iPad support
    contentInset: 'always'
  }
};

export default config;
```

**Edit `ios/App/App/Info.plist`** (add before `</dict>`):
```xml
<!-- iPhone only -->
<key>UISupportedInterfaceOrientations</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
</array>

<!-- Disable iPad -->
<key>UIRequiresFullScreen</key>
<true/>
```

### Step 3: Deploy Backend to Cloud

**Why**: iPhone app can't run Node.js server - needs cloud backend.

**Recommended: Vercel (Easiest)**

1. **Create `vercel.json` in project root**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    }
  ]
}
```

2. **Install Vercel CLI**:
```bash
npm install -g vercel
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Copy the production URL** (e.g., `https://underground-xyz.vercel.app`)

5. **Update `capacitor.config.ts`** with your production URL

### Step 4: Create App Icons

**Required sizes** (iPhone only):
- 1024x1024 (App Store)
- 180x180 (iPhone Pro)
- 120x120 (iPhone)
- 87x87 (iPhone Spotlight)
- 80x80 (iPad Settings - even if iPhone only)
- 58x58 (iPhone Settings)
- 40x40 (iPhone Spotlight)

**Tool recommendations**:
- **Figma**: Design icon, export at different sizes
- **App Icon Generator**: https://appicon.co - upload 1024x1024, get all sizes
- **Canva**: Free design tool for creating icons

**How to add icons**:
1. Open Xcode: `npx cap open ios`
2. Click on `App` in left sidebar
3. Click on `Assets` folder
4. Click on `AppIcon`
5. Drag each icon size into corresponding slot

---

## Phase 3: Build & Test

### Step 1: Build the Web App
```bash
npm run build
npx cap sync
```

**What this does**: Builds React app and copies it into iOS Xcode project.

### Step 2: Open in Xcode
```bash
npx cap open ios
```

### Step 3: Configure in Xcode

1. **Select your team**:
   - Click "Underground" project in left sidebar
   - Under "Signing & Capabilities" tab
   - Select your Apple Developer team

2. **Set deployment target**:
   - Under "General" tab
   - Set "Deployment Target" to iOS 15.0
   - Uncheck "iPad" (iPhone only)

3. **Configure bundle identifier**:
   - Should be `com.underground.app`
   - Must be unique across App Store

### Step 4: Test on Simulator

1. In Xcode, select "iPhone 15 Pro" from device menu (top left)
2. Click ▶️ Play button (or Cmd+R)
3. Wait for simulator to launch and app to install
4. Test all features:
   - ✓ Games work
   - ✓ Content loads from backend
   - ✓ Navigation works
   - ✓ No crashes

---

## Phase 4: App Store Submission

### Step 1: Create App Store Listing

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps"
3. Click ➕ to create new app
4. Fill in:
   - **Platform**: iOS
   - **Name**: Underground
   - **Primary Language**: English
   - **Bundle ID**: com.underground.app
   - **SKU**: underground-app-001 (any unique ID)

### Step 2: Prepare Screenshots

**Required sizes** (iPhone only):
- 6.7" display (iPhone 15 Pro Max): 1290 x 2796 px
- 6.5" display (iPhone 11 Pro Max): 1242 x 2688 px
- 5.5" display (iPhone 8 Plus): 1242 x 2208 px

**How to capture**:
1. Run app in Xcode simulator
2. Select each device size
3. Press Cmd+S to save screenshot
4. Screenshots auto-saved to Desktop

**What to screenshot**:
- Home screen with content modules
- Games section
- Individual game (e.g., Flappy Circle)
- Any other key features

### Step 3: Write App Description

**App Name**: Underground

**Subtitle** (max 30 chars): Daily content & mini-games

**Description** (max 4000 chars):
```
Underground brings you daily curated content and engaging mini-games in one beautiful app.

FEATURES:

📰 Daily Content
• Above Ground - Today's top news
• Word of the Day - Expand your vocabulary
• On This Day - Historical events
• Micro History - Bite-sized historical stories
• Thought Experiment - Mind-bending scenarios
• Factle - Fun daily facts

🎮 Mini Games
• Flappy Circle - Classic arcade action
• Passwordle - Word puzzle challenge
• Ski Game - Endless downhill adventure

✨ Why Underground?
• Fresh content daily
• Beautiful, minimalist design
• No ads, no tracking
• Quick, engaging experiences

Perfect for your morning routine, commute, or whenever you need a quick mental break.

Download Underground today and discover something new every day!
```

**Keywords** (max 100 chars): daily,content,news,games,word,puzzle,facts,history,mini games

**Category**: News (primary), Games (secondary)

**Age Rating**: Complete questionnaire - likely 4+

### Step 4: Privacy & Legal

**Privacy Policy**: REQUIRED - Must create one.

**Simple template**:
```markdown
# Privacy Policy for Underground

Last updated: [DATE]

## Data We Collect
Underground does not collect, store, or share any personal data.

## Third-Party Services
We do not use any third-party analytics or tracking services.

## Changes
We may update this policy. Changes will be posted on this page.

## Contact
[Your email]
```

**Host privacy policy**:
- GitHub Pages (free)
- Your personal website
- Vercel static page

**Support URL**: Can be the same as privacy policy page.

### Step 5: Build for Release

1. In Xcode, select "Any iOS Device (arm64)" from device menu
2. Click Product → Archive
3. Wait for archive to complete (~2-5 minutes)
4. Archive window opens automatically
5. Click "Distribute App"
6. Select "App Store Connect"
7. Click "Upload"
8. Wait for upload (~5-10 minutes)

### Step 6: Submit for Review

1. Go to App Store Connect
2. Click on your app
3. Go to version that was uploaded
4. Fill in all required fields:
   - Upload screenshots
   - Add description
   - Set pricing (Free or Paid)
   - Select availability (countries)
5. Click "Submit for Review"

**Review time**: Typically 1-7 days

---

## Phase 5: Updates (After App Store Launch)

### How Updates Work

**Good news**: You can make changes while app is in review or live! Here's how:

#### For Content/Backend Changes
**No app update needed** - Changes go live immediately:
- Update content via `/planner` interface
- Modify backend API
- Add new daily content modules
- Change existing content

**Why**: App fetches content from backend API, so backend changes appear instantly.

#### For App Code Changes
**Requires new app store submission**:
- New features in React code
- UI changes
- New games
- Navigation changes
- Bug fixes in frontend code

**Process**:
1. Make changes to React code
2. Run `npm run build && npx cap sync`
3. Test in Xcode simulator
4. Build new version
5. Submit to App Store (1-7 day review)

### Update Workflow Example

**Scenario 1: Add new daily content**
```
User edits: Add "Micro History" content for tomorrow
Tool used: /planner interface
Deployment: None needed
Time to live: Immediate (saves to database)
```

**Scenario 2: Add new game**
```
Developer: Creates new game component in React
Build: npm run build && npx cap sync
Testing: Test in Xcode simulator
Archive: Build in Xcode → Archive → Upload
Review: Submit to App Store
Time to live: 1-7 days (Apple review time)
```

**Scenario 3: Fix backend bug**
```
Developer: Fix bug in server/routes.ts
Deploy: vercel --prod (backend)
Time to live: ~1 minute
App update: Not needed
```

### Version Numbers

**Format**: X.Y.Z (e.g., 1.0.0)
- X = Major version (big features, breaking changes)
- Y = Minor version (new features, improvements)
- Z = Patch (bug fixes)

**Example progression**:
- 1.0.0 - Initial launch
- 1.0.1 - Bug fix
- 1.1.0 - Added new game
- 1.2.0 - Added new content module
- 2.0.0 - Major redesign

### Can You Make Changes During Review?

**YES!** Here's what happens:

1. **During initial review** (app in "Waiting for Review" or "In Review"):
   - ✅ Backend changes go live immediately
   - ✅ Content updates work normally
   - ❌ Can't upload new app version (must wait for current review to finish)

2. **After app is live**:
   - ✅ Backend changes go live immediately
   - ✅ Content updates work normally
   - ✅ Can submit new app version anytime
   - Multiple versions can be in review simultaneously

3. **If you need to update app during review**:
   - Option 1: Wait for review to finish, then submit update
   - Option 2: Reject current build, upload new one (restarts review)

### Best Practice: Phased Rollout

Apple offers "Phased Release" for updates:
- Release to 1% of users first
- Gradually increase over 7 days
- Pause if issues found
- Reduces risk of widespread bugs

**Enable in App Store Connect**:
Settings → Phased Release → Enable

---

## Costs Summary

### One-Time Costs
- **Mac computer**: $400-800 (refurbished) or $599+ (new Mac Mini)
- **Google Play Console**: $25 (if adding Android later)
- **App icon design**: $0-50 (can DIY with Canva)

### Annual/Recurring Costs
- **Apple Developer**: $99/year (required)
- **Backend hosting**: $0-10/month (Vercel free tier or Railway)
- **Domain** (optional): $10-15/year

### Total First Year
- **Minimum**: $499 (assuming you have a Mac)
  - $99 Apple Developer
  - $0 Vercel free tier
- **Typical**: $800-1200
  - $600 Mac Mini
  - $99 Apple Developer
  - $60 Backend hosting ($5/mo)
  - $15 Domain

---

## Timeline

### Optimistic (Everything goes smoothly)
- **Week 1**: Get Mac, create accounts, install tools
- **Week 2**: Set up Capacitor, deploy backend, build app
- **Week 3**: Create assets, test, submit to App Store
- **Week 4**: Wait for review
- **Result**: Live in App Store in ~4 weeks

### Realistic (Typical path)
- **Week 1-2**: Get Mac, create accounts, learn Xcode
- **Week 3-4**: Set up Capacitor, troubleshoot issues, deploy backend
- **Week 5**: Build app, create assets (icons, screenshots)
- **Week 6**: Test thoroughly, fix bugs
- **Week 7**: Submit to App Store
- **Week 8**: Respond to review feedback, resubmit if needed
- **Result**: Live in App Store in ~6-8 weeks

---

## Common Issues & Solutions

### Issue: "No provisioning profiles found"
**Solution**: In Xcode, go to Signing & Capabilities → Select your team → Xcode will auto-create profile

### Issue: "Backend API not loading"
**Solution**:
1. Check `capacitor.config.ts` has correct backend URL
2. Verify backend is deployed and accessible
3. Check CORS is configured on backend

### Issue: "App rejected for lack of content"
**Solution**: Ensure app has enough content visible on first launch (Apple requires functional app, not "coming soon" placeholders)

### Issue: Build fails with "Command PhaseScriptExecution failed"
**Solution**:
1. Clean build folder: Product → Clean Build Folder
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Rebuild

### Issue: Can't test on physical iPhone
**Solution**:
1. Connect iPhone to Mac via USB
2. Trust computer on iPhone
3. In Xcode, select your iPhone from device menu
4. Build and run

---

## Quick Reference Commands

### Development
```bash
# Build web app
npm run build

# Sync to iOS project
npx cap sync

# Open in Xcode
npx cap open ios

# Full rebuild
npm run build && npx cap sync && npx cap open ios
```

### Backend Deployment
```bash
# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

### Clean/Reset
```bash
# Remove iOS folder (fresh start)
npx cap sync ios --force

# Clean node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

### Apple Resources
- **Developer Forums**: https://developer.apple.com/forums/
- **App Store Connect Help**: https://developer.apple.com/support/app-store-connect/
- **Xcode Documentation**: https://developer.apple.com/documentation/xcode

### Capacitor Resources
- **Documentation**: https://capacitorjs.com/docs
- **Community Forum**: https://forum.ionicframework.com/c/capacitor/
- **GitHub Issues**: https://github.com/ionic-team/capacitor/issues

### When You're Ready
Save this file and come back to it when you're ready to launch. Everything you need is documented here!

Good luck! 🚀
