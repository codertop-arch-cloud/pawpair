import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { UserProfile, Dog } from '../types';

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

  const navItems = [
    { id: 'discover', label: 'Discover Dogs', icon: Compass },
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

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6DFD5] transition-all">
      {/* Top Demo Mode Notice Strip */}
      <div className="bg-[#1B4332] text-[#FAF8F5] text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#52B788] animate-pulse"></span>
          <span>
            <strong>Local Demo Mode Active:</strong> Browser-persistent state & deterministic matching engine.
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-[#D8F3DC]">
            Role: <strong>{currentUser.fullName}</strong> ({currentUser.role.replace('_', ' ')})
          </span>
          <button
            onClick={onResetDemoData}
            title="Reset data store to original seeded sample dogs and applications"
            className="text-xs bg-[#2D6A4F] hover:bg-[#40916C] text-[#FAF8F5] px-2 py-0.5 rounded transition flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleTabClick('discover')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-xl">🐾</span>
            </div>
            <div>
              <span className="text-2xl font-bold font-serif-heading text-[#1B4332] tracking-tight">
                PawPair
              </span>
              <span className="hidden md:inline-block ml-2 text-xs text-[#5C675F] border-l border-[#D5CEBF] pl-2 font-medium">
                Ethical Dog Discovery & Adoption
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
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1B4332] text-[#FAF8F5] shadow-sm'
                      : 'text-[#2D372E] hover:bg-[#EBE5DA] hover:text-[#1B4332]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D8F3DC]' : 'text-[#5C675F]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-[#52B788] text-[#0E291C]'
                          : 'bg-[#BA5536] text-[#FFF3F0]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Saved Dogs & User Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Saved Dogs Button */}
            <button
              onClick={onOpenSavedDogs}
              className="relative p-2 rounded-lg text-[#1B4332] hover:bg-[#EBE5DA] transition"
              title="View Liked / Saved Dogs"
              aria-label="View Liked Dogs"
            >
              <Heart className="w-5 h-5 text-[#BA5536]" fill={savedDogsCount > 0 ? '#BA5536' : 'none'} />
              {savedDogsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#BA5536] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {savedDogsCount}
                </span>
              )}
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 bg-white border border-[#D5CEBF] px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B4332] hover:border-[#1B4332] transition shadow-xs"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#E6DFD5] flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 m-1 text-[#5C675F]" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs leading-none">{currentUser.fullName}</div>
                  <div className="text-[10px] text-[#5C675F] capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E6DFD5] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#F4EFEA]">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-[#8E9991]">
                      Switch Persona (Demo)
                    </p>
                    <p className="text-xs text-[#5C675F] mt-0.5">
                      Toggle roles to test adopter and shelter workflows.
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
                        className={`w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#FAF8F5] transition ${
                          currentUser.id === user.id ? 'bg-[#F4EFEA] font-semibold' : ''
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E6DFD5]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1C241E] truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-[#5C675F] capitalize">
                            {user.role === 'shelter_staff' ? 'Green Paws Shelter Staff' : 'Adopter'}
                          </p>
                        </div>
                        {currentUser.id === user.id && (
                          <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#1B4332] hover:bg-[#EBE5DA] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E6DFD5] px-4 pt-2 pb-4 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#1B4332] text-white'
                    : 'text-[#2D372E] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs bg-[#BA5536] text-white px-2 py-0.5 rounded-full font-bold">
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
