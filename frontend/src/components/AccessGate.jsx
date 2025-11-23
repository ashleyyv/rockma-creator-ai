import { useState, useEffect } from 'react';
import { validateAccessCode, storeAccessCode } from '../utils/auth.js';

export default function AccessGate({ onAuthenticated }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Trigger fade-in animation on mount
  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter an access code');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await validateAccessCode(code.trim());
      
      if (isValid) {
        storeAccessCode(code.trim());
        // Small delay to show success state
        setTimeout(() => {
          onAuthenticated();
        }, 300);
      } else {
        setError('Invalid access code. Please try again.');
        setCode('');
        triggerShake();
      }
    } catch (err) {
      setError('Unable to verify access code. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="access-gate-wrapper min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements for luxury feel */}
      <div className="access-gate-bg-orb access-gate-bg-orb-1"></div>
      <div className="access-gate-bg-orb access-gate-bg-orb-2"></div>
      
      <div className={`w-full max-w-md relative z-10 ${fadeIn ? 'access-gate-fade-in' : 'opacity-0'}`}>
        {/* Logo/Header */}
        <div className="text-center mb-10 access-gate-header">
          <div className="inline-block mb-4 access-gate-logo-glow">
            <h1 className="access-gate-title text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 mb-3">
              RockMa Creator AI
            </h1>
          </div>
          <p className="text-slate-400 text-base font-light tracking-wide">
            Exclusive Access Required
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/70"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
          </div>
        </div>

        {/* Login Card */}
        <div className={`access-gate-card access-gate-card-glow bg-slate-900/40 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl ${shake ? 'access-gate-shake' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Access Code Input */}
            <div>
              <label 
                htmlFor="access-code" 
                className="block text-sm font-medium text-amber-100/90 mb-3 tracking-wide"
              >
                Access Code
              </label>
              <div className="relative group">
                <input
                  id="access-code"
                  type={showPassword ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your access code"
                  className="access-gate-input w-full px-4 py-3.5 pr-12 bg-slate-950/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-4 focus:ring-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  disabled={loading}
                  autoFocus
                  autoComplete="off"
                  aria-label="Enter your access code"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "access-code-error" : undefined}
                />
                {/* Eye Toggle Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-400 transition-colors duration-200 focus:outline-none focus:text-amber-400"
                  aria-label={showPassword ? "Hide access code" : "Show access code"}
                  tabIndex={0}
                  disabled={loading}
                >
                  {showPassword ? (
                    // Eye Slash Icon (hide)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Eye Icon (show)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                id="access-code-error"
                className="access-gate-error bg-red-950/50 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="access-gate-button w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold py-4 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-amber-500/50 relative overflow-hidden group text-base tracking-wide"
              aria-label={loading ? "Verifying access code" : "Submit access code"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="access-gate-spinner w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Enter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {/* Button shine effect */}
              <div className="access-gate-button-shine"></div>
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-500 text-xs text-center font-light tracking-wide leading-relaxed">
              Need access? Contact your administrator
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secured Connection</span>
        </div>
      </div>
    </div>
  );
}

