"""
Request validation helpers for API endpoints
"""
from flask import jsonify
from utils import validate_request_data

def validate_json_request(request, required_fields):
    """
    Validate JSON request and return error response if invalid
    
    Args:
        request: Flask request object
        required_fields: List of required field names
    
    Returns:
        tuple: (is_valid: bool, response_or_none: Flask response or None)
    """
    if not request.is_json:
        return False, jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    if not data:
        return False, jsonify({"error": "Request body is empty"}), 400
    
    is_valid, error_message = validate_request_data(data, required_fields)
    
    if not is_valid:
        return False, jsonify({"error": error_message}), 400
    
    return True, None

