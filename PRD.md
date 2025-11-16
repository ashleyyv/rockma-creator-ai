RockMa Creator AI - PRD (v3.0 FINAL)

Project: RockMa
Owner: Ashley Vigo
Date: November 15, 2025 (Last update)

1. Company and Business Context

Company: RockMa

Client: Marie Hoffman (Owner / Solo-Operator)

Business: RockMa is a "mom & pop" CPG (Consumer Packaged Goods) business that creates clean, organic, and health-conscious personal care products (body butters, lip balms, etc.).

Operations: Marie is the founder and sole operator, running the business with her family. She is responsible for all aspects of the company, from product creation and fulfillment to all marketing and sales.

Context: The brand's core identity is the "Mama's love" persona, which emphasizes a warm, caring, and inspirational connection with its customers.

2. Problem Definition

Marie Hoffman is the solo operator of RockMa, a "mom & pop" business she runs with her family. As the founder, she juggles everything from product creation to marketing.

The primary bottleneck to RockMa's growth is a lack of brand visibility. Her current marketing "hurdle" is a tedious, manual, and time-consuming content creation process that leads to inconsistent posting. This inconsistency makes it impossible to achieve the "Effective Frequency" (the 7+ exposures) required to build brand awareness and convert customers.

3. User Needs and Proposed Solutions

Primary User (The Tool Operator)

Who: Marie Hoffman (Owner); Secondary User: Brian (Fiancée)

Needs:

As Marie, I need to reduce the time I spend brainstorming because I am also manually creating products and running the entire business.

As Marie, I need to generate daily, on-brand content in order to maintain consistency and build brand visibility.

As Marie, I need a simple, "tech-remedial-friendly" tool because I am not a technical user and need a solution that saves time, not creates new work.

Target Customer (The Content Audience)

Who: The primary customer demographic is women (ages 25-50), often mothers, who are health-conscious and value organic, clean products, wellness, and inspirational messaging. (Source: Client Data PDF, pg. 13)

Needs:

This customer needs to build trust with a brand before purchasing. This requires seeing consistent, high-quality, and authentic content (the "Effective Frequency" or "Marketing Rule of 7") that resonates with their values.

They are "research-oriented, valuing brands that offer transparency, effectiveness and ethical practices." (Source: Client Data PDF, pg. 13)

Brand Voice & Persona (The "Secret Recipe")

Who: To meet the customer's need for authenticity, RockMa's brand voice is the "Mama's love" persona.

Needs:

Mission: "To nurture our community by providing consistently clean goods... with a side of love and inspiration." (Source: Client Data PDF, pg. 7)

Core Voice: The voice is defined as: warm, caring, inspirational, and trustworthy. Marie described it as the "little note in the lunchbox" or the "note, a quote or a verse" included in each box, embodying the "spirit of love, joy, hope and peace."

Keywords: Love, Joy, Hope, Peace, Nurture, Clean, Healthy, Community, Inspire.

Differentiators: The brand is a "relatable owner," "Committed to clean production from the outset," and "Ethically and sustainably made in the USA" (USDA ORGANIC, Leaping Bunny certified). It is not a "conventional conglomerate" like Clorox (Burt's Bees) or P&G. (Source: Client Data PDF, pg. 11-12)

Proposed Solution

We will build RockMa Creator AI, a 3-feature "ideation and repurposing suite."

This is not a generic tool, but a custom-tuned "AI Persona" that bakes Marie's "Mama's love" brand voice and product inventory directly into the app's DNA. This turns her manual "magic ChatGPT thread" process into an automatic tool where the buttons are the prompts.

The tool will have three core features visualized below:

Daily Inspiration: An "Inventory-Aware" tool that solves the "blank slate" problem.

Adapt a Competitor: A "Competitive-Intel Translator" that steals ideas from competitors (Burt's Bees, EOS).

Platform Translator: A "Marketing-Strategy" tool that multiplies one idea for multiple platforms and audiences.


Key MVP Value:

Solves the "Blank Slate" Problem: The "Daily Inspiration" feature provides a consistent stream of high-quality, on-brand content ideas about specific products.

Eliminates the "Adaptation" Bottleneck: The "Adapt a Competitor" feature turns a frustrating, time-consuming manual rewriting process into an efficient, 20-second "magical" action.

Automates "Content Chopping": The "Platform Translator" feature solves the manual bottleneck of repurposing a single idea for multiple platforms, dramatically increasing content output and consistency.

4. Goals & Non-Goals

Goals:

[P0] Significantly reduce the time and effort Marie spends on content ideation and writing.

[P0] Enable Marie to post high-quality, on-brand content consistently.

[P0] Create a simple, "responsive" web tool that Marie can use daily on desktop or mobile.

Non-Goals (Out of Scope for 6-Week MVP):

[Technical Constraint] This tool will NOT connect to the TikTok API or any third-party service for trend/sound/hashtag analysis. This path is not feasible or maintainable.

This tool will NOT analyze sales data, "conversions," or ROI.

This tool will NOT automatically post or schedule content to any platform.

This tool will NOT process or analyze image or video files (e.g., image-to-text).

This tool will NOT batch-process content.

5. Scope, Risks, and Constraints

In Scope (MVP): The scope of this 6-week build is a 100% text-generation web application with three features: "Daily Inspiration," "Adapt a Competitor," and "Platform Translator." The app will have a pre-engineered "AI Persona" (based on client data) and will be fully responsive for mobile and desktop browsers.

Out of Scope (Icebox): All items listed in the "Non-Goals" section are explicitly out of scope.

Key Risks & Blockers (and Mitigations):

Risk: Client initially requested a "trend-finder" feature for sounds/hashtags.

Blocker: This was determined to be technically infeasible. The official TikTok API does not provide this data (the "Front Door" is locked).

Blocker: Paid third-party APIs are the "wrong tool" (social listening, not trend-finding).

Blocker: Scraping (the "Back Door") is not a stable or maintainable solution.

Mitigation (Complete): This risk was successfully mitigated in the MVP Pitch Workshop (11/6). The client (Marie) and all managers (Tim, Pak) have fully aligned on pivoting to the high-value, maintainable "AI Persona" suite.

6. Resources Needed

Client Resources:

3x 30-minute meetings per week for feedback, testing, and alignment.

(RECEIVED) Full product inventory list, brand voice guides, and marketing strategy (Source: "RockMa Creator AI notes for Ashley.pdf").

(RECEIVED) Links to all relevant social media accounts (Source: "RockMa Creator AI notes for Ashley.pdf").

Builder Resources:

Technical Support (Pak): Guidance on the final (React/Flask) tech stack and any significant backend implementation blockers.

Strategy Support (Tim): High-level guidance and alignment on any future scope changes or client communications.

Requirements

Legend
[P0] = MVP for 6-week build
[P1] = Nice-to-have (Out of Scope for 6-week build)

User Journey 1: Daily Content Ideation (Blank Slate)

Context: Marie needs to create content but is starting with no ideas for her primary platforms (TikTok, Instagram, Facebook). This feature solves the "blank slate" problem and will be pre-trained on her full product list.

AI Persona (Backend): The AI will be pre-loaded with the following product inventory:

RockMa Better Body Butter (Vanilla Cream, Choco Love, Cherry Kiss, etc.)

RockMa Lips Organics (Fab 5 Flavor Boxes: Happy, Dreamy, etc.)

RockMa Aesthetic Apparel

RockMa Beautiful Accents

[P0] User can navigate to the "Daily Inspiration" feature.

[P0] User can click a "Get My Daily Ideas" button.

[P0] Upon clicking, the user sees 3-5 unique content ideas (with Hook, Script, Hashtags) generated by the "RockMa Persona" and randomly focused on her specific products.

[P0] User can easily copy the text for any generated idea to their clipboard.

User Journey 2: Competitive Content Adaptation

Context: Marie has found a competitor's text script (e.g., from Burt's Bees, EOS) and wants to quickly adapt it for her brand. Her current manual process is [DATA PENDING: Awaiting full step-by-step process from Marie].

[P0] User can navigate to the "Adapt a Competitor" feature.

[P0] User can paste text (the competitor's script) into a large input field.

[P0] User can click an "Adapt for RockMa" button.

[P0] Upon clicking, the user sees a new, rewritten script in the "RockMa" (Mama's love) brand voice, which implicitly highlights her brand's differentiators (e.g., "mom-owned," "clean," "not owned by Clorox").

[P0] User can easily copy the new script to their clipboard.

User Journey 3: Content Repurposing & Expansion

Context: Marie has a single core idea (e.g., a product description) and wants to efficiently create content for multiple platforms and audiences to support her marketing strategies (e.g., "Direct Sales" to partners).

[P0] User can navigate to the "Platform Translator" feature.

[P0] User can paste text (their core idea) into a large input field.

[P0] User can select a target platform from a list (TikTok, Instagram, Facebook Ad, Email, YouTube).

[P0] User can select a target audience from a dropdown list (Core (Moms 25-50), Wider Reach (Gen-Z), Wellness Enthusiasts, Professional (B2B)).

[P0] Upon making selections, the user sees newly generated content, formatted and toned for that specific platform and audience.

[P0] User can easily copy the new content to their clipboard.

[P0] The tool will not automatically track the success of the generated content. Marie will continue to use platform-native analytics (e.g., TikTok analytics) to track post-success.

User Journey 4: General System Requirements

Context: These are the base requirements for the entire application.

[P0] The web application must be "responsive," meaning it is fully usable and looks clean on both desktop and a mobile phone's browser.

[P0] The "RockMa Persona" (Brand Voice, Audience, Inventory) must be pre-engineered into the backend as a System Prompt.

[P0] The application must be scalable, allowing new products to be easily added to the AI's "memory" (System Prompt) in the future.

[P1] User can upload a picture to generate content (Out of Scope / Future Feature). Future implementation of this feature would require a cloud storage solution (e.g., AWS S3) for image handling and a multimodal AI model.

[P1] User can batch upload content (Out of Scope / Future Feature).