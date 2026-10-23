import React, { useState, useMemo } from 'react';
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

      {/* VIEW 1: TINDER-STYLE DECK VIEW (Optimized proportions for viewport safety) */}
      {viewMode === 'stack' ? (
        <div className="flex flex-col items-center justify-center py-2">
          {currentStackDog ? (
            <div className="w-full max-w-sm sm:max-w-md space-y-3">
              {/* Stack Card (Height capped so card + controls fit comfortably above the fold) */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-[#EAE4DC] relative flex flex-col group transition duration-200">
                {/* Photo & Overlay Header */}
                <div className="relative h-80 sm:h-96 w-full bg-[#EAE4DC] overflow-hidden">
                  <img
                    src={currentStackDog.photos[0]}
                    alt={currentStackDog.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  {/* Gentle gradient vignette for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center pointer-events-auto">
                    <span className="bg-[#183B2B]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1 shadow-xs">
                      <Building2 className="w-3 h-3 text-[#EDF4F0]" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        {currentStackDog.shelterName || 'Shelter Partner'}
                      </span>
                    </span>

                    {/* Match Score Badge */}
                    {(() => {
                      const match = calculateCompatibility(adopterPreferences, currentStackDog);
                      return (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs ${
                            match.hardConstraintFailed
                              ? 'bg-[#B85438] text-white'
                              : match.score >= 80
                              ? 'bg-[#357457] text-white'
                              : 'bg-white/95 text-[#181F1A]'
                          }`}
                        >
                          {match.score}% Match
                        </span>
                      );
                    })()}
                  </div>

                  {/* Bottom Dog Info Overlay */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white space-y-1 pointer-events-auto">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading tracking-tight">
                          {currentStackDog.name}
                        </h2>
                        <span className="text-sm opacity-90 font-light">
                          {currentStackDog.ageYears} yrs
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-lg">
                        ${currentStackDog.adoptionFee}
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 truncate">
                      {currentStackDog.breed} • {currentStackDog.location}
                    </p>

                    {/* Trait Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="bg-white/20 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-full capitalize font-medium">
                        {currentStackDog.energyLevel.replace('_', ' ')}
                      </span>
                      <span className="bg-white/20 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-full capitalize font-medium">
                        {currentStackDog.size}
                      </span>
                      {currentStackDog.goodWith.cats && (
                        <span className="bg-[#EDF4F0] text-[#183B2B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Cat-Safe
                        </span>
                      )}
                      {currentStackDog.goodWith.children && (
                        <span className="bg-[#EDF4F0] text-[#183B2B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Kid-Safe
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Backstory snippet & modal trigger */}
                <div className="p-3.5 bg-[#FAF7F2] border-t border-[#EAE4DC] flex items-center justify-between gap-2">
                  <p className="text-xs text-[#58625B] line-clamp-1 italic flex-1">
                    "{currentStackDog.backstory}"
                  </p>
                  <button
                    onClick={() => onOpenDogModal(currentStackDog)}
                    className="px-3 py-1.5 bg-white hover:bg-[#F2ECE4] text-[#183B2B] rounded-xl text-xs font-bold border border-[#EAE4DC] transition flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Controls Bar */}
              <div className="flex items-center justify-center space-x-5 pt-1">
                {/* Undo Button */}
                <button
                  disabled={activeStackIndex === 0}
                  onClick={handleUndo}
                  className={`w-11 h-11 rounded-full border border-[#EAE4DC] flex items-center justify-center transition shadow-xs ${
                    activeStackIndex > 0
                      ? 'bg-white text-[#58625B] hover:text-[#181F1A] hover:bg-[#F2ECE4]'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed border-transparent'
                  }`}
                  title="Undo last swipe"
                  aria-label="Undo last swipe"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Pass Button (✕) */}
                <button
                  onClick={handlePass}
                  className="w-14 h-14 rounded-full bg-white border border-[#EAE4DC] text-[#8B958E] hover:text-[#B85438] hover:border-[#B85438] hover:scale-105 flex items-center justify-center transition shadow-sm"
                  title="Pass on this dog"
                  aria-label="Pass"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Full Details Modal Trigger */}
                <button
                  onClick={() => onOpenDogModal(currentStackDog)}
                  className="w-11 h-11 rounded-full bg-white border border-[#EAE4DC] text-[#58625B] hover:text-[#183B2B] hover:border-[#183B2B] flex items-center justify-center transition shadow-xs"
                  title="Read story and compatibility"
                  aria-label="View details"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Like / Save Button (♥) */}
                <button
                  onClick={handleLike}
                  className="w-14 h-14 rounded-full bg-[#183B2B] text-white hover:bg-[#24533E] hover:scale-105 flex items-center justify-center transition shadow-md"
                  title="Save and Like this dog"
                  aria-label="Save and Like"
                >
                  <Heart className="w-6 h-6 fill-white" />
                </button>
              </div>

              {/* Deck Counter & Keyboard Tips */}
              <div className="flex justify-between items-center text-[11px] text-[#8B958E] px-2 pt-0.5">
                <span>
                  Dog {activeStackIndex + 1} of {filteredDogs.length}
                </span>
                <span className="hidden sm:inline">
                  Keyboard: ← Pass | → Like
                </span>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-14 px-6 bg-white rounded-3xl border border-[#EAE4DC] max-w-sm w-full shadow-xs space-y-3">
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
