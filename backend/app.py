from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Initialize the Flask app
app = Flask(__name__)
# Set up CORS to allow our React app (from a different 'origin') to make requests
CORS(app)

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

# Import route modules
from routes.daily_inspiration import daily_inspiration_bp
from routes.adapt_competitor import adapt_competitor_bp
from routes.platform_translator import platform_translator_bp

# Register blueprints
app.register_blueprint(daily_inspiration_bp, url_prefix='/api/daily-inspiration')
app.register_blueprint(adapt_competitor_bp, url_prefix='/api/adapt-competitor')
app.register_blueprint(platform_translator_bp, url_prefix='/api/platform-translator')

# This runs the app
if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=5000)