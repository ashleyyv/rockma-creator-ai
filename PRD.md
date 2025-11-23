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

We will build RockMa Creator AI, a 4-part "ideation and repurposing suite" housed in a central "Command Center" Dashboard.

The tool uses a custom-tuned "AI Persona" (powered by OpenAI GPT-3.5 Turbo) that bakes Marie's brand voice and inventory directly into the backend.

The 4 Core Features:

Home Dashboard (The Command Center): A "Bento Box" style hub for quick actions, motivation, and history.

Daily Inspiration: An "Inventory-Aware" idea generator.

Adapt a Competitor: A text-translator that rewrites competitor scripts into the RockMa voice.

Platform Translator: A repurposing tool to multiply one idea into five formats.

4. Goals & Non-Goals

Goals:

[P0] Reduce manual content creation time to <10 minutes/day.

[P0] Provide a centralized "Dashboard" to streamline Marie's workflow.

[P0] Deliver a fully responsive web app with a Black & Gold brand aesthetic.

Non-Goals (Out of Scope for 6-Week MVP):

[Technical Constraint] No connection to external social media APIs (TikTok, IG) for trend finding or auto-posting.

[P1] No image/video file analysis or generation.

[P1] No user authentication system (Local Storage will be used for history/streaks).

5. Scope, Risks, and Constraints

In Scope: 100% text-generation web app (React/Flask). "AI Persona" logic via System Prompt. Local Storage for user history.

Risks: "Trend-Finder" API is not feasible.

Mitigation: Pivoted to "Content Creation Suite" (approved by Client & Managers).

6. Resources Needed

(RECEIVED) Full Inventory List (Body Butters, Lips, Apparel).

(RECEIVED) Brand Assets (Logo, Colors, Mission Statement).

(RECEIVED) Tech Stack Confirmation (React + Flask + OpenAI).

7. Success Metrics

Time Saved: Creation process reduced from ~1 hour to <10 minutes.

Consistency: Enable 5+ high-quality posts per week.

Adoption: Marie uses the Dashboard as her daily "start page."

8. Requirements

Legend: [P0] = MVP, [P1] = Future

User Journey 0: Home Dashboard (The Command Center)

Context: Marie logs in and needs to feel motivated and oriented immediately.

[P0] Layout: A "Bento Grid" layout responsive for mobile and desktop.

[P0] Welcome Card: Displays a greeting and a calculated "Creation Streak" (days in a row) using Local Storage.

[P0] Product Spotlight: Randomly selects one item from the inventory (e.g., "Cherry Kiss") and prompts her to generate content for it.

[P0] Quick Actions: "Deep Link" buttons that take her directly to specific features (e.g., "Draft New TikTok" -> opens Feature 1).

[P0] Recent Drafts: A list of the last 3 generated scripts (saved in Local Storage) with a "Copy" button.

User Journey 1: Daily Content Ideation (Inventory-Aware)

Context: Marie needs ideas for a specific product.

[P0] User can select a specific product from a dropdown populated with:

Body Butters: Vanilla Cream, Choco Love, Cherry Kiss, Coco Beach, Orange Crush, Almondina, Berry Patch.

Lips: Happy, Dreamy, Cozy, Sunny.

Other: Aesthetic Apparel, Beautiful Accents.

[P0] The AI generates 3 ideas that specifically reference the selected product's name and benefits.

User Journey 2: Competitive Content Adaptation

Context: Marie wants to rewrite a competitor's script.

[P0] User pastes text; AI rewrites it in the "Mama's Love" voice.

[P0] AI implicitly highlights RockMa's differentiators (Clean, US-Made, Mom-Owned) vs. the competitor.

User Journey 3: Content Repurposing

Context: Marie multiplies one idea for 5 platforms.

[P0] User inputs text and selects Platform (TikTok, IG, FB, Email, YouTube) and Audience (Core, Gen-Z, Wellness, B2B).

[P0] B2B Audience setting specifically uses her "Founder/Operator" bio data.

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