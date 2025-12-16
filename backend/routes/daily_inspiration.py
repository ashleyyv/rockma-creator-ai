"""
Daily Inspiration API Routes
Generates 3-5 unique content ideas with Hook, Caption, Hashtags
"""
from flask import Blueprint, request, jsonify
from utils import generate_ai_content
from ai_persona import PRODUCT_INVENTORY, get_contextual_prompt
from middleware.auth_middleware import require_auth
import json
import random

daily_inspiration_bp = Blueprint('daily_inspiration', __name__)

def get_random_product():
    """Get a random product from inventory"""
    all_products = []
    for category, items in PRODUCT_INVENTORY.items():
        all_products.extend(items)
    return random.choice(all_products) if all_products else "RockMa product"

@daily_inspiration_bp.route('/generate', methods=['POST'])
@require_auth
def generate_ideas():
    """
    Generate 3-5 daily inspiration content ideas
    Accepts optional 'product' parameter in request body
    Returns: { ideas: [{ hook, caption, hashtags }], product: string }
    """
    try:
        # Get product and settings from request body (optional)
        data = request.get_json() or {}
        requested_product = data.get('product', None)
        seasonality = data.get('seasonality', 'none')
        pillar = data.get('pillar', 'support')
        
        # Get contextual prompt based on settings
        contextual_prompt = get_contextual_prompt(seasonality, pillar)
        
        # Get all available products for validation
        all_products = []
        for category, items in PRODUCT_INVENTORY.items():
            all_products.extend(items)
        
        # Validate and select product
        if requested_product:
            # If product specified, validate it
            if requested_product not in all_products:
                return jsonify({
                    'success': False,
                    'message': f'Invalid product. Please select from available products.',
                    'available_products': all_products
                }), 400
            selected_product = requested_product
        else:
            # If no product specified, select random
            selected_product = get_random_product()
        
        # Build the prompt for generating ideas
        contextual_instruction = f"\n\n{contextual_prompt}" if contextual_prompt else ""
        user_prompt = f"""Generate 3-5 unique content ideas for social media (TikTok, Instagram, Facebook) about this specific RockMa product: {selected_product}{contextual_instruction}

For each idea, provide:
1. HOOK: An attention-grabbing opening line (1-2 sentences)
2. CAPTION: The post caption text that goes with the photo/video (2-4 sentences)
3. HASHTAGS: 5-10 relevant hashtags

Format your response as a JSON array where each object has "hook", "caption", and "hashtags" fields.

Example format:
[
  {{
    "hook": "You know that feeling when your skin just drinks up moisture?",
    "caption": "That's what our {selected_product} does every single day. Made with love and the cleanest ingredients, because your skin deserves the best. No harsh chemicals, just pure nourishment.",
    "hashtags": "#CleanBeauty #OrganicSkincare #MomOwned #RockMa #SelfCare"
  }}
]

Make each idea unique, authentic, and aligned with the RockMa "Mama's Love" brand voice. Focus on the product's benefits, the brand's values (clean, organic, family-owned), and create content that resonates with health-conscious mothers."""

        # Generate content using AI
        ai_response = generate_ai_content(user_prompt, temperature=0.8)
        
        # Parse the JSON response
        try:
            # Try to extract JSON from the response (AI might add extra text)
            # Look for JSON array in the response
            json_start = ai_response.find('[')
            json_end = ai_response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                ideas = json.loads(json_str)
            else:
                # Fallback: try parsing the whole response
                ideas = json.loads(ai_response)
            
            # Validate structure
            if not isinstance(ideas, list):
                raise ValueError("Response is not a list")
            
            # Ensure each idea has required fields
            validated_ideas = []
            for idea in ideas:
                if isinstance(idea, dict) and 'hook' in idea and ('caption' in idea or 'script' in idea):
                    # Support both 'caption' (new) and 'script' (legacy) for backward compatibility
                    caption = idea.get('caption', idea.get('script', ''))
                    validated_ideas.append({
                        'hook': idea.get('hook', ''),
                        'caption': caption,
                        'hashtags': idea.get('hashtags', '')
                    })
            
            if not validated_ideas:
                raise ValueError("No valid ideas found in response")
            
            # Limit to 5 ideas max
            validated_ideas = validated_ideas[:5]
            
            return jsonify({
                'success': True,
                'ideas': validated_ideas,
                'product': selected_product
            }), 200
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a structured error
            return jsonify({
                'success': False,
                'error': 'Failed to parse AI response',
                'message': 'The AI generated content could not be parsed. Please try again.',
                'raw_response': ai_response[:200]  # First 200 chars for debugging
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to generate daily inspiration ideas'
        }), 500

