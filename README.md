# RockMa Creator AI

A 3-feature AI-powered content creation suite for RockMa, a mom & pop CPG business. This tool helps generate consistent, on-brand content using a custom-tuned "Mama's Love" AI persona.

## Features

1. **Daily Inspiration** - Generate 3-5 unique content ideas with hooks, scripts, and hashtags for RockMa products
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

4. Create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FLASK_ENV=development
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```
   The server will run on `http://localhost:5000`

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
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration management
│   ├── ai_persona.py          # RockMa brand voice and system prompts
│   ├── utils.py               # Shared AI utility functions
│   ├── request_validators.py  # Request validation helpers
│   ├── requirements.txt       # Python dependencies
│   └── routes/
│       ├── daily_inspiration.py
│       ├── adapt_competitor.py
│       └── platform_translator.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── main.jsx           # React entry point
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   └── utils/
│   │       ├── constants.js   # API endpoints
│   │       └── stateHelpers.js # Utility functions
│   └── package.json
└── PRD.md                     # Product Requirements Document
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
- RockMa Better Body Butter (Vanilla Cream, Choco Love, Cherry Kiss)
- RockMa Lips Organics (Fab 5 Flavor Boxes)
- RockMa Aesthetic Apparel
- RockMa Beautiful Accents

## Development Notes

- The backend uses Flask blueprints for route organization
- Error handling is implemented at both frontend and backend levels
- All API responses follow a consistent `{ success: boolean, ... }` format
- Copy-to-clipboard functionality is available for all generated content
- The app is fully responsive for mobile and desktop

## License

This project is proprietary and confidential.

