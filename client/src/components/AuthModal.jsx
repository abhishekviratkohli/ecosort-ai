import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onSelectDemoUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await api.register({
          name,
          email,
          password,
          institution,
          role: 'citizen'
        });
      } else {
        data = await api.login(email, password);
      }

      if (data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Network error during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="firm-card max-w-md w-full p-6 relative shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            {isRegister ? 'Create EcoSort AI Account' : 'Sign in to EcoSort AI'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRegister ? 'Start tracking your CO₂ footprint and earning Eco-Points.' : 'Access your personal streak, badges, and history.'}
          </p>
        </div>

        {/* 1-Click Quick Demo Personas */}
        <div className="mb-5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            ⚡ Quick Demo Accounts (1-Click Login):
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { onSelectDemoUser('usr_aarav_001'); onClose(); }}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Aarav (Citizen)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">520 pts • 6d streak</div>
            </button>

            <button
              type="button"
              onClick={() => { onSelectDemoUser('usr_priya_002'); onClose(); }}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:border-cyan-500 border border-slate-200 dark:border-slate-800 text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">Priya (Student)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">890 pts • 15d streak</div>
            </button>

            <button
              type="button"
              onClick={() => { onSelectDemoUser('usr_admin_003'); onClose(); }}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:border-purple-500 border border-slate-200 dark:border-slate-800 text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">City Admin</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">MSW Officer</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="firm-input !pl-9 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="firm-input !pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="firm-input !pl-9 text-xs"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus / Housing Society</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Greenwood Campus"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="firm-input !pl-9 text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs font-bold !py-2.5 mt-3"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account & Claim +10 pts' : 'Sign In')}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New user?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
