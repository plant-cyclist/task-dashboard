import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginGateProps {
  onSuccess: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Check credentials: user=admin, password=Harter123
    if (trimmedUser === 'admin' && trimmedPass === 'Harter123') {
      try {
        if (rememberMe) {
          localStorage.setItem('labtasks_app_auth', 'authenticated_admin');
          sessionStorage.removeItem('labtasks_app_auth');
        } else {
          sessionStorage.setItem('labtasks_app_auth', 'authenticated_admin');
          localStorage.removeItem('labtasks_app_auth');
        }
      } catch {
        // ignore storage errors
      }
      onSuccess();
    } else {
      setIsSubmitting(false);
      setErrorMessage('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      {/* Background ambient decorative glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-10">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 shadow-xs mb-4 text-cyan-700">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              LabTasks Access
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Dashboard for Tasks & Media Preparation
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin"
                  autoFocus
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4 cursor-pointer"
                />
                <span>Remember on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Subtitle Security Note */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Restricted Laboratory Portal</span>
        </div>
      </div>
    </div>
  );
};
