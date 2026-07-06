import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Loader2, Fingerprint } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Interaction States
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'form' | 'auth_sim'>('form');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Email Validation Helper
  const validateEmail = (val: string) => {
    if (!val) {
      return 'Email is required to access the boardroom';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      return 'Please enter a valid cryptographic email';
    }
    return '';
  };

  // Password Validation Helper
  const validatePassword = (val: string) => {
    if (!val) {
      return 'Founder security token is required';
    }
    if (val.length < 8) {
      return 'Security token must be at least 8 characters';
    }
    return '';
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(forgotEmail);
    if (error) {
      setEmailError(error);
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSent(true);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    setEmailError(eErr);
    setPasswordError(pErr);
    
    if (eErr || pErr) {
      return;
    }

    // Enter simulated cryptographic token validation step
    setLoginStep('auth_sim');
    setIsLoading(true);
    
    // Simulate multi-factor handshake
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 2400);
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-black text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* Background Graphic Lines - Apple/Linear inspired grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Floating subtle gradients */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-600/10 blur-[90px] pointer-events-none" />

      {/* Standalone Login Panel */}
      <div className="w-full max-w-md px-6 relative z-10">
        
        {/* Top Header Logo & Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-extrabold tracking-tighter text-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-4 overflow-hidden"
          >
            O
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent animate-pulse-slow" />
          </motion.div>
          
          <h1 className="text-xl font-bold tracking-tight text-white">OS</h1>
          <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-widest">Operator Portal</p>
        </div>

        {/* Transition Switch: Forms vs Simulated Handshake */}
        <AnimatePresence mode="wait">
          {loginStep === 'form' ? (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-xl p-8 shadow-2xl relative border border-zinc-900 bg-zinc-950/60"
            >
              {/* Subtle top glow ring inside card */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              
              <div className="mb-6">
                <h2 className="text-md font-semibold text-white">Founder Authentication</h2>
                <p className="text-xs text-zinc-400 mt-1">Unlock the secure boardroom & manage your AI executives.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Founder Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`w-full bg-black/60 border ${
                        emailError ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-850 focus:border-zinc-700'
                      } rounded-lg py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-colors duration-150`}
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center text-[10px] text-red-400 mt-1">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Security Key</label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      className={`w-full bg-black/60 border ${
                        passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-850 focus:border-zinc-700'
                      } rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-colors duration-150`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-550 hover:text-zinc-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="flex items-center text-[10px] text-red-400 mt-1">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                {/* Remember & Forgot Options */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-black border-zinc-800 text-white focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer accent-white"
                    />
                    <span>Remember terminal session</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSent(false);
                      setForgotEmail('');
                    }}
                    className="text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                  >
                    Forgot Key?
                  </button>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-zinc-200 text-black font-semibold text-sm py-2.5 rounded-lg transition-colors mt-4"
                >
                  <Fingerprint className="h-4 w-4" />
                  <span>Authenticate Operator</span>
                </button>
              </form>
            </motion.div>
          ) : (
            /* Cryptographic loading simulation */
            <motion.div
              key="auth-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center font-mono space-y-6 min-h-[300px]"
            >
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">CONNECTING SECURE TUNNEL...</p>
                <div className="text-[10px] text-zinc-500 space-y-1">
                  <p>[ok] operator signature verified</p>
                  <p>[sync] decrypting boardroom partition</p>
                  <p className="text-emerald-500">[access] boarding clearance granted</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System copyright footer */}
        <p className="text-center text-[10px] text-zinc-600 font-mono mt-8">
          OS SECURE GATEWAY v1.0.0
        </p>
      </div>

      {/* Forgot Password Modal (Apple design) */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl z-10"
            >
              {!forgotSent ? (
                <>
                  <h3 className="text-md font-semibold text-white">Security Key Recovery</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">
                    Enter your email. A recovery vector link will be generated for your secure node.
                  </p>
                  
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Founder Email</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="founder@company.com"
                        className="w-full bg-black/60 border border-zinc-850 focus:border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                      >
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        <span>Send Vector Link</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold text-white">Recovery Link Dispatched</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Secure instructions sent to <span className="font-mono text-zinc-200">{forgotEmail}</span>. Verify your identity link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-lg transition-colors"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default Login;
