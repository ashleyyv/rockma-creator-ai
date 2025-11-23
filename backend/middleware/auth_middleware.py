"""
Authentication middleware for RockMa Creator AI
Validates access code on every API request
"""
from functools import wraps
from flask import request, jsonify
from backend.config import Config

def require_auth(f):
    """
    Decorator to protect routes with access code authentication
    Expects: Authorization: Bearer ROCKMA-LOVE-2025
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'success': False,
                'error': 'No authorization provided'
            }), 401
        
        # Expected format: "Bearer ROCKMA-LOVE-2025"
        try:
            scheme, token = auth_header.split(' ', 1)
            if scheme.lower() != 'bearer':
                return jsonify({
                    'success': False,
                    'error': 'Invalid authorization scheme'
                }), 401
            
            # Validate token against ACCESS_CODE
            if token != Config.ACCESS_CODE:
                return jsonify({
                    'success': False,
                    'error': 'Invalid access code'
                }), 403
                
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid authorization format'
            }), 401
        
        # If we get here, authentication passed
        return f(*args, **kwargs)
    
    return decorated_function


def validate_access_code_endpoint():
    """
    Endpoint to validate access code without making AI request
    Used by frontend login screen
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return jsonify({
            'success': False,
            'error': 'No authorization provided'
        }), 401
    
    try:
        scheme, token = auth_header.split(' ', 1)
        if scheme.lower() != 'bearer':
            return jsonify({
                'success': False,
                'error': 'Invalid authorization scheme'
            }), 401
        
        if token != Config.ACCESS_CODE:
            return jsonify({
                'success': False,
                'error': 'Invalid access code'
            }), 403
        
        return jsonify({
            'success': True,
            'message': 'Access code valid'
        }), 200
        
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid authorization format'
        }), 401

