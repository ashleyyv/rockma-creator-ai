"""
Adapt a Competitor API Routes
Rewrites competitor content in RockMa brand voice
"""
from flask import Blueprint, request, jsonify
from utils import generate_ai_content
from request_validators import validate_json_request
from middleware.auth_middleware import require_auth
from ai_persona import get_contextual_prompt

adapt_competitor_bp = Blueprint('adapt_competitor', __name__)

@adapt_competitor_bp.route('/rewrite', methods=['POST'])
@require_auth
def rewrite_content():
    """
    Adapt competitor content for RockMa brand
    Accepts: { competitorText: string }
    Returns: { adaptedText: string }
    """
    # Validate request
    is_valid, error_response = validate_json_request(request, ['competitorText'])
    if not is_valid:
        return error_response
    
    try:
        data = request.get_json()
        competitor_text = data['competitorText'].strip()
        seasonality = data.get('seasonality', 'none')
        pillar = data.get('pillar', 'support')
        
        if not competitor_text:
            return jsonify({
                'success': False,
                'error': 'competitorText cannot be empty'
            }), 400
        
        # Get contextual prompt based on settings
        contextual_prompt = get_contextual_prompt(seasonality, pillar)
        contextual_instruction = f"\n\n{contextual_prompt}" if contextual_prompt else ""
        
        # Build the prompt for adapting content
        user_prompt = f"""Rewrite the following competitor content (from brands like Burt's Bees, EOS, or similar) in the RockMa "Mama's Love" brand voice.

COMPETITOR CONTENT:
{competitor_text}

INSTRUCTIONS:
1. Maintain the core message and value proposition, but rewrite it in RockMa's warm, caring, inspirational voice
2. Emphasize RockMa's differentiators:
   - Mom-owned business (relatable owner, not a conglomerate)
   - Clean, organic production from the start
   - Ethically and sustainably made in the USA
   - USDA ORGANIC certified
   - Leaping Bunny certified
3. Use the brand keywords: Love, Joy, Hope, Peace, Nurture, Clean, Healthy, Community, Inspire
4. Make it feel authentic and personal, like a caring note from a mother
5. Keep the same general structure and length, but infuse it with RockMa's personality{contextual_instruction}

Return ONLY the rewritten content, without any additional explanation or formatting."""

        # Generate adapted content using AI
        adapted_text = generate_ai_content(user_prompt, temperature=0.7)
        
        return jsonify({
            'success': True,
            'adaptedText': adapted_text
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to adapt competitor content'
        }), 500

