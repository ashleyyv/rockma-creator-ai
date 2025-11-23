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
5. **Set your access code** (default is `ROCKMA-LOVE-2025`)
6. Save and close the file

### 2.5. 🔐 Access Code Configuration (NEW!)
The app now requires an access code for security. This prevents unauthorized users from accessing your OpenAI credits.

**What is the access code?**
- A simple password that protects your app
- Default code: `ROCKMA-LOVE-2025`
- You can change it to anything you want

**To set/change the access code:**
1. Open `backend/.env`
2. Find the line: `ACCESS_CODE=ROCKMA-LOVE-2025`
3. Change `ROCKMA-LOVE-2025` to your desired code (e.g., `MARIE-2025` or `MySecretCode123`)
4. Save the file
5. Restart the backend server if it's already running

**Using the app:**
- When you first open the app, you'll see a login screen
- Enter the access code
- The code is saved in your browser (you won't need to enter it again on that device)
- Share the code only with authorized users

**To logout:**
- Click the "Logout" button in the top-right corner of the app
- This will clear the code from your browser

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

**Error: "ACCESS_CODE environment variable is not set"**
- Solution: Make sure `.env` file contains the `ACCESS_CODE=ROCKMA-LOVE-2025` line

**Error: "Invalid access code" on login screen**
- Solution: Make sure you're entering the exact code from your `.env` file (case-sensitive)
- Solution: Restart the backend server after changing the access code

**Error: "Invalid API key"**
- Solution: Double-check your API key is copied correctly (no extra spaces)

**Error: "Port 5000 already in use"**
- Solution: Close other apps using port 5000, or change the port in `app.py`

**Error: "ModuleNotFoundError: No module named 'flask'"**
- Solution: Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

**App keeps asking for access code after I've entered it**
- Solution: Check browser localStorage is enabled (not in private/incognito mode)
- Solution: Try a different browser

## Need Help?
Contact your developer or check the OpenAI documentation:
https://platform.openai.com/docs/quickstart

