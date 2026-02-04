import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGoogleLogin } from '@react-oauth/google';

const AuthModal = () => {
  const { authMode, closeAuthModal, toggleAuthMode, login, signup, googleLogin, isLoading, error } = useAuthStore();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => googleLogin(codeResponse.code),
    flow: 'auth-code',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Password Validation on Signup
    if (!isLogin) {
      const pwd = formData.password;
      if (pwd.length < 8) {
        setValidationError("Password must be at least 8 characters");
        return;
      }
      if (pwd.length > 72) {
        setValidationError("Password is too long");
        return;
      }
      // Regex: At least one upper, one lower, one number, one special
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
      if (!strongPasswordRegex.test(pwd)) {
        setValidationError("Password must include uppercase, lowercase, number, and special character");
        return;
      }
    }

    if (authMode === 'login') {
      await login(formData.email, formData.password);
    } else {
      await signup(formData.email, formData.password);
    }
  };

  const isLogin = authMode === 'login';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 lg:p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X size={20} className="text-dark-muted" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-heading font-bold text-2xl text-dark-text mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-dark-muted">
            {isLogin
              ? 'Sign in to continue to Crixen'
              : 'Start your free trial today'}
          </p>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error || validationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-dark-text mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
                />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-dark-silver/30 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-dark-text mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
              />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-dark-silver/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-dark-silver/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/[0.05] rounded transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-dark-muted" />
                ) : (
                  <Eye size={18} className="text-dark-muted" />
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/[0.15] bg-white/[0.05] text-dark-silver focus:ring-dark-silver/30"
                />
                <span className="text-sm text-dark-muted">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-dark-silver hover:text-dark-text transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
            ) : isLogin ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-dark-muted uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => handleGoogleLogin()} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="text-dark-muted"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="text-dark-muted"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                className="text-dark-muted"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                className="text-dark-muted"
              />
            </svg>
            <span className="text-sm text-dark-text">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                className="text-dark-muted"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            <span className="text-sm text-dark-text">GitHub</span>
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-dark-muted mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={toggleAuthMode}
            className="text-dark-silver hover:text-dark-text transition-colors font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
