import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalMessage(null);
    setIsGoogleSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) setLocalMessage(error.message);
    if (error) setIsGoogleSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);

    if (!email || !password) {
      setLocalMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const { error, user } = await signUpWithEmail(email, password);
        if (!error) {
          if (user && user.identities && user.identities.length === 0) {
            setLocalMessage('An account with this email already exists. Please sign in.');
          } else {
            setLocalMessage('Account registered! You can now sign in with your credentials.');
            setIsSignUp(false);
          }
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setLocalMessage(error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-auth-page min-h-screen text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-[720px] px-4 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="font-extrabold tracking-tight text-slate-900 text-2xl">
            FleetOps
          </h1>
          <p className="mt-1 text-sm font-semibold text-blue-600">
            Fleet Management Dashboard
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Secure Operator Gateway • Real-time Telematics
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/90 rounded-none shadow-none p-5 sm:px-8 sm:py-7">
          {/* Toggle between Sign In & Sign Up */}
          <div className="grid grid-cols-2 mb-6 border border-slate-300 bg-slate-100 rounded-none" role="tablist" aria-label="Operator authentication options">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                clearError();
                setLocalMessage(null);
              }}
              role="tab"
              aria-selected={!isSignUp}
              className={`py-3 text-xs font-bold rounded-none border-r border-slate-300 transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-white hover:text-slate-950'
              }`}
            >
              Operator Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                clearError();
                setLocalMessage(null);
              }}
              role="tab"
              aria-selected={isSignUp}
              className={`py-3 text-xs font-bold rounded-none transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-white hover:text-slate-950'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback / Error Notice */}
          {(error || localMessage) && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
                localMessage && (localMessage.includes('registered') || localMessage.includes('filled'))
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {localMessage && (localMessage.includes('registered') || localMessage.includes('filled')) ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{error || localMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="operator@fleetops.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Connecting to Database...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Operator Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4" aria-hidden="true">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Alternative sign in</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full min-h-11 px-4 border border-slate-300 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-800 font-bold text-xs rounded-none transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.1h5.4a4.6 4.6 0 0 1-2 3v3h3.4c2-1.8 3.1-4.5 3.1-7.9Z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.4-3a6 6 0 0 1-9-2l-3.3 2.5A10.2 10.2 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.3 14.6a6 6 0 0 1 0-5.2L3 6.9a10 10 0 0 0 0 10.2l3.3-2.5Z" />
              <path fill="#EA4335" d="M12 5.8c1.6 0 3 .6 4.1 1.6l3.1-3.1A10 10 0 0 0 3 6.9l3.3 2.5A6 6 0 0 1 12 5.8Z" />
            </svg>
            <span>{isGoogleSubmitting ? 'Connecting securely...' : 'Sign in with Google'}</span>
          </button>

        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Connected to Supabase PostgreSQL • Row Level Security Active</span>
        </div>
      </div>
    </div>
  );
};
