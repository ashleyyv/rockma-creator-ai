"""
Platform Translator API Routes
Translates content for specific platforms and audiences
"""
from flask import Blueprint, request, jsonify
from utils import generate_ai_content
from request_validators import validate_json_request
from backend.middleware.auth_middleware import require_auth

platform_translator_bp = Blueprint('platform_translator', __name__)

# Platform-specific guidelines
PLATFORM_GUIDELINES = {
    "TikTok": {
        "format": "Short, punchy, engaging. Use hooks that grab attention in first 3 seconds. Include trending elements when appropriate.",
        "length": "Very concise (1-2 sentences for hook, 2-4 sentences for body)",
        "tone": "Energetic, authentic, relatable"
    },
    "Instagram": {
        "format": "Visual-first thinking. Include emojis strategically. Hashtags are important (5-10). Story-style captions work well.",
        "length": "Medium length (2-3 sentences for hook, 3-5 sentences for body)",
        "tone": "Inspirational, aspirational, community-focused"
    },
    "Facebook Ad": {
        "format": "Clear value proposition. Strong call-to-action. Benefit-focused. Professional but warm.",
        "length": "Concise but complete (1-2 sentences for hook, 3-4 sentences for body)",
        "tone": "Trustworthy, professional, value-driven"
    },
    "Email": {
        "format": "Personal, conversational. Can be longer form. Clear structure with greeting and sign-off.",
        "length": "Longer form (2-3 sentences for hook, 4-6 sentences for body)",
        "tone": "Personal, warm, relationship-building"
    },
    "YouTube": {
        "format": "Engaging hook, clear structure. Can include questions to encourage engagement. Longer form content.",
        "length": "Longer form (2-3 sentences for hook, 5-8 sentences for body)",
        "tone": "Educational, engaging, community-focused"
    }
}

# Audience-specific guidelines
AUDIENCE_GUIDELINES = {
    "Core Moms 25-50": {
        "focus": "Emphasize family, health, wellness, time-saving, quality, trust",
        "language": "Relatable, warm, understanding of busy mom life",
        "values": "Clean ingredients, safety, family wellness, ethical production"
    },
    "Gen-Z": {
        "focus": "Authenticity, sustainability, social impact, trends, values",
        "language": "Casual, direct, trend-aware, values-driven",
        "values": "Sustainability, ethical practices, transparency, social responsibility"
    },
    "Wellness Enthusiasts": {
        "focus": "Health benefits, ingredients, science-backed, holistic wellness",
        "language": "Educational, detailed, health-focused, ingredient-aware",
        "values": "Clean ingredients, organic certification, health benefits, natural solutions"
    },
    "B2B": {
        "focus": "Partnership opportunities, wholesale, business value, professional relationships",
        "language": "Professional, value-focused, partnership-oriented",
        "values": "Quality, reliability, business growth, partnership potential"
    }
}

@platform_translator_bp.route('/translate', methods=['POST'])
@require_auth
def translate_content():
    """
    Translate content for specific platform and audience
    Accepts: { sourceText: string, platform: string, audience: string }
    Returns: { translatedContent: string }
    """
    # Validate request
    is_valid, error_response = validate_json_request(request, ['sourceText', 'platform', 'audience'])
    if not is_valid:
        return error_response
    
    try:
        data = request.get_json()
        source_text = data['sourceText'].strip()
        platform = data['platform']
        audience = data['audience']
        
        if not source_text:
            return jsonify({
                'success': False,
                'error': 'sourceText cannot be empty'
            }), 400
        
        # Validate platform
        if platform not in PLATFORM_GUIDELINES:
            return jsonify({
                'success': False,
                'error': f'Invalid platform. Must be one of: {", ".join(PLATFORM_GUIDELINES.keys())}'
            }), 400
        
        # Validate audience
        if audience not in AUDIENCE_GUIDELINES:
            return jsonify({
                'success': False,
                'error': f'Invalid audience. Must be one of: {", ".join(AUDIENCE_GUIDELINES.keys())}'
            }), 400
        
        platform_guidelines = PLATFORM_GUIDELINES[platform]
        audience_guidelines = AUDIENCE_GUIDELINES[audience]
        
        # Build the prompt for platform/audience translation
        user_prompt = f"""Transform the following RockMa content for {platform} targeting the {audience} audience.

SOURCE CONTENT:
{source_text}

PLATFORM REQUIREMENTS ({platform}):
- Format: {platform_guidelines['format']}
- Length: {platform_guidelines['length']}
- Tone: {platform_guidelines['tone']}

AUDIENCE REQUIREMENTS ({audience}):
- Focus: {audience_guidelines['focus']}
- Language: {audience_guidelines['language']}
- Values: {audience_guidelines['values']}

INSTRUCTIONS:
1. Maintain the core RockMa brand voice (warm, caring, inspirational, trustworthy)
2. Adapt the content to match {platform} format and tone requirements
3. Tailor the messaging to resonate with {audience} values and language
4. Keep the RockMa differentiators (mom-owned, clean, organic, ethically made in USA)
5. Ensure the content feels authentic and appropriate for the platform
6. Return ONLY the translated content, without any additional explanation or formatting."""

        # Generate translated content using AI
        translated_content = generate_ai_content(user_prompt, temperature=0.7)
        
        return jsonify({
            'success': True,
            'translatedContent': translated_content,
            'platform': platform,
            'audience': audience
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to translate content'
        }), 500

