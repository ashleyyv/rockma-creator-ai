# RockMa Creator AI

An AI-powered content creation suite for RockMa, a mom & pop CPG business. This tool helps generate consistent, on-brand content using a custom-tuned "Mama's Love" AI persona.

## Features

### 🏠 Dashboard (Command Center)
Your landing page featuring:
- **Creation Streak** - Track consecutive days of content creation (gamification)
- **Product Spotlight** - Daily product recommendation to eliminate decision fatigue
- **Quick Actions** - One-click shortcuts to common workflows
- **Recent Drafts** - Safety net showing your last 3 generated pieces of content

### Content Creation Tools
1. **Daily Inspiration** - Generate 3-5 unique content ideas with hooks, scripts, and hashtags for RockMa products (now with product selector for all 13 products)
2. **Adapt a Competitor** - Rewrite competitor content in RockMa's brand voice
3. **Platform Translator** - Repurpose content for different platforms (TikTok, Instagram, Facebook Ad, Email, YouTube) and audiences

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Flask (Python) + OpenAI API
- **AI**: OpenAI GPT-4o-mini (cost-efficient model)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your API key:**
   
   Copy the `.env.example` file to create your `.env` file:
   ```bash
   # On Windows (PowerShell):
   copy .env.example .env
   
   # On Mac/Linux:
   cp .env.example .env
   ```
   
   Then open `.env` in a text editor and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   FLASK_ENV=development
   ```
   
   **📖 For detailed setup instructions, see:** [`backend/SETUP_INSTRUCTIONS.md`](backend/SETUP_INSTRUCTIONS.md)
   
   **🔑 Get your API key from:** https://platform.openai.com/api-keys

5. Run the Flask server:
   ```bash
   python app.py
   ```
   The server will run on `http://localhost:5000`
   
6. **Test the backend** by visiting: http://localhost:5000/api/health
   
   You should see: `{"status": "healthy", "service": "RockMa Creator AI API"}`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file if you need to customize the API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or the port Vite assigns)

## Project Structure

```
rockma-creator-ai/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration management
│   ├── ai_persona.py             # RockMa brand voice and system prompts
│   ├── utils.py                  # Shared AI utility functions
│   ├── request_validators.py     # Request validation helpers
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Your API keys (not in Git)
│   ├── SETUP_INSTRUCTIONS.md     # Detailed setup guide
│   └── routes/
│       ├── daily_inspiration.py
│       ├── adapt_competitor.py
│       └── platform_translator.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── main.jsx              # React entry point
│   │   ├── services/
│   │   │   └── api.js             # API client
│   │   └── utils/
│   │       ├── constants.js      # API endpoints
│   │       └── stateHelpers.js   # Utility functions
│   └── package.json
├── .gitignore                    # Git ignore rules (protects .env)
└── PRD.md                        # Product Requirements Document
```

## API Endpoints

### Daily Inspiration
- **POST** `/api/daily-inspiration/generate`
  - Generates 3-5 content ideas
  - Returns: `{ success: true, ideas: [{ hook, script, hashtags }], product: string }`

### Adapt a Competitor
- **POST** `/api/adapt-competitor/rewrite`
  - Body: `{ competitorText: string }`
  - Returns: `{ success: true, adaptedText: string }`

### Platform Translator
- **POST** `/api/platform-translator/translate`
  - Body: `{ sourceText: string, platform: string, audience: string }`
  - Returns: `{ success: true, translatedContent: string, platform: string, audience: string }`

## Brand Voice

The AI persona is pre-configured with RockMa's "Mama's Love" brand voice:
- **Mission**: To nurture our community by providing consistently clean goods... with a side of love and inspiration
- **Voice**: Warm, caring, inspirational, and trustworthy
- **Keywords**: Love, Joy, Hope, Peace, Nurture, Clean, Healthy, Community, Inspire
- **Differentiators**: Mom-owned, clean production, ethically made in USA, USDA ORGANIC, Leaping Bunny certified

## Product Inventory

The AI is pre-loaded with RockMa's product inventory:

**Body Butters (7 flavors):**
- Vanilla Cream, Choco Love, Cherry Kiss, Coco Beach, Orange Crush, Almondina, Berry Patch

**Lips Organics - Fab 5 Flavor Boxes (4 flavors):**
- Happy, Dreamy, Cozy, Sunny

**Other Products:**
- RockMa Aesthetic Apparel
- RockMa Beautiful Accents

**Total: 13 products** available for content generation.

Users can select a specific product or let the AI randomly choose one for Daily Inspiration content ideas.

## Planned Features

**Dashboard/Command Center** - A centralized hub with quick actions, creation streak tracking, product spotlight, and recent drafts history. Planned for future implementation as outlined in PRD v3.1.

## Development Notes

- The backend uses Flask blueprints for route organization
- Error handling is implemented at both frontend and backend levels
- All API responses follow a consistent `{ success: boolean, ... }` format
- Copy-to-clipboard functionality is available for all generated content
- The app is fully responsive for mobile and desktop

## License

This project is proprietary and confidential.

