"""
Authentication routes for access code validation
"""
from flask import Blueprint
from middleware.auth_middleware import validate_access_code_endpoint

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/validate', methods=['POST'])
def validate_code():
    """
    POST /api/auth/validate
    Validates the access code provided in Authorization header
    """
    return validate_access_code_endpoint()

