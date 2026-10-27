import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  SlidersHorizontal,
  FileText,
  Calendar,
  Building2,
  Heart,
  User,
  RotateCcw,
  Menu,
  X,
  ChevronDown,
  Check,
  ArrowLeft,
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile | null;
  /** Full list of demo personas for the demo-tools panel */
  demoUsers: UserProfile[];
  savedDogsCount: number;
  onOpenSavedDogs: () => void;
  onResetDemoData: () => void;
  applicationsCount: number;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  /** Switch to a specific user directly (demo use only) */
  onSwitchDemoUser: (user: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  demoUsers,
  savedDogsCount,
  onOpenSavedDogs,
  onResetDemoData,
  applicationsCount,
  onOpenAuth,
  onLogout,
  onSwitchDemoUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
        setShowDemoPanel(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
        setShowDemoPanel(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [userDropdownOpen]);

  // Close everything whenever route changes
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setShowDemoPanel(false);
  }, [currentTab]);

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowDemoPanel(false);
  };

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'matching', label: 'Lifestyle Match', icon: SlidersHorizontal },
    {
      id: 'applications',
      label: 'My Applications',
      icon: FileText,
      badge: applicationsCount > 0 ? applicationsCount : undefined,
    },
    { id: 'visits', label: 'Group Visits', icon: Calendar },
    {
      id: 'shelter',
      label: 'Shelter Portal',
      icon: Building2,
      badge: currentUser?.role === 'shelter_staff' ? 'Staff' : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE4DC] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('discover')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#183B2B] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <span className="text-lg">🐾</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-serif-heading text-[#183B2B] tracking-tight">
                PawPair
              </span>
              <span className="hidden xl:inline-block ml-2 text-[11px] uppercase tracking-wider text-[#8B958E] border-l border-[#EAE4DC] pl-2 font-medium">
                Ethical Adoption
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#183B2B] text-white shadow-xs'
                      : 'text-[#58625B] hover:text-[#181F1A] hover:bg-[#F2ECE4]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EDF4F0]' : 'text-[#8B958E]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#EDF4F0] text-[#183B2B]' : 'bg-[#FAF0EC] text-[#B85438]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Saved Dogs Button — only when logged in */}
            {currentUser && (
              <button
                onClick={onOpenSavedDogs}
                className="relative p-2 rounded-xl text-[#58625B] hover:text-[#181F1A] hover:bg-[#F2ECE4] transition"
                title="Saved dogs"
                aria-label="View Saved Dogs"
              >
                <Heart
                  className="w-4 h-4 text-[#B85438]"
                  fill={savedDogsCount > 0 ? '#B85438' : 'none'}
                />
                {savedDogsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#B85438] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {savedDogsCount}
                  </span>
                )}
              </button>
            )}

            {/* LOGGED-IN: User dropdown */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="btn-user-menu"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={userDropdownOpen}
                  aria-controls="user-dropdown-menu"
                  aria-label="Account menu"
                  onClick={() => {
                    setUserDropdownOpen((v) => !v);
                    if (userDropdownOpen) setShowDemoPanel(false);
                  }}
                  className={`flex items-center space-x-2 bg-white border px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#181F1A] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                    userDropdownOpen
                      ? 'border-[#183B2B] ring-2 ring-[#183B2B]/10'
                      : 'border-[#EAE4DC] hover:border-[#D5CEBF]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#EAE4DC] flex-shrink-0 flex items-center justify-center">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#58625B]" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-[11px] leading-tight text-[#181F1A]">
                      {currentUser.fullName.split(' ')[0]}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8B958E] transition-transform duration-150 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-lg border border-[#EAE4DC] p-2.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150 max-h-[calc(100vh-5rem)] overflow-y-auto"
                  >
                    {!showDemoPanel ? (
                      /* === PANEL 1: ACCOUNT === */
                      <div className="space-y-2">
                        {/* Active User Card */}
                        <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC] flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#EAE4DC] flex-shrink-0 flex items-center justify-center">
                            {currentUser.avatarUrl ? (
                              <img
                                src={currentUser.avatarUrl}
                                alt={currentUser.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-[#58625B]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="font-bold text-xs text-[#181F1A] truncate font-serif-heading">
                                {currentUser.fullName}
                              </h3>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                  currentUser.role === 'shelter_staff'
                                    ? 'bg-[#EDF4F0] text-[#183B2B] border-[#D8F3DC]'
                                    : 'bg-[#FAF0EC] text-[#B85438] border-[#FCE8E2]'
                                }`}
                              >
                                {currentUser.role === 'shelter_staff' ? 'Staff' : 'Adopter'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#58625B] truncate mt-0.5">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>

                        {/* Nav links */}
                        <div className="space-y-1" role="none">
                          <button
                            role="menuitem"
                            onClick={() => handleTabClick('applications')}
                            className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-medium text-[#181F1A] hover:bg-[#FAF7F2] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                          >
                            <div className="flex items-center space-x-2.5">
                              <FileText className="w-4 h-4 text-[#58625B]" />
                              <span>My Applications</span>
                            </div>
                            {applicationsCount > 0 && (
                              <span className="text-[10px] font-bold bg-[#FAF0EC] text-[#B85438] px-1.5 py-0.5 rounded-full">
                                {applicationsCount}
                              </span>
                            )}
                          </button>

                          <button
                            role="menuitem"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenSavedDogs();
                            }}
                            className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-medium text-[#181F1A] hover:bg-[#FAF7F2] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Heart className="w-4 h-4 text-[#B85438]" />
                              <span>Saved Dogs</span>
                            </div>
                            {savedDogsCount > 0 && (
                              <span className="text-[10px] font-bold bg-[#FAF0EC] text-[#B85438] px-1.5 py-0.5 rounded-full">
                                {savedDogsCount}
                              </span>
                            )}
                          </button>

                          {currentUser.role === 'shelter_staff' ? (
                            <button
                              role="menuitem"
                              onClick={() => handleTabClick('shelter')}
                              className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-medium text-[#181F1A] hover:bg-[#FAF7F2] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                            >
                              <div className="flex items-center space-x-2.5">
                                <Building2 className="w-4 h-4 text-[#183B2B]" />
                                <span>Shelter Management Portal</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8B958E]" />
                            </button>
                          ) : (
                            <button
                              role="menuitem"
                              onClick={() => handleTabClick('matching')}
                              className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-medium text-[#181F1A] hover:bg-[#FAF7F2] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                            >
                              <div className="flex items-center space-x-2.5">
                                <SlidersHorizontal className="w-4 h-4 text-[#183B2B]" />
                                <span>Lifestyle Match Preferences</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8B958E]" />
                            </button>
                          )}
                        </div>

                        {/* Demo Tools entry */}
                        {demoUsers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#F2ECE4]">
                            <button
                              id="btn-open-demo-tools"
                              type="button"
                              onClick={() => setShowDemoPanel(true)}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold text-[#183B2B] bg-[#EDF4F0] hover:bg-[#E3EFE8] border border-[#D8F3DC] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                            >
                              <div className="flex items-center space-x-2">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-[#357457]" />
                                <span>Demo Tools / Switch Persona</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] font-bold bg-white text-[#183B2B] px-1.5 py-0.5 rounded border border-[#D8F3DC]">
                                  Demo
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#357457]" />
                              </div>
                            </button>
                          </div>
                        )}

                        {/* Sign Out */}
                        <div className="pt-2 border-t border-[#F2ECE4]">
                          <button
                            role="menuitem"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onLogout();
                            }}
                            className="w-full px-2.5 py-2 rounded-xl text-left flex items-center space-x-2.5 text-xs font-medium text-[#B85438] hover:bg-[#FAF0EC] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85438]"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* === PANEL 2: DEMO PERSONA SWITCHER === */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4]">
                          <button
                            id="btn-back-to-account"
                            type="button"
                            onClick={() => setShowDemoPanel(false)}
                            className="text-xs font-semibold text-[#58625B] hover:text-[#181F1A] flex items-center space-x-1.5 transition py-1 px-1.5 rounded-lg hover:bg-[#FAF7F2]"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Account</span>
                          </button>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FAF0EC] text-[#B85438] px-1.5 py-0.5 rounded border border-[#FCE8E2]">
                            Evaluation Demo
                          </span>
                        </div>

                        <div className="px-1">
                          <div className="flex items-center space-x-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#183B2B]" />
                            <h3 className="text-xs font-bold text-[#181F1A]">Demo Persona Switcher</h3>
                          </div>
                          <p className="text-[11px] text-[#58625B] mt-1 leading-snug">
                            Simulate adopter vs shelter director workflows. Not production authentication.
                          </p>
                        </div>

                        <div className="space-y-1 pt-1" role="none">
                          {demoUsers.map((user) => {
                            const isActive = currentUser.id === user.id;
                            return (
                              <button
                                key={user.id}
                                role="menuitem"
                                onClick={() => {
                                  onSwitchDemoUser(user);
                                  setUserDropdownOpen(false);
                                  setShowDemoPanel(false);
                                }}
                                className={`w-full px-2.5 py-2 text-left rounded-xl flex items-center space-x-2.5 transition text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                                  isActive
                                    ? 'bg-[#EDF4F0] border border-[#D8F3DC] font-semibold text-[#183B2B]'
                                    : 'hover:bg-[#FAF7F2] text-[#181F1A] border border-transparent'
                                }`}
                              >
                                <img
                                  src={user.avatarUrl || ''}
                                  alt={user.fullName}
                                  className="w-7 h-7 rounded-full object-cover border border-[#EAE4DC] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-semibold text-xs text-[#181F1A] truncate">
                                      {user.fullName}
                                    </p>
                                    {isActive && (
                                      <span className="text-[10px] font-bold text-[#183B2B] bg-white border border-[#D8F3DC] px-1.5 py-0.5 rounded flex items-center space-x-1 flex-shrink-0 shadow-2xs">
                                        <Check className="w-2.5 h-2.5 text-[#357457] stroke-[3]" />
                                        <span>Active</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#58625B] truncate mt-0.5">
                                    {user.role === 'shelter_staff'
                                      ? 'Shelter Staff'
                                      : 'Prospective Adopter'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-2 pt-2 border-t border-[#F2ECE4] px-1 flex items-center justify-between text-[11px] text-[#8B958E]">
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setShowDemoPanel(false);
                              onResetDemoData();
                            }}
                            className="hover:text-[#B85438] flex items-center space-x-1.5 transition text-[11px] font-medium py-1 px-1.5 rounded-lg hover:bg-[#FAF0EC]/60"
                          >
                            <RotateCcw className="w-3 h-3 text-[#8B958E]" />
                            <span>Reset Sample Data</span>
                          </button>
                          <span className="text-[10px] text-[#8B958E]">Esc to close</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED-OUT: Sign In + Register buttons */
              <div className="flex items-center space-x-2">
                <button
                  id="btn-sign-in"
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#183B2B] border border-[#D5CEBF] rounded-xl hover:bg-[#F2ECE4] transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  id="btn-register"
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#183B2B] hover:bg-[#24533E] rounded-xl transition shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create Profile</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#181F1A] hover:bg-[#F2ECE4] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE4DC] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#183B2B] text-white'
                    : 'text-[#58625B] hover:bg-[#FAF7F2] hover:text-[#181F1A]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] bg-[#FAF0EC] text-[#B85438] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#F2ECE4] space-y-1">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#B85438] hover:bg-[#FAF0EC] transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.fullName.split(' ')[0]})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#181F1A] hover:bg-[#FAF7F2] transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#183B2B] hover:bg-[#24533E] transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
