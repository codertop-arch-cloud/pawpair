import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  X,
  RotateCcw,
  Sparkles,
  Search,
  LayoutGrid,
  Layers,
  ChevronRight,
  Building2,
  MapPin,
  Info,
  Check,
  Filter,
  Bookmark,
} from 'lucide-react';
import { Dog, AdopterLifestylePreferences, DogSize, DogEnergy, DogAgeGroup } from '../../types';
import { calculateCompatibility } from '../matching/matchingEngine';

interface DogDiscoveryViewProps {
  dogs: Dog[];
  adopterPreferences: AdopterLifestylePreferences | null;
  savedDogIds: string[];
  onToggleSaveDog: (dogId: string) => void;
  onOpenDogModal: (dog: Dog) => void;
  onNavigateToMatching: () => void;
}

export const DogDiscoveryView: React.FC<DogDiscoveryViewProps> = ({
  dogs,
  adopterPreferences,
  savedDogIds,
  onToggleSaveDog,
  onOpenDogModal,
  onNavigateToMatching,
}) => {
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSize, setFilterSize] = useState<DogSize | 'all'>('all');
  const [filterEnergy, setFilterEnergy] = useState<DogEnergy | 'all'>('all');
  const [filterAge, setFilterAge] = useState<DogAgeGroup | 'all'>('all');
  const [onlyHighCompatibility, setOnlyHighCompatibility] = useState(false);
  const [mustBeCatSafe, setMustBeCatSafe] = useState(false);
  const [mustBeKidSafe, setMustBeKidSafe] = useState(false);

  // Card stack state
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const [swipedHistory, setSwipedHistory] = useState<{ dogId: string; action: 'like' | 'pass' }[]>([]);

  // Filter available dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      // Basic availability: available or pending
      if (dog.status !== 'available' && dog.status !== 'pending_adoption') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dog.name.toLowerCase().includes(query);
        const matchesBreed = dog.breed.toLowerCase().includes(query);
        const matchesShelter = (dog.shelterName || '').toLowerCase().includes(query);
        const matchesLocation = dog.location.toLowerCase().includes(query);
        if (!matchesName && !matchesBreed && !matchesShelter && !matchesLocation) {
          return false;
        }
      }

      // Filters
      if (filterSize !== 'all' && dog.size !== filterSize) return false;
      if (filterEnergy !== 'all' && dog.energyLevel !== filterEnergy) return false;
      if (filterAge !== 'all' && dog.ageGroup !== filterAge) return false;
      if (mustBeCatSafe && !dog.goodWith.cats) return false;
      if (mustBeKidSafe && !dog.goodWith.children) return false;

      // High compatibility score filter
      if (onlyHighCompatibility) {
        const match = calculateCompatibility(adopterPreferences, dog);
        if (match.score < 80 || match.hardConstraintFailed) return false;
      }

      return true;
    });
  }, [
    dogs,
    searchQuery,
    filterSize,
    filterEnergy,
    filterAge,
    mustBeCatSafe,
    mustBeKidSafe,
    onlyHighCompatibility,
    adopterPreferences,
  ]);

  const currentStackDog = filteredDogs[activeStackIndex];

  // Stack Actions
  const handlePass = () => {
    if (!currentStackDog) return;
    setSwipedHistory((prev) => [...prev, { dogId: currentStackDog.id, action: 'pass' }]);
    setActiveStackIndex((prev) => prev + 1);
  };

  const handleLike = () => {
    if (!currentStackDog) return;
    onToggleSaveDog(currentStackDog.id);
    setSwipedHistory((prev) => [...prev, { dogId: currentStackDog.id, action: 'like' }]);
    setActiveStackIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (activeStackIndex > 0) {
      const last = swipedHistory[swipedHistory.length - 1];
      if (last && last.action === 'like') {
        onToggleSaveDog(last.dogId);
      }
      setSwipedHistory((prev) => prev.slice(0, -1));
      setActiveStackIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleResetStack = () => {
    setActiveStackIndex(0);
    setSwipedHistory([]);
  };

  // Keyboard shortcuts for Discovery Deck (ArrowLeft: Pass, ArrowRight: Like, U/Z: Undo, Enter: Full Profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (viewMode !== 'stack' || !currentStackDog) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePass();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleLike();
      } else if (e.key === 'u' || e.key === 'U' || e.key === 'z' || e.key === 'Z') {
        if (activeStackIndex > 0) {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onOpenDogModal(currentStackDog);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentStackDog, activeStackIndex, swipedHistory]);

  const hasActiveFilters =
    filterSize !== 'all' ||
    filterEnergy !== 'all' ||
    filterAge !== 'all' ||
    searchQuery.trim().length > 0 ||
    onlyHighCompatibility ||
    mustBeCatSafe ||
    mustBeKidSafe;

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterSize('all');
    setFilterEnergy('all');
    setFilterAge('all');
    setOnlyHighCompatibility(false);
    setMustBeCatSafe(false);
    setMustBeKidSafe(false);
    setActiveStackIndex(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] text-[11px] font-semibold mb-1.5">
            <Sparkles className="w-3 h-3 text-[#357457]" />
            <span>Personality-First Dog Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#181F1A] tracking-tight">
            Discover Companions
          </h1>
          <p className="text-xs sm:text-sm text-[#58625B] max-w-xl mt-0.5">
            Find rescue dogs whose temperament, energy, and routine align with your home.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex items-center p-1 bg-[#EAE4DC]/70 rounded-xl self-start sm:self-auto border border-[#EAE4DC]">
          <button
            id="tab-swipe-stack"
            onClick={() => setViewMode('stack')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'stack'
                ? 'bg-white text-[#183B2B] shadow-xs'
                : 'text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Deck</span>
          </button>
          <button
            id="tab-browse-grid"
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-white text-[#183B2B] shadow-xs'
                : 'text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid ({filteredDogs.length})</span>
          </button>
        </div>
      </div>

      {/* Unified Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EAE4DC] shadow-xs space-y-3">
        {/* Search Input Row */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B958E]" />
          <input
            type="text"
            placeholder="Search by name, breed, shelter, or city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveStackIndex(0);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC] text-xs text-[#181F1A] placeholder:text-[#8B958E] focus:outline-none focus:border-[#183B2B] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B958E] hover:text-[#181F1A]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F2ECE4] text-xs">
          {/* Quick Selects */}
          <select
            value={filterSize}
            onChange={(e) => {
              setFilterSize(e.target.value as any);
              setActiveStackIndex(0);
            }}
            className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl px-2.5 py-1 text-xs text-[#181F1A] font-medium focus:outline-none focus:border-[#183B2B]"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (&lt; 25 lbs)</option>
            <option value="medium">Medium (25-55 lbs)</option>
            <option value="large">Large (55-85 lbs)</option>
            <option value="giant">Giant (85+ lbs)</option>
          </select>

          <select
            value={filterEnergy}
            onChange={(e) => {
              setFilterEnergy(e.target.value as any);
              setActiveStackIndex(0);
            }}
            className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl px-2.5 py-1 text-xs text-[#181F1A] font-medium focus:outline-none focus:border-[#183B2B]"
          >
            <option value="all">All Energies</option>
            <option value="low">Low Energy</option>
            <option value="moderate">Moderate Energy</option>
            <option value="high">High Energy</option>
            <option value="very_high">Very High Energy</option>
          </select>

          <select
            value={filterAge}
            onChange={(e) => {
              setFilterAge(e.target.value as any);
              setActiveStackIndex(0);
            }}
            className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl px-2.5 py-1 text-xs text-[#181F1A] font-medium focus:outline-none focus:border-[#183B2B]"
          >
            <option value="all">All Ages</option>
            <option value="puppy">Puppy</option>
            <option value="young">Young</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>

          {/* Quick Toggles */}
          <button
            onClick={() => {
              setOnlyHighCompatibility(!onlyHighCompatibility);
              setActiveStackIndex(0);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium transition ${
              onlyHighCompatibility
                ? 'bg-[#183B2B] text-white border-[#183B2B]'
                : 'bg-[#FAF7F2] text-[#58625B] border-[#EAE4DC] hover:border-[#D5CEBF]'
            }`}
          >
            High Match (&gt;80%)
          </button>

          <button
            onClick={() => {
              setMustBeCatSafe(!mustBeCatSafe);
              setActiveStackIndex(0);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium transition ${
              mustBeCatSafe
                ? 'bg-[#183B2B] text-white border-[#183B2B]'
                : 'bg-[#FAF7F2] text-[#58625B] border-[#EAE4DC] hover:border-[#D5CEBF]'
            }`}
          >
            Cat-Friendly
          </button>

          <button
            onClick={() => {
              setMustBeKidSafe(!mustBeKidSafe);
              setActiveStackIndex(0);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium transition ${
              mustBeKidSafe
                ? 'bg-[#183B2B] text-white border-[#183B2B]'
                : 'bg-[#FAF7F2] text-[#58625B] border-[#EAE4DC] hover:border-[#D5CEBF]'
            }`}
          >
            Kid-Safe
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-[#B85438] hover:underline font-semibold ml-auto text-xs"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: TINDER-STYLE DECK VIEW (Balanced desktop layout: photo on one side, profile & actions on the other) */}
      {viewMode === 'stack' ? (
        <div className="w-full py-1">
          {currentStackDog ? (
            <div className="space-y-3 max-w-5xl mx-auto">
              {/* Balanced Discovery Deck Card */}
              <div className="bg-white rounded-3xl border border-[#EAE4DC] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] transition duration-200">
                {/* Left Column: Deliberate image aspect ratio & capped height */}
                <div className="md:col-span-5 relative bg-[#EAE4DC] min-h-[280px] md:min-h-[460px] flex flex-col justify-between overflow-hidden group">
                  <img
                    src={currentStackDog.photos[0]}
                    alt={currentStackDog.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  {/* Subtle gradient overlay for badges readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="relative z-10 p-3.5 flex justify-between items-center pointer-events-auto">
                    <span className="bg-[#183B2B]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1 shadow-xs">
                      <Building2 className="w-3 h-3 text-[#EDF4F0]" />
                      <span className="truncate max-w-[150px]">
                        {currentStackDog.shelterName || 'Shelter Partner'}
                      </span>
                    </span>
                    <span className="bg-white/95 text-[#181F1A] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      ${currentStackDog.adoptionFee}
                    </span>
                  </div>

                  {/* Bottom info on photo */}
                  <div className="relative z-10 p-4 text-white space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-xs text-white/90">
                      <MapPin className="w-3.5 h-3.5 text-[#EDF4F0] flex-shrink-0" />
                      <span className="truncate">{currentStackDog.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Dog Details, Compatibility, and Primary Actions */}
                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    {/* Header: Name, Age, Breed, Match Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-baseline space-x-2.5">
                          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#181F1A] tracking-tight">
                            {currentStackDog.name}
                          </h2>
                          <span className="text-sm font-medium text-[#58625B]">
                            {currentStackDog.ageYears} {currentStackDog.ageYears === 1 ? 'yr' : 'yrs'} old
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#58625B] mt-0.5">
                          {currentStackDog.breed} • <span className="capitalize">{currentStackDog.gender}</span>
                        </p>
                      </div>

                      {/* Compatibility Score */}
                      {(() => {
                        const match = calculateCompatibility(adopterPreferences, currentStackDog);
                        return (
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                                match.hardConstraintFailed
                                  ? 'bg-[#FAF0EC] text-[#B85438] border-[#FCE8E2]'
                                  : match.score >= 80
                                  ? 'bg-[#EDF4F0] text-[#183B2B] border-[#D8F3DC]'
                                  : 'bg-[#FAF7F2] text-[#24533E] border-[#EAE4DC]'
                              }`}
                            >
                              {match.score}% Match
                            </span>
                            <span className="text-[10px] text-[#8B958E] mt-0.5 font-medium">
                              {match.verdict}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Trait Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize">
                        {currentStackDog.energyLevel.replace('_', ' ')} Energy
                      </span>
                      <span className="bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize">
                        {currentStackDog.size} size
                      </span>
                      {currentStackDog.goodWith.cats && (
                        <span className="bg-[#EDF4F0] border border-[#D8F3DC] text-[#183B2B] text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          ✓ Cat-Friendly
                        </span>
                      )}
                      {currentStackDog.goodWith.children && (
                        <span className="bg-[#EDF4F0] border border-[#D8F3DC] text-[#183B2B] text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          ✓ Kid-Safe
                        </span>
                      )}
                      {currentStackDog.goodWith.otherDogs && (
                        <span className="bg-[#EDF4F0] border border-[#D8F3DC] text-[#183B2B] text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          ✓ Dog-Social
                        </span>
                      )}
                    </div>

                    {/* Backstory Snippet */}
                    <div className="bg-[#FAF7F2] border border-[#F2ECE4] rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B958E] block">
                        Personality & Story
                      </span>
                      <p className="text-xs text-[#58625B] leading-relaxed italic line-clamp-3">
                        "{currentStackDog.backstory}"
                      </p>
                    </div>

                    {/* Care Considerations & Requirements */}
                    <div className="space-y-1 text-xs text-[#58625B]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B958E] block">
                        Care Considerations
                      </span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#58625B]">
                        <span>
                          • Daily Exercise: <strong className="text-[#181F1A]">{currentStackDog.minDailyExerciseHours}h/day</strong>
                        </span>
                        <span>
                          • Dwelling: <strong className="text-[#181F1A] capitalize">{currentStackDog.spaceRequired.replace('_', ' ')}</strong>
                        </span>
                        <span>
                          • Experience: <strong className="text-[#181F1A] capitalize">{currentStackDog.experienceLevelNeeded.replace('_', ' ')}</strong>
                        </span>
                        {currentStackDog.specialNeeds?.length > 0 && (
                          <span className="text-[#B85438] font-semibold">
                            • Special Care: {currentStackDog.specialNeeds.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Controls Bar: Visibly anchored and accessible without scrolling */}
                  <div className="pt-3 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2.5">
                    {/* Secondary actions: Undo & View Details */}
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={activeStackIndex === 0}
                        onClick={handleUndo}
                        className={`p-2 rounded-xl border border-[#EAE4DC] flex items-center space-x-1.5 text-xs font-semibold transition ${
                          activeStackIndex > 0
                            ? 'bg-white text-[#58625B] hover:text-[#181F1A] hover:bg-[#FAF7F2]'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-200'
                        }`}
                        title="Undo last action (U or Z)"
                        aria-label="Undo last action"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Undo</span>
                      </button>

                      <button
                        onClick={() => onOpenDogModal(currentStackDog)}
                        className="px-3 py-2 rounded-xl bg-white border border-[#EAE4DC] text-[#183B2B] hover:bg-[#FAF7F2] text-xs font-bold transition flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                        title="View full profile and match breakdown (Enter)"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </div>

                    {/* Core Actions: Pass, Save, Like */}
                    <div className="flex items-center space-x-2.5">
                      {/* Pass Button */}
                      <button
                        onClick={handlePass}
                        className="px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-[#58625B] hover:text-[#B85438] hover:border-[#B85438] text-xs font-bold transition flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85438]"
                        title="Pass on this dog (←)"
                        aria-label="Pass on this dog"
                      >
                        <X className="w-4 h-4 text-[#B85438]" />
                        <span>Pass</span>
                      </button>

                      {/* Save Toggle Button */}
                      {(() => {
                        const isSaved = savedDogIds.includes(currentStackDog.id);
                        return (
                          <button
                            onClick={() => onToggleSaveDog(currentStackDog.id)}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                              isSaved
                                ? 'bg-[#FAF0EC] border-[#B85438] text-[#B85438]'
                                : 'bg-white border-[#EAE4DC] text-[#58625B] hover:text-[#181F1A] hover:bg-[#FAF7F2]'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save dog for later'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#B85438]' : ''}`} />
                            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        );
                      })()}

                      {/* Like Button */}
                      <button
                        onClick={handleLike}
                        className="px-5 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
                        title="Like and connect (→)"
                        aria-label="Like and connect"
                      >
                        <Heart className="w-4 h-4 fill-white text-white" />
                        <span>Like & Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deck Status & Keyboard navigation footer */}
              <div className="flex justify-between items-center text-xs text-[#8B958E] px-2 max-w-5xl mx-auto">
                <span>
                  Dog {activeStackIndex + 1} of {filteredDogs.length} available
                </span>
                <span className="hidden sm:inline text-[11px]">
                  Shortcuts: <kbd className="px-1.5 py-0.5 bg-white border border-[#EAE4DC] rounded text-[#181F1A]">←</kbd> Pass • <kbd className="px-1.5 py-0.5 bg-white border border-[#EAE4DC] rounded text-[#181F1A]">→</kbd> Like • <kbd className="px-1.5 py-0.5 bg-white border border-[#EAE4DC] rounded text-[#181F1A]">U</kbd> Undo • <kbd className="px-1.5 py-0.5 bg-white border border-[#EAE4DC] rounded text-[#181F1A]">Enter</kbd> Profile
                </span>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-14 px-6 bg-white rounded-3xl border border-[#EAE4DC] max-w-sm mx-auto w-full shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#EDF4F0] text-[#183B2B] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#357457]" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-[#181F1A]">
                Deck Reviewed!
              </h3>
              <p className="text-xs text-[#58625B] max-w-xs mx-auto">
                You've reviewed all available dogs under current filters.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleResetStack}
                  className="px-4 py-2 rounded-xl bg-[#183B2B] text-white text-xs font-bold hover:bg-[#24533E] transition shadow-xs"
                >
                  Restart Deck
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EAE4DC] text-[#181F1A] text-xs font-bold hover:bg-[#FAF7F2] transition"
                >
                  View Grid Mode
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: BROWSE GRID VIEW */
        <div className="space-y-4">
          {filteredDogs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#EAE4DC]">
              <p className="text-sm font-semibold text-[#181F1A]">No matching dogs found</p>
              <p className="text-xs text-[#58625B] mt-0.5">
                Try loosening your filter parameters or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDogs.map((dog) => {
                const match = calculateCompatibility(adopterPreferences, dog);
                const isSaved = savedDogIds.includes(dog.id);

                return (
                  <div
                    key={dog.id}
                    className="bg-white rounded-2xl border border-[#EAE4DC] overflow-hidden shadow-xs hover:shadow-md hover:border-[#183B2B] transition group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-52 w-full bg-[#EAE4DC] overflow-hidden">
                        <img
                          src={dog.photos[0]}
                          alt={dog.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                              match.hardConstraintFailed
                                ? 'bg-[#B85438] text-white'
                                : match.score >= 80
                                ? 'bg-[#183B2B] text-white'
                                : 'bg-white/95 text-[#181F1A]'
                            }`}
                          >
                            {match.score}% Match
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveDog(dog.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#B85438] hover:scale-110 transition shadow-xs"
                          title={isSaved ? 'Remove from saved' : 'Save dog'}
                          aria-label="Save dog"
                        >
                          <Heart className="w-3.5 h-3.5" fill={isSaved ? '#B85438' : 'none'} />
                        </button>

                        {/* Shelter Tag */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-[10px] bg-black/60 backdrop-blur-xs rounded-md px-2 py-0.5 inline-block truncate">
                          {dog.shelterName || 'Shelter Partner'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <h3 className="font-bold text-lg font-serif-heading text-[#181F1A]">
                            {dog.name}
                          </h3>
                          <span className="text-xs text-[#58625B] font-medium">
                            {dog.ageYears} yrs • ${dog.adoptionFee}
                          </span>
                        </div>
                        <p className="text-xs text-[#58625B] truncate">{dog.breed}</p>

                        <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] capitalize">
                            {dog.size}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] capitalize">
                            {dog.energyLevel.replace('_', ' ')}
                          </span>
                          {dog.goodWith.cats && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] font-semibold">
                              Cat-safe
                            </span>
                          )}
                          {dog.goodWith.children && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] font-semibold">
                              Kid-safe
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="px-4 py-3 border-t border-[#F2ECE4] bg-[#FAF7F2]/50 flex items-center justify-between text-xs">
                      <span className="text-[#8B958E] text-[11px] truncate max-w-[150px]">
                        {dog.location}
                      </span>
                      <button
                        onClick={() => onOpenDogModal(dog)}
                        className="font-bold text-[#183B2B] hover:text-[#24533E] flex items-center space-x-1"
                      >
                        <span>Full Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
