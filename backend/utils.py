"""
Shared utility functions for AI operations
"""
from openai import OpenAI
from config import Config
from ai_persona import get_base_system_prompt

# Initialize OpenAI client
client = OpenAI(api_key=Config.OPENAI_API_KEY)

def generate_ai_content(user_prompt, system_prompt_override=None, model="gpt-4o-mini", temperature=0.7):
    """
    Generic function to generate AI content using OpenAI
    
    Args:
        user_prompt: The user's prompt/request
        system_prompt_override: Optional custom system prompt (defaults to RockMa persona)
        model: OpenAI model to use (default: gpt-4o-mini for cost efficiency)
        temperature: Creativity level (0-1, default: 0.7)
    
    Returns:
        str: Generated content from AI
    """
    system_prompt = system_prompt_override if system_prompt_override else get_base_system_prompt()
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        raise Exception(f"AI generation failed: {str(e)}")

def validate_request_data(data, required_fields):
    """
    Validate that required fields are present in request data
    
    Args:
        data: Dictionary of request data
        required_fields: List of required field names
    
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None

