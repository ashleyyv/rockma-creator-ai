# RockMa Creator AI

**Client:** RockMa (Marie Hoffman)
**Developer:** Ashley Vigo
**Version:** 3.3 (Production)

An AI-powered content creation suite for RockMa, a mom & pop CPG business. This tool helps generate consistent, on-brand content using a custom-tuned "Mama's Love" AI persona.

## Features

### 🏠 Dashboard (Command Center)
Your centralized landing page featuring:
* **Creation Streak:** Track consecutive days of content creation (gamification).
* **Product Spotlight:** Daily product recommendation to eliminate decision fatigue.
* **Quick Actions:** One-click shortcuts to common workflows.
* **Recent Drafts:** Safety net showing your last 3 generated pieces of content.

### Content Creation Tools
* **Daily Inspiration:** Generate 3-5 unique content ideas with hooks, scripts, and hashtags (includes selector for all 13 products).
* **Adapt a Competitor:** Rewrite competitor content in RockMa's brand voice.
* **Platform Translator:** Repurpose content for different platforms (TikTok, Instagram, Facebook, Email, YouTube) and audiences.

### 🔐 Security Features: Access Code Protection
The app is protected by a single shared access code to prevent unauthorized access and protect your OpenAI API credits.

* **Login:** Enter the code once on each device; it is saved in `localStorage`.
* **Backend Validation:** Every API request is validated on the server.
* **Security:** Unauthorized users cannot access AI features even if they bypass the frontend.
* **Management:** Set code in `backend/.env` (Default: `ROCKMA-LOVE-2025`).

---

## Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Flask (Python) + OpenAI API
* **AI Model:** OpenAI GPT-4o-mini (Cost-efficient)

---

## Setup Instructions

### Prerequisites
* Node.js (v18 or higher)
* Python 3.8 or higher
* OpenAI API key

### 1. Backend Setup

Run the following commands to set up and start the Python backend:

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate
# OR for Mac/Linux:
# python3 -m venv venv
# source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure Environment Variables
cp .env.example .env
# NOTE: Open .env and add your OPENAI_API_KEY before running!

# 5. Run the Server
python app.py


### 2. Front End Set Up

# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

App will run on http://localhost:5173


Project Structure

rockma-creator-ai/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── ai_persona.py             # RockMa brand voice and system prompts
│   ├── utils.py                  # Shared AI utility functions
│   ├── request_validators.py     # Request validation helpers
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # API keys (NOT in Git)
│   └── routes/                   # API Route definitions
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── services/api.js       # API client
│   │   └── utils/                # Constants and Helpers
│   └── package.json
└── PRD.md                        # Product Requirements Document


API Endpoints

Feature,Method,Endpoint,Description
Daily Inspiration,POST,/api/daily-inspiration/generate,Generates 3-5 ideas based on product
Adapt Competitor,POST,/api/adapt-competitor/rewrite,Rewrites external text in brand voice
Platform Translator,POST,/api/platform-translator/translate,Reformats content for specific platforms


Deployment
This app is designed for production deployment:

Backend: Render (Python/Flask)

Frontend: Vercel (React/Vite)

Live URLs:

Frontend: https://rockma-content-ai.vercel.app

Backend API: https://rockma-creator-ai.onrender.com

See DEPLOYMENT.md for detailed instructions.

Brand Voice & Inventory
The AI Persona:

Voice: Warm, caring, inspirational, "Mama's Love"

Keywords: Love, Joy, Hope, Peace, Nurture, Clean

Sign-off: "Made for you with Love"

Product Inventory (Pre-loaded):

Body Butters: Vanilla Cream, Choco Love, Cherry Kiss, Coco Beach, Orange Crush, Almondina, Berry Patch

Lips: Happy, Dreamy, Cozy, Sunny

Other: Aesthetic Apparel, Beautiful Accents

License
This project is proprietary and confidential. Last updated: January 2026
