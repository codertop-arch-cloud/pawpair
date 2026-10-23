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
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  savedDogsCount: number;
  onOpenSavedDogs: () => void;
  onResetDemoData: () => void;
  applicationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  availableUsers,
  onSwitchUser,
  savedDogsCount,
  onOpenSavedDogs,
  onResetDemoData,
  applicationsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
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

  // Close popovers on tab navigation
  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
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
      badge: currentUser.role === 'shelter_staff' ? 'Staff' : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE4DC] transition-colors">
      {/* Subtle Utility Bar */}
      <div className="bg-[#F4EFEA]/80 border-b border-[#EAE4DC]/60 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-[#58625B] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#357457] inline-block"></span>
          <span>
            <strong className="text-[#181F1A] font-semibold">Demo Sandbox:</strong> Persistent local storage active
          </span>
          <span className="hidden md:inline text-[#8B958E]">•</span>
          <span className="hidden md:inline">
            Active Persona: <strong className="text-[#181F1A]">{currentUser.fullName}</strong> ({currentUser.role === 'shelter_staff' ? 'Shelter Director' : 'Adopter'})
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onResetDemoData}
            title="Reset data store to original sample dogs and applications"
            className="text-[11px] font-medium text-[#58625B] hover:text-[#183B2B] flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3 h-3 text-[#8B958E]" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
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

          {/* Desktop Navigation Links */}
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
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#EDF4F0] text-[#183B2B]'
                          : 'bg-[#FAF0EC] text-[#B85438]'
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
            {/* Saved Dogs Button */}
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
                <span className="absolute 0 top-0.5 right-0.5 bg-[#B85438] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedDogsCount}
                </span>
              )}
            </button>

            {/* Persona Switcher Dropdown (Self-contained, closed by default, closes on outside click) */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="btn-persona-switcher"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center space-x-2 bg-white border px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#181F1A] transition shadow-xs ${
                  userDropdownOpen ? 'border-[#183B2B] ring-2 ring-[#183B2B]/10' : 'border-[#EAE4DC] hover:border-[#D5CEBF]'
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#EAE4DC] flex-shrink-0">
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
                    {currentUser.fullName}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8B958E] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EAE4DC] py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-[#F4EFEA]">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#8B958E]">
                      Switch Persona (Role Testing)
                    </p>
                    <p className="text-xs text-[#58625B] mt-0.5">
                      Select a profile to experience adopter vs shelter staff permissions.
                    </p>
                  </div>

                  <div className="py-1">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-[#FAF7F2] transition ${
                          currentUser.id === user.id ? 'bg-[#F4EFEA] font-semibold' : ''
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-[#EAE4DC]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#181F1A] truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-[#58625B] capitalize">
                            {user.role === 'shelter_staff' ? 'Green Paws Shelter Staff' : 'Adopter'}
                          </p>
                        </div>
                        {currentUser.id === user.id && (
                          <ShieldCheck className="w-4 h-4 text-[#357457]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="px-4 py-2 border-t border-[#F4EFEA] bg-[#FAF7F2]/50 text-[10px] text-[#8B958E] text-center">
                    Press <kbd className="bg-white border border-[#EAE4DC] px-1 py-0.5 rounded text-[9px]">Esc</kbd> or click outside to dismiss
                  </div>
                </div>
              )}
            </div>

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
        </div>
      )}
    </header>
  );
};
