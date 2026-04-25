'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  badge: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'Doctor', email: 'priya.sharma@sentinel.icu', password: 'Sentinel@ICU2026', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  { role: 'Nurse', email: 'kavita.rao@sentinel.icu', password: 'Sentinel@ICU2026', badge: 'bg-green-500/15 text-green-400 border-green-500/25' },
  { role: 'Admin', email: 'admin@sentinel.icu', password: 'Sentinel@ICU2026', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
];

// Backend: replace with JWT auth endpoint POST /api/auth/login
function validateCredentials(email: string, password: string): boolean {
  return DEMO_CREDENTIALS.some((c) => c.email === email && c.password === password);
}

interface Props {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({ defaultValues: { remember: false } });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // Backend: POST /api/auth/login with { email, password }
    await new Promise((r) => setTimeout(r, 1200));
    if (!validateCredentials(data.email, data.password)) {
      setError('root', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      setIsLoading(false);
      return;
    }
    toast.success('Signed in successfully. Loading dashboard...');
    await new Promise((r) => setTimeout(r, 600));
    router.push('/icu-monitoring-dashboard');
  };

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <AppLogo size={32} />
        <span className="text-base font-bold text-foreground">ProjectSentinel</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to access your ICU monitoring dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Root error */}
        {errors.root && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-lg">
            <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{errors.root.message}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-foreground mb-1.5">
            Institutional Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="yourname@hospital.icu"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 focus:bg-white/8
              ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-cyan-500/50'}`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
              Password
            </label>
            <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 focus:bg-white/8
                ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-cyan-500/50'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            {...register('remember')}
            className="accent-cyan-500 w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
            Keep me signed in on this device
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-background font-semibold text-sm rounded-xl transition-all duration-150 active:scale-[0.98]"
          style={{ minHeight: '44px' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Sign In to Sentinel
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-muted-foreground">
          New to ProjectSentinel?{' '}
          <button onClick={onSwitchToSignup} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Request access
          </button>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 border border-border/60 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-white/3 border-b border-border/60 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Demo Accounts — Click to autofill</p>
          <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-border">sandbox</span>
        </div>
        <div className="divide-y divide-border/40">
          {DEMO_CREDENTIALS.map((cred) => (
            <div
              key={`demo-${cred.role.toLowerCase()}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer group"
              onClick={() => autofill(cred)}
            >
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${cred.badge} flex-shrink-0 w-14 text-center`}>
                {cred.role}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-foreground truncate">{cred.email}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{cred.password.replace(/./g, '•').slice(0, 12)}••</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(cred.email, `${cred.role}-email`); }}
                  title="Copy email"
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  {copiedField === `${cred.role}-email` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <span className="text-[10px] text-cyan-400 font-medium">Use</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}