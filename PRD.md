RockMa Creator AI - PRD (v3.1 FINAL - DEPLOYED)

Project: RockMa
Owner: Ashley Vigo
Date: November 18, 2025 (Specification)
Deployment Date: November 23, 2025
Status: ✅ Live in Production

1. Company and Business Context

Company: RockMa

Client: Marie Hoffman (Owner / Solo-Operator)

Business: RockMa is a "mom & pop" CPG business creating clean, organic personal care products.

Operations: Marie runs all aspects of the business.

Context: The brand identity is "Mama's Love"—warm, faith-based ("Aspire to Inspire"), and community-focused.

Aesthetic: The visual identity is high-contrast Black and Gold.

2. Problem Definition

Marie Hoffman is the solo operator of RockMa. The primary bottleneck to growth is a lack of brand visibility due to the time-consuming nature of manual content creation. This inconsistency prevents her from achieving the "Effective Frequency" (7+ exposures) required to convert customers. She needs a tool to transition from reactive trend-chasing to proactive content creation.

3. User Needs and Proposed Solutions

Primary User (Marie)

Needs: To reduce brainstorming time, generate daily on-brand content, and organize her workflow in a single "Command Center."

Target Customer (The Audience)

Who: Women (25-50), mothers, health-conscious.

Needs: To see consistent, authentic, "clean living" content that builds trust.

Brand Voice & Persona (The "Secret Recipe")

Core Identity: "Aspire to Inspire." Warm, encouraging, faith-based.

Key Themes: Love, Joy, Hope, Peace, Clean Living, Mom-to-Mom support.

Signature Sign-offs: "Made for you with Love," "A Mom from Queens."

Differentiation: Explicitly contrasts RockMa's "clean from the start" ethos against "conventional conglomerates" (like Clorox/Burt's Bees).

Proposed Solution

We will build RockMa Creator AI, a comprehensive "ideation and repurposing suite" housed in a central "Command Center" Dashboard with secure access control.

The tool uses a custom-tuned "AI Persona" (powered by OpenAI GPT-3.5 Turbo) that bakes Marie's brand voice and inventory directly into the backend.

The Core Features:

**Access Control**: Single shared access code authentication system for secure, frictionless entry.

**Home Dashboard (The Command Center)**: A "Bento Box" style hub featuring:
- Creation streak tracking for motivation
- Product spotlight (daily randomized product suggestion)
- Three productivity-focused Quick Actions
- Recent drafts history

**Daily Inspiration**: An "Inventory-Aware" idea generator that produces 3-5 content ideas for specific products.

**Adapt a Competitor**: A text-translator that rewrites competitor scripts into the RockMa voice with brand differentiation.

**Platform Translator**: A repurposing tool to multiply one idea into multiple platform/audience formats.

**Quick Actions Suite** (Dashboard Productivity Tools):
- **📌 Pin Competitor**: Save competitor content for later adaptation
- **🎤 Brain Dump**: Capture raw ideas via text or voice (Web Speech API)
- **⭐ Remix Favorite**: Reuse starred high-performing content

**Star/Favorite System**: Cross-feature content library that turns one-time wins into reusable templates.

4. Goals & Non-Goals

Goals:

[P0] Reduce manual content creation time to <10 minutes/day.

[P0] Provide a centralized "Dashboard" to streamline Marie's workflow with productivity tools.

[P0] Deliver a fully responsive web app with a Black & Gold luxury aesthetic.

[P0] Implement simple but effective security to protect OpenAI API credits.

[P0] Enable content reusability through favoriting/starring system.

[P0] Support both desktop and mobile workflows with full accessibility compliance.

[P0] Provide persistent storage for user data (streaks, drafts, favorites) using localStorage.

Non-Goals (Out of Scope):

[Technical Constraint] No connection to external social media APIs (TikTok, IG) for trend finding or auto-posting.

[P1] No image/video file analysis or generation.

[P1] No multi-user authentication system with individual user accounts (Simple shared access code implemented instead).

[P1] No backend database for user data (localStorage-based persistence is intentional for simplicity).

[P1] No advanced analytics or performance tracking of published content.

5. Scope, Risks, and Constraints

In Scope: 100% text-generation web app (React/Flask). "AI Persona" logic via System Prompt. Local Storage for user history.

Risks: "Trend-Finder" API is not feasible.

Mitigation: Pivoted to "Content Creation Suite" (approved by Client & Managers).

6. Resources Needed

(RECEIVED) Full Inventory List (Body Butters, Lips, Apparel).

(RECEIVED) Brand Assets (Logo, Colors, Mission Statement).

(RECEIVED) Tech Stack Confirmation (React + Flask + OpenAI).

7. Success Metrics

**Time Saved**: Creation process reduced from ~1 hour to <10 minutes per content piece.

**Consistency**: Enable 5+ high-quality posts per week minimum.

**Adoption**: Marie uses the Dashboard as her daily "start page" and command center.

**Content Reusability**: Marie successfully remixes favorited content for multiple platforms.

**Workflow Integration**: Quick Actions (Pin, Brain Dump, Remix) become part of Marie's natural content creation flow.

**Security**: Zero unauthorized access to OpenAI API credits through simple but effective access code system.

**Streak Engagement**: Marie maintains a 7+ day creation streak, indicating daily tool usage.

**Asset Building**: Marie accumulates 10+ starred favorites within first month, building her content library.

8. Requirements

Legend: [P0] = MVP, [P1] = Future

User Journey 0: Authentication & Access Control

Context: Marie (or authorized team members) needs secure access to the tool without complex login systems.

[P0] First Visit - Access Gate:
- User visits the app URL and is presented with a luxury login screen
- Screen features animated golden glow, Playfair Display typography, and glass morphism design
- Password input field with toggle visibility (eye icon)
- User enters shared access code (e.g., "ROCKMA-LOVE-2025")
- Code is validated against backend environment variable
- On success: Code is saved to localStorage for persistent login
- On failure: Input shakes with error animation, user tries again

[P0] Persistence & Security:
- Access code stored in browser localStorage (device-specific)
- User remains logged in until they clear browser data or manually log out
- Code is sent with every API request as Bearer token (Authorization header)
- Backend validates code before processing any AI generation requests
- Invalid/missing code results in 401/403 errors and auto-logout

[P0] Access Management:
- Single shared code for all authorized users (set in backend .env file)
- To change code: Update ACCESS_CODE in Render dashboard and redeploy
- No user accounts, passwords, or email verification required
- Simple but effective protection against unauthorized OpenAI credit usage

User Journey 1: Home Dashboard (The Command Center)

Context: After authentication, Marie lands on the Dashboard and needs to feel motivated and oriented immediately.

[P0] Layout: A "Bento Grid" layout responsive for mobile and desktop with gold accent colors on dark background.

[P0] Welcome Card: Displays greeting "Welcome Back! 👋" and the tagline "Your Command Center for consistent, on-brand content creation."

[P0] Creation Streak: 
- Card displays current streak count (days in a row)
- Animated counter with fire emoji 🔥
- Motivational messaging based on streak length
- Calculated using localStorage (last active date comparison)
- Increments by 1 when user visits on a new day
- Resets to 1 if user misses a day

[P0] Product Spotlight:
- "Today's Spotlight" section with sparkle emoji ✨
- Randomly selects one product from inventory (cached for 24 hours)
- Displays abbreviated product name (e.g., "Cherry Kiss" instead of full name)
- "Generate Ideas for This" button navigates to Daily Inspiration with product pre-selected

[P0] Quick Actions (NEW - Replaced Original Actions):
- **📌 Pin Competitor**: Save competitor links/content for later adaptation
- **🎤 Brain Dump**: Capture raw ideas quickly via text or voice input
- **⭐ Remix Favorite**: Reuse previously starred successful content
- All buttons feature hover effects, gold borders, and accessibility compliance

[P0] Recent Drafts: 
- Shows last 3 generated content pieces
- Displays type badge (Daily Idea, Adaptation, Translation, Raw Idea)
- Shows timestamp and content snippet (first 50 characters)
- One-click copy button for each draft
- Empty state: "No drafts yet. Generate some content to see it here!"

User Journey 2: Daily Content Ideation (Inventory-Aware)

Context: Marie needs ideas for a specific product.

[P0] User can select a specific product from a dropdown populated with:

Body Butters: Vanilla Cream, Choco Love, Cherry Kiss, Coco Beach, Orange Crush, Almondina, Berry Patch.

Lips: Happy, Dreamy, Cozy, Sunny.

Other: Aesthetic Apparel, Beautiful Accents.

[P0] The AI generates 3 ideas that specifically reference the selected product's name and benefits.

User Journey 3: Competitive Content Adaptation

Context: Marie wants to rewrite a competitor's script.

[P0] User pastes text; AI rewrites it in the "Mama's Love" voice.

[P0] AI implicitly highlights RockMa's differentiators (Clean, US-Made, Mom-Owned) vs. the competitor.

User Journey 4: Content Repurposing

Context: Marie multiplies one idea for 5 platforms.

[P0] User inputs text and selects Platform (TikTok, IG, FB, Email, YouTube) and Audience (Core, Gen-Z, Wellness, B2B).

[P0] B2B Audience setting specifically uses her "Founder/Operator" bio data.

User Journey 5: Pin Competitor (Research Tool)

Context: Marie is scrolling social media and finds inspiring competitor content but doesn't have time to adapt it right now.

[P0] Quick Action Trigger:
- User clicks "📌 Pin Competitor" button from Dashboard
- Modal opens with luxury dark aesthetic and gold accents
- Title: "📌 Pin Competitor Content"
- Subtitle: "Save a competitor's link or text to adapt later."

[P0] Save Process:
- Large textarea input with placeholder: "Paste competitor link or text here..."
- User pastes URL or copies full text from competitor post
- Auto-focus on textarea for immediate typing
- Character limit: None (supports long-form content)
- Cancel and "Save Pin" buttons at bottom

[P0] Storage & Management:
- Saved to localStorage as `rockma_competitorClips` array
- Each clip includes: ID, full text, timestamp, snippet (first 50 chars)
- Keeps last 10 pins (oldest automatically pruned)
- No server storage - purely client-side

[P0] Usage in Adapt Competitor:
- Navigate to "Adapt a Competitor" feature
- New dropdown appears above textarea: "Load Pinned Clip (Optional)"
- Dropdown shows snippet of each saved clip
- Selecting a clip auto-fills the main textarea
- User can then adapt it with one click

[P0] UX Polish:
- ESC key closes modal
- Click outside modal to close
- Keyboard navigation support
- Loading/success states
- Mobile-responsive design

User Journey 6: Brain Dump (Ideation Tool)

Context: Marie has a fleeting idea or inspiration but it's not fully formed yet. She needs to capture it before it disappears.

[P0] Quick Action Trigger:
- User clicks "🎤 Brain Dump" button from Dashboard
- Modal opens with title "🎤 Brain Dump"
- Subtitle: "Capture your raw thoughts and ideas."

[P0] Text Input Mode:
- Large textarea (200px minimum height)
- Placeholder: "What's on your mind? Type or click the mic to speak..."
- Auto-focus for immediate typing
- No structure required - completely freeform
- User types messy, raw thoughts

[P0] Voice Input Mode (Optional - Chrome/Safari):
- "🎤 Voice Input" button at bottom left
- Click to start: Button turns red "⏹ Stop"
- Uses browser's Web Speech API (no server processing)
- Real-time transcription appears in textarea
- User can speak naturally, AI transcribes
- Click Stop or wait for pause to finish
- Fallback: If browser doesn't support, shows alert with message

[P0] Save Process:
- "Save Idea" button (disabled until text entered)
- Content saved to localStorage as type: "Raw Idea"
- Appears in Dashboard "Recent Drafts" section
- Saved with timestamp and snippet

[P0] Later Usage:
- Raw ideas visible in Recent Drafts
- User clicks "Copy" button
- Pastes into Daily Inspiration or Platform Translator
- AI refines the raw idea into polished content

[P0] UX Polish:
- ESC key closes modal
- Recording indicator (red button) when voice active
- Browser compatibility check (alerts if voice not supported)
- Mobile-responsive
- Accessibility: ARIA labels, keyboard shortcuts

User Journey 7: Remix Favorite (Asset Library)

Context: Marie generated a script that performed exceptionally well (high engagement, conversions). She wants to reuse the core hook for a different platform or angle.

[P0] Starring Content:
- Star icon (☆) appears next to Copy button on all generated outputs:
  - Daily Inspiration idea cards
  - Adapted Competitor content
  - Platform Translator results
- User clicks star: Icon fills (⭐) and shows tooltip "Added to favorites!"
- Content saved to localStorage as `rockma_favorites` array
- Includes: content text, type (Daily Idea/Adaptation/Translation), timestamp, metadata (platform, audience if applicable)
- Keeps last 20 favorites

[P0] Quick Action Trigger:
- User clicks "⭐ Remix Favorite" button from Dashboard
- Modal opens with title "⭐ Remix a Favorite"
- Subtitle: "Select a favorite to remix for a different platform."

[P0] Browse Favorites:
- List view of all starred content (scrollable if >3)
- Each card shows:
  - Type badge (Daily Idea, Adaptation, Translation)
  - Content snippet (first 60 characters)
  - Delete button (hover to reveal)
- Empty state: "No favorites yet. Star content from any feature to save it!"

[P0] Remix Process:
- User clicks on a favorite card
- Modal closes
- App navigates to Platform Translator tab
- Source text field auto-populated with favorited content
- Platform and Audience dropdowns ready for selection
- User selects new platform/audience
- Clicks "Translate" to generate variation

[P0] Favorite Management:
- Delete individual favorites (in modal or from starred items)
- Star status persists across sessions (localStorage)
- Star icon disabled if content already favorited (cursor: not-allowed)
- Auto-checks if content is favorited on page load

[P0] UX Polish:
- Smooth fade-in animations
- Card hover effects (gold border glow)
- Click outside modal to close
- ESC key support
- Mobile-responsive cards
- Accessibility compliant

User Journey 8: Star/Favorite System Integration

Context: Cross-feature system that turns one-time wins into reusable assets.

[P0] Star Icon Locations:
- **Daily Inspiration**: Star icon on each of the 3-5 generated idea cards
- **Adapt Competitor**: Star icon next to Copy button on adapted content output
- **Platform Translator**: Star icon next to Copy button on translated content output

[P0] Star Behavior:
- Default state: Outlined star (☆) in gray
- Hover: Star turns gold
- Click: Star fills (⭐), shows success tooltip for 2 seconds
- Already starred: Filled star (⭐), disabled state
- Tooltip: "Added to favorites!" / "Already starred"

[P0] Storage Structure:
```javascript
{
  id: "timestamp",
  content: "full script text",
  type: "Daily Idea" | "Adaptation" | "Translation",
  metadata: { product: "Cherry Kiss", platform: "TikTok", audience: "Gen-Z" },
  timestamp: "ISO date string",
  snippet: "first 60 characters..."
}
```

[P0] Workflow Example:
1. Marie generates Daily Inspiration ideas for "Cherry Kiss"
2. One hook resonates: "POV: You realize your chapstick has chemicals..."
3. She stars it ⭐
4. Next day: Opens Dashboard, clicks "⭐ Remix Favorite"
5. Selects that script
6. Translates it for Email → Core Moms audience
7. AI adapts the hook for email format: "Subject: The Truth About Your Chapstick..."
8. She copies and uses in newsletter
9. Stars the email version too for future B2B pitch remix

[P0] Benefits:
- Turns high-performing content into evergreen templates
- Reduces ideation time (start from proven concepts)
- Enables cross-platform multiplication of winning messages
- Builds personal content library over time

---

## 9. Deployment Status

**Status:** ✅ **DEPLOYED TO PRODUCTION**

**Date Deployed:** November 23, 2025

**Production URLs:**
- **Frontend (Vercel):** https://rockma-content-ai.vercel.app
- **Backend API (Render):** https://rockma-creator-ai.onrender.com

**Architecture:**
- Backend: Python Flask on Render (with Gunicorn)
- Frontend: React + Vite on Vercel
- Database: localStorage (client-side persistence)
- Authentication: Single shared access code system

**Deployment Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide and troubleshooting.

**Access:** Protected by access code (`ACCESS_CODE` environment variable). Users must authenticate once per device; code is persisted in browser localStorage.

**Features Implemented:**
- ✅ Daily Inspiration (3-5 product-specific content ideas)
- ✅ Adapt Competitor (rewrite competitor content in RockMa voice)
- ✅ Platform Translator (repurpose content for different platforms/audiences)
- ✅ Dashboard Command Center (streak tracking, product spotlight, recent drafts)
- ✅ Quick Actions (Pin Competitor, Brain Dump with voice input, Remix Favorite)
- ✅ Star/Favorite system for reusing successful content
- ✅ Full accessibility compliance (WCAG 2.1 AA)
- ✅ Mobile-responsive design
- ✅ Production-ready authentication and security

**Next Phase:** Monitor usage, gather user feedback, and iterate based on Marie's content creation workflow.