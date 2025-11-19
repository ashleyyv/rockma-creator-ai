# Backend Setup Instructions

## Prerequisites
- Python 3.8 or higher installed
- OpenAI API account with API key

## Step-by-Step Setup

### 1. Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. **Important:** Save it securely - you won't see it again!

### 2. Configure the Backend
1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   # On Windows (PowerShell):
   copy .env.example .env
   
   # On Mac/Linux:
   cp .env.example .env
   ```
3. Open `.env` in a text editor
4. Replace `your-openai-api-key-here` with your actual API key
5. Save and close the file

### 3. Install Dependencies
```bash
# Make sure you're in the backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 4. Start the Server
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### 5. Test the Backend
Open a browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "status": "healthy",
  "service": "RockMa Creator AI API"
}
```

## Security Notes
- ⚠️ **Never commit `.env` to Git** - it contains your secret API key
- ⚠️ **Never share your API key publicly** - treat it like a password
- ✅ The `.env` file is already in `.gitignore` to prevent accidental commits
- ✅ Only `.env.example` (the template) is tracked by Git

## Cost Management
- The app uses GPT-4o-mini (cost-efficient model)
- Estimated cost: ~$0.01-0.03 per content generation
- Monitor usage at: https://platform.openai.com/usage

## Troubleshooting

**Error: "OPENAI_API_KEY environment variable is not set"**
- Solution: Make sure `.env` file exists in the `backend/` directory with your API key

**Error: "Invalid API key"**
- Solution: Double-check your API key is copied correctly (no extra spaces)

**Error: "Port 5000 already in use"**
- Solution: Close other apps using port 5000, or change the port in `app.py`

**Error: "ModuleNotFoundError: No module named 'flask'"**
- Solution: Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

## Need Help?
Contact your developer or check the OpenAI documentation:
https://platform.openai.com/docs/quickstart

