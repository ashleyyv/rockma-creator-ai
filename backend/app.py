from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Initialize the Flask app
app = Flask(__name__)

# CORS configuration - allow Vercel deployments and localhost
# Use a callable function to dynamically check origins for better flexibility
def cors_origin_check(origin):
    """Check if origin is allowed for CORS"""
    if not origin:
        return None
    
    # Always allow localhost for development
    if origin.startswith("http://localhost"):
        return origin
    
    # Allow specific production URLs
    allowed_production = [
        "https://rockma-creator-ai-5uud.vercel.app",
        "https://rockma-content-ai.vercel.app",
    ]
    if origin in allowed_production:
        return origin
    
    # Allow any Vercel subdomain (preview deployments)
    if origin.endswith(".vercel.app"):
        return origin
    
    # Reject all other origins
    return None

# Set up CORS with dynamic origin checking
# Flask-CORS supports callable functions for origins
CORS(app, 
     origins=cors_origin_check,
     resources={
         r"/api/*": {
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": False
         }
     })

# Error handling middleware
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request", "message": str(error)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found", "message": "The requested resource was not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred"}), 500

# Test route
@app.route("/api/test", methods=['GET'])
def test_api():
    return jsonify({
        "message": "Hello from the backend! The kitchen is open.",
        "status": "success"
    })

# Health check route
@app.route("/api/health", methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "RockMa Creator AI API"
    })

# Root route
@app.route("/", methods=['GET'])
def root():
    return jsonify({
        "service": "RockMa Creator AI API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "test": "/api/test",
            "auth": {
                "validate": "/api/auth/validate"
            },
            "daily_inspiration": {
                "generate": "/api/daily-inspiration/generate"
            },
            "adapt_competitor": {
                "rewrite": "/api/adapt-competitor/rewrite"
            },
            "platform_translator": {
                "translate": "/api/platform-translator/translate"
            }
        },
        "documentation": "See /api/health for service status"
    })

# Import route modules
from routes.auth import auth_bp
from routes.daily_inspiration import daily_inspiration_bp
from routes.adapt_competitor import adapt_competitor_bp
from routes.platform_translator import platform_translator_bp

# Register blueprints
# Auth blueprint (no authentication required for validation endpoint)
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Protected blueprints (authentication required via @require_auth decorator)
app.register_blueprint(daily_inspiration_bp, url_prefix='/api/daily-inspiration')
app.register_blueprint(adapt_competitor_bp, url_prefix='/api/adapt-competitor')
app.register_blueprint(platform_translator_bp, url_prefix='/api/platform-translator')

# This runs the app
if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=5000)