import React, { useState, useMemo } from 'react';
import {
  Heart,
  X,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Search,
  LayoutGrid,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin,
  Flame,
  Info,
  ExternalLink,
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
      // Basic availability
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Mission Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E6DFD5]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Humane, Personality-First Adoption</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-[#1B4332] tracking-tight">
            Meet Dogs Waiting for You
          </h1>
          <p className="text-sm text-[#5C675F] max-w-2xl mt-1">
            Every dog has a backstory and individual needs. Explore rescue profiles, review lifestyle compatibility, and schedule verified shelter visits.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-[#EBE5DA] p-1 rounded-xl self-start md:self-end">
          <button
            id="tab-swipe-stack"
            onClick={() => setViewMode('stack')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'stack'
                ? 'bg-white text-[#1B4332] shadow-xs'
                : 'text-[#5C675F] hover:text-[#1B4332]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Swipe Stack</span>
          </button>
          <button
            id="tab-browse-grid"
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-white text-[#1B4332] shadow-xs'
                : 'text-[#5C675F] hover:text-[#1B4332]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Browse Grid ({filteredDogs.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6DFD5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9991]" />
            <input
              type="text"
              placeholder="Search by dog name, breed, location, or shelter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveStackIndex(0);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E9991] hover:text-[#1C241E]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSize}
              onChange={(e) => {
                setFilterSize(e.target.value as any);
                setActiveStackIndex(0);
              }}
              className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-3 py-2 text-xs font-medium text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
            >
              <option value="all">All Sizes</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="giant">Giant</option>
            </select>

            <select
              value={filterEnergy}
              onChange={(e) => {
                setFilterEnergy(e.target.value as any);
                setActiveStackIndex(0);
              }}
              className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-3 py-2 text-xs font-medium text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
            >
              <option value="all">All Energy Levels</option>
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
              className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-3 py-2 text-xs font-medium text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
            >
              <option value="all">All Ages</option>
              <option value="puppy">Puppies</option>
              <option value="young">Young</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior Dogs</option>
            </select>
          </div>
        </div>

        {/* Checkbox Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F4EFEA] text-xs">
          <label className="flex items-center space-x-1.5 cursor-pointer bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] hover:border-[#1B4332]">
            <input
              type="checkbox"
              checked={onlyHighCompatibility}
              onChange={(e) => {
                setOnlyHighCompatibility(e.target.checked);
                setActiveStackIndex(0);
              }}
              className="rounded text-[#1B4332] focus:ring-0"
            />
            <span className="font-medium text-[#1C241E]">High Match Only (&gt;80%)</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] hover:border-[#1B4332]">
            <input
              type="checkbox"
              checked={mustBeCatSafe}
              onChange={(e) => {
                setMustBeCatSafe(e.target.checked);
                setActiveStackIndex(0);
              }}
              className="rounded text-[#1B4332] focus:ring-0"
            />
            <span className="font-medium text-[#1C241E]">Cat-Friendly Only</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] hover:border-[#1B4332]">
            <input
              type="checkbox"
              checked={mustBeKidSafe}
              onChange={(e) => {
                setMustBeKidSafe(e.target.checked);
                setActiveStackIndex(0);
              }}
              className="rounded text-[#1B4332] focus:ring-0"
            />
            <span className="font-medium text-[#1C241E]">Gentle with Kids</span>
          </label>

          {(filterSize !== 'all' ||
            filterEnergy !== 'all' ||
            filterAge !== 'all' ||
            searchQuery ||
            onlyHighCompatibility ||
            mustBeCatSafe ||
            mustBeKidSafe) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSize('all');
                setFilterEnergy('all');
                setFilterAge('all');
                setOnlyHighCompatibility(false);
                setMustBeCatSafe(false);
                setMustBeKidSafe(false);
                setActiveStackIndex(0);
              }}
              className="text-[#BA5536] hover:underline font-semibold ml-auto text-xs"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: TINDER-STYLE CARD STACK */}
      {viewMode === 'stack' ? (
        <div className="flex flex-col items-center justify-center py-4">
          {currentStackDog ? (
            <div className="w-full max-w-md space-y-4">
              {/* Stack Progress Counter */}
              <div className="flex justify-between items-center text-xs text-[#5C675F] px-1">
                <span>
                  Dog {activeStackIndex + 1} of {filteredDogs.length}
                </span>
                <span className="font-medium text-[#1B4332]">
                  Keyboard: ← Pass | → Save & Like | Space Details
                </span>
              </div>

              {/* Main Dog Card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#E6DFD5] relative flex flex-col group transition-all duration-300">
                {/* Photo Header */}
                <div className="relative aspect-4/5 w-full bg-[#E6DFD5] overflow-hidden">
                  <img
                    src={currentStackDog.photos[0]}
                    alt={currentStackDog.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <span className="bg-[#1B4332]/85 text-[#FAF8F5] text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-[#52B788]" />
                      <span>{currentStackDog.shelterName || 'Shelter Partner'}</span>
                    </span>

                    {/* Compatibility Badge */}
                    {(() => {
                      const match = calculateCompatibility(adopterPreferences, currentStackDog);
                      return (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full shadow-xs backdrop-blur-xs ${
                            match.hardConstraintFailed
                              ? 'bg-[#BA5536] text-white'
                              : match.score >= 80
                              ? 'bg-[#2D6A4F] text-white'
                              : 'bg-white/90 text-[#1B4332]'
                          }`}
                        >
                          {match.score}% Match
                        </span>
                      );
                    })()}
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <h2 className="text-3xl font-bold font-serif-heading">
                        {currentStackDog.name}
                      </h2>
                      <span className="text-lg opacity-90">{currentStackDog.ageYears} yrs</span>
                    </div>

                    <p className="text-sm text-gray-200">
                      {currentStackDog.breed} • {currentStackDog.location}
                    </p>

                    {/* Trait Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="bg-white/20 backdrop-blur-xs text-[11px] px-2.5 py-0.5 rounded-full capitalize font-medium">
                        {currentStackDog.energyLevel.replace('_', ' ')} Energy
                      </span>
                      <span className="bg-white/20 backdrop-blur-xs text-[11px] px-2.5 py-0.5 rounded-full capitalize font-medium">
                        {currentStackDog.size}
                      </span>
                      {currentStackDog.temperament.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="bg-white/20 backdrop-blur-xs text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Quick Preview & Story */}
                <div className="p-4 bg-[#FAF8F5] border-t border-[#E6DFD5] space-y-3">
                  <p className="text-xs text-[#2D372E] line-clamp-2 leading-relaxed">
                    {currentStackDog.backstory}
                  </p>

                  <button
                    onClick={() => onOpenDogModal(currentStackDog)}
                    className="w-full py-2 bg-white hover:bg-[#F4EFEA] text-[#1B4332] rounded-xl text-xs font-bold border border-[#D5CEBF] transition flex items-center justify-center space-x-1"
                  >
                    <span>View Complete Profile & Compatibility</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Swipe Action Control Bar */}
              <div className="flex items-center justify-center space-x-6 pt-2">
                {/* Undo Button */}
                <button
                  disabled={activeStackIndex === 0}
                  onClick={handleUndo}
                  className={`w-12 h-12 rounded-full border border-[#D5CEBF] flex items-center justify-center transition shadow-xs ${
                    activeStackIndex > 0
                      ? 'bg-white text-[#5C675F] hover:bg-[#F4EFEA] hover:text-[#1B4332]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Undo last swipe"
                  aria-label="Undo last swipe"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Pass Button */}
                <button
                  onClick={handlePass}
                  className="w-16 h-16 rounded-full bg-white border-2 border-[#E6DFD5] text-[#8E9991] hover:text-[#BA5536] hover:border-[#BA5536] hover:scale-105 flex items-center justify-center transition shadow-sm"
                  title="Pass on this dog"
                  aria-label="Pass"
                >
                  <X className="w-7 h-7" />
                </button>

                {/* Like / Save Button */}
                <button
                  onClick={handleLike}
                  className="w-16 h-16 rounded-full bg-[#1B4332] text-white hover:bg-[#2D6A4F] hover:scale-105 flex items-center justify-center transition shadow-md"
                  title="Save and Like this dog"
                  aria-label="Save and Like"
                >
                  <Heart className="w-7 h-7 fill-white" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E6DFD5] max-w-md w-full shadow-xs space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#EBF7EE] text-[#1B4332] flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-[#2D6A4F]" />
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-[#1B4332]">
                All Caught Up!
              </h3>
              <p className="text-sm text-[#5C675F] max-w-sm mx-auto">
                You've browsed through all available dogs matching your current filter criteria.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleResetStack}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition shadow-xs"
                >
                  Restart Card Stack
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-[#D5CEBF] text-[#1B4332] text-xs font-bold hover:bg-[#FAF8F5] transition"
                >
                  Browse Grid View
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: BROWSE GRID */
        <div className="space-y-4">
          {filteredDogs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E6DFD5]">
              <p className="text-base font-semibold text-[#1C241E]">No matching dogs found</p>
              <p className="text-xs text-[#5C675F] mt-1">
                Try loosening your filter parameters or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDogs.map((dog) => {
                const match = calculateCompatibility(adopterPreferences, dog);
                const isSaved = savedDogIds.includes(dog.id);

                return (
                  <div
                    key={dog.id}
                    className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#1B4332] transition group flex flex-col"
                  >
                    {/* Dog Image */}
                    <div className="relative aspect-4/3 w-full bg-[#E6DFD5] overflow-hidden">
                      <img
                        src={dog.photos[0]}
                        alt={dog.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                            match.hardConstraintFailed
                              ? 'bg-[#BA5536] text-white'
                              : match.score >= 80
                              ? 'bg-[#1B4332] text-white'
                              : 'bg-white/95 text-[#1C241E]'
                          }`}
                        >
                          {match.score}% Match
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveDog(dog.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#BA5536] hover:scale-110 transition shadow-xs"
                        title={isSaved ? 'Remove from saved' : 'Save dog'}
                        aria-label="Save dog"
                      >
                        <Heart className="w-4 h-4" fill={isSaved ? '#BA5536' : 'none'} />
                      </button>

                      <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] bg-black/50 backdrop-blur-xs rounded-md px-2 py-0.5 inline-block truncate">
                        {dog.shelterName || 'Shelter Partner'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-baseline justify-between">
                          <h3 className="font-bold text-lg font-serif-heading text-[#1C241E]">
                            {dog.name}
                          </h3>
                          <span className="text-xs text-[#5C675F]">{dog.ageYears} yrs</span>
                        </div>
                        <p className="text-xs text-[#5C675F] truncate">{dog.breed}</p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] text-[#1C241E] capitalize">
                            {dog.size}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] text-[#1C241E] capitalize">
                            {dog.energyLevel.replace('_', ' ')}
                          </span>
                          {dog.goodWith.cats && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#1B4332]">
                              Cat-safe
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1B4332]">
                          ${dog.adoptionFee} fee
                        </span>
                        <button
                          onClick={() => onOpenDogModal(dog)}
                          className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center space-x-1"
                        >
                          <span>Full Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
