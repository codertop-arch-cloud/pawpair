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
  Check,
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

  // Close persona dropdown and mobile menu whenever active route changes
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [currentTab]);

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
                type="button"
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
                aria-controls="persona-dropdown-menu"
                aria-label="Demo persona switcher"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center space-x-2 bg-white border px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#181F1A] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
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
                <ChevronDown className={`w-3.5 h-3.5 text-[#8B958E] transition-transform duration-150 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div
                  id="persona-dropdown-menu"
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-lg border border-[#EAE4DC] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150 max-h-[calc(100vh-5rem)] overflow-y-auto"
                >
                  {/* Demo-only Disclaimer Header */}
                  <div className="px-2.5 py-2 border-b border-[#F2ECE4] mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B958E]">
                        Demo Persona Switcher
                      </span>
                      <span className="text-[9px] font-semibold bg-[#FAF0EC] text-[#B85438] px-1.5 py-0.5 rounded border border-[#FCE8E2]">
                        Demo Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-[#58625B] mt-1 leading-snug">
                      Simulate adopter and shelter director workflows without authenticating.
                    </p>
                  </div>

                  {/* Persona Options List */}
                  <div className="space-y-1" role="none">
                    {availableUsers.map((user) => {
                      const isActive = currentUser.id === user.id;
                      return (
                        <button
                          key={user.id}
                          role="menuitem"
                          onClick={() => {
                            onSwitchUser(user);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 text-left rounded-xl flex items-center space-x-2.5 transition text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                            isActive
                              ? 'bg-[#EDF4F0] border border-[#D8F3DC] font-semibold text-[#183B2B]'
                              : 'hover:bg-[#FAF7F2] text-[#181F1A] border border-transparent'
                          }`}
                        >
                          <img
                            src={user.avatarUrl}
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
                              {user.role === 'shelter_staff' ? 'Green Paws Shelter Director' : 'Prospective Adopter'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Secondary Utility Action: Reset Sample Data */}
                  <div className="mt-2 pt-2 border-t border-[#F2ECE4] px-1 flex items-center justify-between text-[11px] text-[#8B958E]">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onResetDemoData();
                      }}
                      className="hover:text-[#B85438] flex items-center space-x-1.5 transition text-[11px] font-medium py-1 px-1.5 rounded-lg hover:bg-[#FAF0EC]/60"
                      title="Restore original seed dogs and applications"
                    >
                      <RotateCcw className="w-3 h-3 text-[#8B958E]" />
                      <span>Reset Sample Data</span>
                    </button>
                    <span className="text-[10px] text-[#8B958E]">Esc to close</span>
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
