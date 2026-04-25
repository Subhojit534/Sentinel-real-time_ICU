'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, UserPlus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Dark background hex for <option> elements (Tailwind classes don't apply to options)
const SELECT_BG = '#141b2d';
const SELECT_COLOR = '#e2e8f0';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  hospital: string;
  ward: string;
  licenseNumber: string;
  agreeTerms: boolean;
}

interface Props {
  onSwitchToLogin: () => void;
}

// Backend: POST /api/auth/register with full clinician profile
export default function SignUpForm({ onSwitchToLogin }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([
    { id: 'hosp-1', name: 'Metro Health Center' },
    { id: 'hosp-2', name: 'City General Hospital' },
  ]);
  const [wards, setWards] = useState<{ id: string; name: string }[]>([
    { id: 'ward-icu-a', name: 'ICU Alpha' },
    { id: 'ward-icu-b', name: 'ICU Beta' },
    { id: 'ward-icu-c', name: 'ICU Gamma' },
    { id: 'ward-icu-d', name: 'Cardiac ICU' },
    { id: 'ward-icu-e', name: 'Neuro ICU' },
  ]);
  const router = useRouter();

  // Load hospitals and wards from Supabase
  useEffect(() => {
    if (!supabase) return;
    supabase.from('hospitals').select('id, name').then(({ data }) => {
      if (data && data.length > 0) setHospitals(data);
    });
    supabase.from('wards').select('id, name').then(({ data }) => {
      if (data && data.length > 0) setWards(data);
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');
  const role = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    if (supabase) {
      const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
      // Map roles to what the schema expects
      let mappedRole = 'doctor';
      if (data.role === 'admin') mappedRole = 'admin';
      if (data.role.includes('nurse')) mappedRole = 'nurse';

      const { error } = await supabase.from('users').insert({
        id,
        name: `${data.firstName} ${data.lastName}`,
        role: mappedRole,
        hospital_id: data.hospital || 'hosp-1',
        ward_id: data.ward || 'ward-icu-a',
        email: data.email,
        password: data.password, // plain text for demo purposes
        license_number: data.licenseNumber || null,
      });

      if (error) {
        toast.error(`Error creating account: ${error.message}`);
        setIsLoading(false);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 1400));
    }
    
    toast.success('Account created successfully! You can now sign in.');
    setIsLoading(false);
    setTimeout(() => onSwitchToLogin(), 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Request ICU Access</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your clinician profile. Access is granted after verification by your ICU administrator.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold text-foreground mb-1.5">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Priya"
              {...register('firstName', { required: 'Required' })}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all ${errors.firstName ? 'border-red-500/50' : 'border-border'}`}
            />
            {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-semibold text-foreground mb-1.5">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Sharma"
              {...register('lastName', { required: 'Required' })}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all ${errors.lastName ? 'border-red-500/50' : 'border-border'}`}
            />
            {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold text-foreground mb-1.5">
            Institutional Email
          </label>
          <p className="text-[11px] text-muted-foreground mb-1.5">Use your hospital-issued email address for verification</p>
          <input
            id="signup-email"
            type="email"
            placeholder="yourname@hospital.org"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all ${errors.email ? 'border-red-500/50' : 'border-border'}`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-xs font-semibold text-foreground mb-1.5">Clinical Role</label>
          <div className="relative">
            <select
              id="role"
              {...register('role', { required: 'Select your role' })}
              style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}
              className={`w-full appearance-none border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all cursor-pointer pr-8 ${errors.role ? 'border-red-500/50' : 'border-border'}`}
            >
              <option value="" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Select role...</option>
              <option value="doctor" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Attending Physician</option>
              <option value="registrar" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Senior Registrar</option>
              <option value="nurse" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>ICU Nurse</option>
              <option value="nurse_charge" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Charge Nurse</option>
              <option value="admin" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>ICU Administrator</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>}
        </div>

        {/* License number — only for clinical roles */}
        {role && role !== 'admin' && (
          <div>
            <label htmlFor="licenseNumber" className="block text-xs font-semibold text-foreground mb-1.5">
              Medical Registration / License Number
            </label>
            <p className="text-[11px] text-muted-foreground mb-1.5">Required for clinical role verification</p>
            <input
              id="licenseNumber"
              type="text"
              placeholder="e.g. MCI-2019-12345"
              {...register('licenseNumber', { required: role !== 'admin' ? 'License number required for clinical roles' : false })}
              className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all font-mono ${errors.licenseNumber ? 'border-red-500/50' : 'border-border'}`}
            />
            {errors.licenseNumber && <p className="text-xs text-red-400 mt-1">{errors.licenseNumber.message}</p>}
          </div>
        )}

        {/* Hospital + Ward */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hospital" className="block text-xs font-semibold text-foreground mb-1.5">Hospital</label>
            <div className="relative">
              <select
                id="hospital"
                {...register('hospital', { required: 'Select hospital' })}
                style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}
                className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all cursor-pointer pr-7 ${errors.hospital ? 'border-red-500/50' : 'border-border'}`}
              >
                <option value="" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Select...</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id} style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>{h.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            {errors.hospital && <p className="text-xs text-red-400 mt-1">{errors.hospital.message}</p>}
          </div>
          <div>
            <label htmlFor="ward" className="block text-xs font-semibold text-foreground mb-1.5">Primary Ward</label>
            <div className="relative">
              <select
                id="ward"
                {...register('ward', { required: 'Select ward' })}
                style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}
                className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all cursor-pointer pr-7 ${errors.ward ? 'border-red-500/50' : 'border-border'}`}
              >
                <option value="" style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>Select...</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id} style={{ backgroundColor: SELECT_BG, color: SELECT_COLOR }}>{w.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            {errors.ward && <p className="text-xs text-red-400 mt-1">{errors.ward.message}</p>}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
          <p className="text-[11px] text-muted-foreground mb-1.5">Minimum 8 characters, at least one uppercase and one number</p>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters required' },
                pattern: { value: /^(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase letter and number' },
              })}
              className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all ${errors.password ? 'border-red-500/50' : 'border-border'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-all ${errors.confirmPassword ? 'border-red-500/50' : 'border-border'}`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <input
            id="agreeTerms"
            type="checkbox"
            {...register('agreeTerms', { required: 'You must agree to the terms to continue' })}
            className="accent-cyan-500 w-3.5 h-3.5 mt-0.5 cursor-pointer flex-shrink-0"
          />
          <label htmlFor="agreeTerms" className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed">
            I agree to the{' '}
            <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">Clinical Data Terms of Use</span>
            {' '}and{' '}
            <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">HIPAA Privacy Policy</span>.
            I confirm this account will be used solely for clinical monitoring purposes.
          </label>
        </div>
        {errors.agreeTerms && <p className="text-xs text-red-400">{errors.agreeTerms.message}</p>}

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
              Submitting request...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Submit Access Request
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-muted-foreground">
          Already have access?{' '}
          <button onClick={onSwitchToLogin} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}