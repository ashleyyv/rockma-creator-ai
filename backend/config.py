import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the Flask application"""
    
    # AI API Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # API Configuration
    API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')
    
    @staticmethod
    def validate():
        """Validate that required configuration is present"""
        if not Config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        return True

