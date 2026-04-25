'use client';
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthScreen() {
  // 'landing' shows the marketing text, 'auth' shows the login/signup forms
  const [view, setView] = useState<'landing' | 'auth'>('landing');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel: dynamically toggles between landing marketing and auth forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 min-h-screen overflow-y-auto z-10 bg-background relative sm:px-12 lg:px-16 xl:px-24">
        
        {view === 'landing' ? (
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-semibold tracking-wider uppercase border rounded-full bg-blue-900/20 border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              Decentralized ICU Platform
            </div>
            
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight leading-[1.1] lg:text-6xl xl:text-7xl text-foreground">
              Next-Generation <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400">Patient Monitoring</span>
            </h1>
            
            <p className="max-w-lg mb-10 text-lg font-light leading-relaxed text-muted-foreground">
              Project Sentinel provides decentralized, real-time monitoring with AI-driven early warning detection. Built for clinical teams to stay ahead of patient deterioration using highly responsive interactive interfaces.
            </p>
            
            <button 
              onClick={() => setView('auth')}
              className="w-full sm:w-auto px-8 py-4 font-semibold text-white transition-all rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4),inset_0_0_10px_rgba(255,255,255,0.1)] bg-gradient-to-br from-indigo-600 to-blue-500 hover:shadow-[0_0_35px_rgba(79,70,229,0.6),inset_0_0_15px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-white/5 border border-border rounded-xl p-1 mb-8">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'login' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/25' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'signup' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/25' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <LoginForm onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignUpForm onSwitchToLogin={() => setMode('login')} />
            )}
            
            <button 
              onClick={() => setView('landing')}
              className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-full"
            >
              ← Back to home
            </button>
          </div>
        )}
      </div>

      {/* Brand panel (Right side) containing the Cube */}
      <AuthBrandPanel />
    </div>
  );
}