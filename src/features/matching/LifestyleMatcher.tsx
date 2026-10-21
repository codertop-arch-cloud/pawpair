import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Heart,
  ChevronRight,
  Info,
  Clock,
  Home,
  Activity,
  Award,
  HelpCircle,
} from 'lucide-react';
import { Dog, AdopterLifestylePreferences, DogSize, DogAgeGroup, ExperienceLevel } from '../../types';
import { calculateCompatibility } from './matchingEngine';

interface LifestyleMatcherProps {
  preferences: AdopterLifestylePreferences | null;
  onSavePreferences: (prefs: AdopterLifestylePreferences) => void;
  dogs: Dog[];
  onOpenDogModal: (dog: Dog) => void;
}

export const LifestyleMatcher: React.FC<LifestyleMatcherProps> = ({
  preferences,
  onSavePreferences,
  dogs,
  onOpenDogModal,
}) => {
  // Local form state initialized from props or defaults
  const [formData, setFormData] = useState<AdopterLifestylePreferences>(() => {
    if (preferences) return preferences;
    return {
      preferredSizes: ['medium', 'small'],
      preferredAges: ['adult', 'young'],
      dailyActivityLevel: 'moderate',
      dailyTimeHours: 2.0,
      livingEnvironment: 'apartment_balcony',
      experienceLevel: 'intermediate',
      householdPets: {
        hasCats: true,
        hasDogs: false,
        hasKids: false,
      },
      willingToAccommodateNeeds: true,
      workFromHome: 'hybrid',
    };
  });

  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(formData);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  // Rank dogs by compatibility
  const rankedDogs = React.useMemo(() => {
    return [...dogs]
      .filter((d) => d.status === 'available')
      .map((dog) => ({
        dog,
        result: calculateCompatibility(formData, dog),
      }))
      .sort((a, b) => b.result.score - a.result.score);
  }, [dogs, formData]);

  const toggleSize = (size: DogSize) => {
    setFormData((prev) => {
      const exists = prev.preferredSizes.includes(size);
      const updated = exists
        ? prev.preferredSizes.filter((s) => s !== size)
        : [...prev.preferredSizes, size];
      return { ...prev, preferredSizes: updated };
    });
  };

  const toggleAge = (age: DogAgeGroup) => {
    setFormData((prev) => {
      const exists = prev.preferredAges.includes(age);
      const updated = exists
        ? prev.preferredAges.filter((a) => a !== age)
        : [...prev.preferredAges, age];
      return { ...prev, preferredAges: updated };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#E6DFD5]">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Deterministic Welfare Matching</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-[#1B4332] tracking-tight">
          Explainable Compatibility Matcher
        </h1>
        <p className="text-sm text-[#5C675F] max-w-3xl mt-1">
          Our algorithm balances animal welfare requirements, living environment, exercise commitments, and household safety to produce transparent match scores and detailed rationale.
        </p>
      </div>

      {savedSuccessToast && (
        <div className="bg-[#EBF7EE] border border-[#D8F3DC] text-[#1B4332] p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span>Lifestyle questionnaire saved! Dog compatibility scores have been updated dynamically.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Questionnaire Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-6"
          >
            <div className="border-b border-[#F4EFEA] pb-3">
              <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
                Your Lifestyle Profile
              </h2>
              <p className="text-xs text-[#5C675F] mt-0.5">
                Adjust any answer to see compatibility scores recalculate immediately.
              </p>
            </div>

            {/* 1. Household Composition (Hard Constraints) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                1. Household & Resident Pets
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] cursor-pointer hover:border-[#1B4332] transition">
                  <div>
                    <span className="font-semibold text-[#1C241E] block">Resident Cat(s)</span>
                    <span className="text-[11px] text-[#5C675F]">
                      Applies animal welfare filter for high prey drive
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.householdPets.hasCats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        householdPets: { ...formData.householdPets, hasCats: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] cursor-pointer hover:border-[#1B4332] transition">
                  <div>
                    <span className="font-semibold text-[#1C241E] block">Young Children (&lt; 10 yrs)</span>
                    <span className="text-[11px] text-[#5C675F]">
                      Ensures patient temperament with loud or sudden movements
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.householdPets.hasKids}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        householdPets: { ...formData.householdPets, hasKids: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] cursor-pointer hover:border-[#1B4332] transition">
                  <div>
                    <span className="font-semibold text-[#1C241E] block">Other Resident Dogs</span>
                    <span className="text-[11px] text-[#5C675F]">
                      Checks canine social tolerance and pack synergy
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.householdPets.hasDogs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        householdPets: { ...formData.householdPets, hasDogs: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-0"
                  />
                </label>
              </div>
            </div>

            {/* 2. Living Environment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                2. Living Environment
              </label>
              <select
                value={formData.livingEnvironment}
                onChange={(e) =>
                  setFormData({ ...formData, livingEnvironment: e.target.value as any })
                }
                className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs font-medium text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="apartment_no_yard">Apartment / Condo (No Yard)</option>
                <option value="apartment_balcony">Apartment with Balcony / Patio</option>
                <option value="house_small_yard">House with Small Fenced Yard</option>
                <option value="house_large_yard">House with Large Fenced Yard</option>
                <option value="rural_ranch">Rural Property / Acreage</option>
              </select>
            </div>

            {/* 3. Daily Exercise & Activity Commitment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider">
                  3. Dedicated Daily Exercise Time
                </label>
                <span className="text-xs font-bold text-[#1B4332] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                  {formData.dailyTimeHours} Hours / Day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={formData.dailyTimeHours}
                onChange={(e) =>
                  setFormData({ ...formData, dailyTimeHours: parseFloat(e.target.value) })
                }
                className="w-full accent-[#1B4332] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8E9991]">
                <span>30 min (Gentle strolls)</span>
                <span>2 hrs (Active walks)</span>
                <span>4+ hrs (Hikes/Runs)</span>
              </div>
            </div>

            {/* 4. Activity Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                4. Your Personal Activity Style
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { id: 'sedentary', label: 'Relaxed / Low-key' },
                    { id: 'light', label: 'Light (Daily strolls)' },
                    { id: 'moderate', label: 'Moderate (Active walks)' },
                    { id: 'very_active', label: 'Athletic (Run/Hike)' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyActivityLevel: lvl.id })}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      formData.dailyActivityLevel === lvl.id
                        ? 'border-[#1B4332] bg-[#EBF7EE] text-[#1B4332] font-semibold'
                        : 'border-[#E6DFD5] bg-[#FAF8F5] text-[#2D372E] hover:border-[#1B4332]'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Guardian Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                5. Experience Caring for Dogs
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { id: 'first_time', label: 'First-time' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'experienced', label: 'Experienced' },
                  ] as const
                ).map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, experienceLevel: exp.id })}
                    className={`p-2 rounded-xl border text-center font-medium transition ${
                      formData.experienceLevel === exp.id
                        ? 'border-[#1B4332] bg-[#EBF7EE] text-[#1B4332] font-semibold'
                        : 'border-[#E6DFD5] bg-[#FAF8F5] text-[#2D372E] hover:border-[#1B4332]'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Work Schedule & Solitude */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                6. Work Routine
              </label>
              <select
                value={formData.workFromHome}
                onChange={(e) =>
                  setFormData({ ...formData, workFromHome: e.target.value as any })
                }
                className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs font-medium text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="full_time">Full-time Work From Home</option>
                <option value="hybrid">Hybrid (Home & Office)</option>
                <option value="office">Full-time On-site Office (Away 8+ hrs)</option>
              </select>
            </div>

            {/* 7. Preferred Sizes & Ages */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C241E] uppercase tracking-wider block">
                7. Size Preferences
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['small', 'medium', 'large', 'giant'] as DogSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 rounded-xl border capitalize font-medium transition ${
                      formData.preferredSizes.includes(size)
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-[#E6DFD5] bg-[#FAF8F5] text-[#2D372E]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Preferences Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Save & Update All Match Calculations</span>
            </button>
          </form>
        </div>

        {/* Right Column: Ranked Match Results Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
              Ranked Compatibility Results ({rankedDogs.length})
            </h2>
            <span className="text-xs text-[#5C675F]">
              Sorted by highest normalized welfare score
            </span>
          </div>

          <div className="space-y-4">
            {rankedDogs.map(({ dog, result }) => {
              const isCatConstraint =
                formData.householdPets.hasCats && !dog.goodWith.cats;
              const isKidConstraint =
                formData.householdPets.hasKids && !dog.goodWith.children;

              return (
                <div
                  key={dog.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-xs hover:shadow-md ${
                    result.hardConstraintFailed
                      ? 'border-[#FCE8E2] bg-[#FFFBFB]'
                      : result.score >= 80
                      ? 'border-[#D8F3DC] hover:border-[#1B4332]'
                      : 'border-[#E6DFD5]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Dog Thumbnail */}
                    <img
                      src={dog.photos[0]}
                      alt={dog.name}
                      className="w-full sm:w-28 sm:h-28 rounded-xl object-cover flex-shrink-0"
                    />

                    {/* Dog Details & Score */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg font-serif-heading text-[#1C241E]">
                            {dog.name}
                          </h3>
                          <p className="text-xs text-[#5C675F]">
                            {dog.breed} • {dog.ageYears} yrs • {dog.shelterName}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right">
                          <span
                            className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                              result.hardConstraintFailed
                                ? 'bg-[#FFF3F0] text-[#BA5536] border-[#FCE8E2]'
                                : result.score >= 80
                                ? 'bg-[#EBF7EE] text-[#1B4332] border-[#D8F3DC]'
                                : 'bg-[#FAF8F5] text-[#2D6A4F] border-[#E6DFD5]'
                            }`}
                          >
                            {result.score}% — {result.verdict}
                          </span>
                        </div>
                      </div>

                      {/* Hard Constraint Alert if failed */}
                      {result.hardConstraintFailed && (
                        <div className="bg-[#FFF3F0] border border-[#FCE8E2] text-[#BA5536] p-2.5 rounded-lg text-xs flex items-center space-x-2">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{result.hardConstraintReason}</span>
                        </div>
                      )}

                      {/* Score Breakdown Bars (Mini) */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[10px] pt-1">
                        <div className="bg-[#FAF8F5] p-1.5 rounded-md">
                          <span className="text-[#8E9991] block">Household</span>
                          <span className="font-bold text-[#1C241E]">
                            {result.breakdown.householdCompatibilityScore}/25
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded-md">
                          <span className="text-[#8E9991] block">Activity</span>
                          <span className="font-bold text-[#1C241E]">
                            {result.breakdown.activityScore}/25
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded-md">
                          <span className="text-[#8E9991] block">Space</span>
                          <span className="font-bold text-[#1C241E]">
                            {result.breakdown.environmentScore}/20
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded-md">
                          <span className="text-[#8E9991] block">Experience</span>
                          <span className="font-bold text-[#1C241E]">
                            {result.breakdown.experienceScore}/15
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded-md">
                          <span className="text-[#8E9991] block">Schedule</span>
                          <span className="font-bold text-[#1C241E]">
                            {result.breakdown.scheduleScore}/15
                          </span>
                        </div>
                      </div>

                      {/* Top Positive Factors & Challenges */}
                      <div className="space-y-1 text-xs pt-1">
                        {result.positiveHighlights.slice(0, 1).map((h, i) => (
                          <div key={i} className="text-[#2D6A4F] flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788] flex-shrink-0" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                        {result.potentialChallenges.slice(0, 1).map((c, i) => (
                          <div key={i} className="text-[#BA5536] flex items-center space-x-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#BA5536] flex-shrink-0" />
                            <span className="line-clamp-1">{c}</span>
                          </div>
                        ))}
                      </div>

                      {/* View Profile Action */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onOpenDogModal(dog)}
                          className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center space-x-1"
                        >
                          <span>Explore Full Breakdown & Story</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
