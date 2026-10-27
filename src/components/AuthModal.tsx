import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile, Shelter } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  availableUsers: UserProfile[];
  shelters: Shelter[];
  onLogin: (email: string, password?: string) => { success: boolean; error?: string };
  onRegister: (params: {
    fullName: string;
    email: string;
    password?: string;
    role: 'adopter' | 'shelter_staff';
    city?: string;
    phone?: string;
    shelterId?: string;
  }) => { success: boolean; error?: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  availableUsers,
  shelters,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'adopter' | 'shelter_staff'>('adopter');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Seattle, WA');
  const [regPhone, setRegPhone] = useState('(206) 555-0199');
  const [regShelterId, setRegShelterId] = useState(shelters[0]?.id || 'shelter-green-paws');

  // Reset errors when mode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const result = onLogin(loginEmail, loginPassword);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to sign in.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const result = onRegister({
      fullName: regFullName,
      email: regEmail,
      password: regPassword || undefined,
      role: regRole,
      city: regCity,
      phone: regPhone,
      shelterId: regRole === 'shelter_staff' ? regShelterId : undefined,
    });

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    const result = onLogin(user.email, user.password);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to sign in.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EAE4DC] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header Tabs */}
        <div className="flex border-b border-[#EAE4DC] bg-[#FAF7F2] relative">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition border-b-2 ${
              mode === 'login'
                ? 'border-[#183B2B] text-[#183B2B] bg-white'
                : 'border-transparent text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition border-b-2 ${
              mode === 'register'
                ? 'border-[#183B2B] text-[#183B2B] bg-white'
                : 'border-transparent text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            Create New Profile
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-[#8B958E] hover:text-[#181F1A] transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title and Context */}
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold font-serif-heading text-[#181F1A]">
              {mode === 'login' ? 'Welcome Back to PawPair' : 'Create Your PawPair Profile'}
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              {mode === 'login'
                ? 'Sign in to access your saved dogs, adoption applications, and shelter tools.'
                : 'Join as an adopter seeking companions or as shelter staff managing rescues.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-3 rounded-xl flex items-start space-x-2 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. maya.lin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#181F1A]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#8B958E]">Optional for existing profiles</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password (optional)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B958E] hover:text-[#181F1A]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Sign In to Account
              </button>

              {/* Quick Profile Selectors for Fast Demonstration */}
              <div className="pt-3 border-t border-[#F2ECE4] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B958E] block">
                  Quick Sign-In with Existing Accounts:
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className="w-full p-2 rounded-xl text-left border border-[#EAE4DC] hover:border-[#183B2B] hover:bg-[#FAF7F2] flex items-center space-x-2.5 transition text-xs group"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-6 h-6 rounded-full object-cover border border-[#EAE4DC] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#181F1A] group-hover:text-[#183B2B] truncate">
                            {user.fullName}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white border border-[#EAE4DC] text-[#58625B]">
                            {user.role === 'shelter_staff' ? 'Shelter Director' : 'Adopter'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8B958E] truncate block">
                          {user.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#181F1A] mb-1.5">
                  Select Profile Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('adopter')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      regRole === 'adopter'
                        ? 'border-[#183B2B] bg-[#EDF4F0] ring-1 ring-[#183B2B]'
                        : 'border-[#EAE4DC] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Heart className="w-3.5 h-3.5 text-[#B85438]" />
                      <span className="text-xs font-bold text-[#181F1A]">Adopter</span>
                    </div>
                    <span className="text-[10px] text-[#58625B] leading-tight">
                      Seeking companion dogs & matching
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('shelter_staff')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      regRole === 'shelter_staff'
                        ? 'border-[#183B2B] bg-[#EDF4F0] ring-1 ring-[#183B2B]'
                        : 'border-[#EAE4DC] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-[#183B2B]" />
                      <span className="text-xs font-bold text-[#181F1A]">Shelter Staff</span>
                    </div>
                    <span className="text-[10px] text-[#58625B] leading-tight">
                      Manage listings & applications
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Rivera"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jordan.rivera@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B958E] hover:text-[#181F1A]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* City and Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                    City, State
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                    <input
                      type="text"
                      placeholder="Seattle, WA"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B958E]" />
                    <input
                      type="text"
                      placeholder="(206) 555-0199"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B] transition"
                    />
                  </div>
                </div>
              </div>

              {/* If Shelter Staff, select Shelter */}
              {regRole === 'shelter_staff' && (
                <div>
                  <label className="block text-xs font-semibold text-[#181F1A] mb-1">
                    Shelter Affiliation
                  </label>
                  <select
                    value={regShelterId}
                    onChange={(e) => setRegShelterId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                  >
                    {shelters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}, {s.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Create Profile & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
