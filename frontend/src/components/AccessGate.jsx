import { useState } from 'react';
import { validateAccessCode, storeAccessCode } from '../utils/auth.js';

export default function AccessGate({ onAuthenticated }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter an access code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await validateAccessCode(code.trim());
      
      if (isValid) {
        storeAccessCode(code.trim());
        onAuthenticated();
      } else {
        setError('Invalid access code. Please try again.');
        setCode('');
      }
    } catch (err) {
      setError('Unable to verify access code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">
            RockMa Creator AI
          </h1>
          <p className="text-gray-400">
            Enter your access code to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Access Code Input */}
            <div>
              <label 
                htmlFor="access-code" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Access Code
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ROCKMA-LOVE-2025"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </form>

          {/* Help Text */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Contact your administrator if you need an access code
          </p>
        </div>
      </div>
    </div>
  );
}

