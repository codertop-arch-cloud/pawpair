import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Home,
  Clock,
  Activity,
  Award,
  Users,
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
  // 4 clear steps + 1 results view
  const [currentStep, setCurrentStep] = useState<number>(0);

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

  // Compute live ranked matches using deterministic engine
  const rankedDogs = useMemo(() => {
    return [...dogs]
      .filter((d) => d.status === 'available')
      .map((dog) => ({
        dog,
        result: calculateCompatibility(formData, dog),
      }))
      .sort((a, b) => b.result.score - a.result.score);
  }, [dogs, formData]);

  const handleSaveAndShowResults = () => {
    onSavePreferences(formData);
    setSavedSuccessToast(true);
    setCurrentStep(4); // Jump to results
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  const toggleSize = (size: DogSize) => {
    setFormData((prev) => {
      const exists = prev.preferredSizes.includes(size);
      const updated = exists
        ? prev.preferredSizes.filter((s) => s !== size)
        : [...prev.preferredSizes, size];
      return { ...prev, preferredSizes: updated };
    });
  };

  const steps = [
    { title: '1. Household & Pets', icon: Users, desc: 'Safety constraints for cats and children' },
    { title: '2. Living Environment', icon: Home, desc: 'Dwelling type, yard access, and size preferences' },
    { title: '3. Routine & Energy', icon: Clock, desc: 'Exercise hours and personal activity pace' },
    { title: '4. Experience & Care', icon: Award, desc: 'Handling background and training readiness' },
    { title: '5. Match Explorer', icon: Sparkles, desc: 'Transparent compatibility results' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#EAE4DC]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] text-[11px] font-semibold mb-1.5">
            <Sparkles className="w-3 h-3 text-[#357457]" />
            <span>Deterministic Matching Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#181F1A] tracking-tight">
            Lifestyle Compatibility Matcher
          </h1>
          <p className="text-xs sm:text-sm text-[#58625B] max-w-2xl mt-0.5">
            Explainable animal welfare matching based on documented behavioral requirements.
          </p>
        </div>

        {/* View Switcher between Questionnaire and Results */}
        <div className="inline-flex items-center p-1 bg-[#EAE4DC]/70 rounded-xl self-start sm:self-auto border border-[#EAE4DC]">
          <button
            onClick={() => setCurrentStep(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentStep < 4
                ? 'bg-white text-[#183B2B] shadow-xs'
                : 'text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            Questionnaire
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentStep === 4
                ? 'bg-white text-[#183B2B] shadow-xs'
                : 'text-[#58625B] hover:text-[#181F1A]'
            }`}
          >
            Matches ({rankedDogs.length})
          </button>
        </div>
      </div>

      {savedSuccessToast && (
        <div className="bg-[#EDF4F0] border border-[#D8F3DC] text-[#183B2B] p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#357457]" />
          <span>Profile saved! Compatibility scores updated for all rescue dogs.</span>
        </div>
      )}

      {/* Stepper Progress Bar (Only during Questionnaire steps) */}
      {currentStep < 4 && (
        <div className="bg-white rounded-2xl p-3 border border-[#EAE4DC] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {steps.slice(0, 4).map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isPast = currentStep > idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`p-3 rounded-xl text-left transition-all flex items-center space-x-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                    isActive
                      ? 'bg-[#183B2B] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#EDF4F0] text-[#183B2B] hover:bg-[#E3EFE8]'
                      : 'bg-[#FAF7F2] text-[#58625B] hover:bg-[#F2ECE4]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-[#357457] text-white'
                        : 'bg-[#EAE4DC] text-[#58625B]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {step.title.split('. ')[1]}
                    </p>
                    <p
                      className={`text-[10px] uppercase font-bold tracking-wider truncate mt-0.5 ${
                        isActive ? 'text-gray-200' : isPast ? 'text-[#357457]' : 'text-[#8B958E]'
                      }`}
                    >
                      {isActive ? 'Current Step' : isPast ? 'Completed' : 'Upcoming'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: HOUSEHOLD & PETS */}
      {currentStep === 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              1. Household Composition & Social Safety
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              These factors trigger animal welfare safety rules to prevent placing high-prey-drive dogs near vulnerable pets or small children.
            </p>
          </div>

          <div className="space-y-3">
            {/* Custom Checkbox: Resident Cats */}
            <div
              role="checkbox"
              aria-checked={formData.householdPets.hasCats}
              tabIndex={0}
              onClick={() =>
                setFormData({
                  ...formData,
                  householdPets: { ...formData.householdPets, hasCats: !formData.householdPets.hasCats },
                })
              }
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    householdPets: { ...formData.householdPets, hasCats: !formData.householdPets.hasCats },
                  });
                }
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                formData.householdPets.hasCats
                  ? 'border-[#183B2B] bg-[#EDF4F0]/60 ring-1 ring-[#183B2B]/20 shadow-xs'
                  : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-sm text-[#181F1A] block">Resident Cat(s) in Home</span>
                <span className="text-xs text-[#58625B] mt-0.5 block leading-relaxed">
                  Applies strict welfare constraint against dogs with cat-reactivity or prey-drive history
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  formData.householdPets.hasCats
                    ? 'bg-[#183B2B] text-white shadow-xs'
                    : 'border-2 border-[#D5CEBF] bg-white'
                }`}
              >
                {formData.householdPets.hasCats && <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </div>

            {/* Custom Checkbox: Young Children */}
            <div
              role="checkbox"
              aria-checked={formData.householdPets.hasKids}
              tabIndex={0}
              onClick={() =>
                setFormData({
                  ...formData,
                  householdPets: { ...formData.householdPets, hasKids: !formData.householdPets.hasKids },
                })
              }
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    householdPets: { ...formData.householdPets, hasKids: !formData.householdPets.hasKids },
                  });
                }
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                formData.householdPets.hasKids
                  ? 'border-[#183B2B] bg-[#EDF4F0]/60 ring-1 ring-[#183B2B]/20 shadow-xs'
                  : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-sm text-[#181F1A] block">Young Children (&lt; 10 years old)</span>
                <span className="text-xs text-[#58625B] mt-0.5 block leading-relaxed">
                  Filters for gentle, patient temperaments suited to fast movements, toys, and noise
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  formData.householdPets.hasKids
                    ? 'bg-[#183B2B] text-white shadow-xs'
                    : 'border-2 border-[#D5CEBF] bg-white'
                }`}
              >
                {formData.householdPets.hasKids && <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </div>

            {/* Custom Checkbox: Other Resident Dogs */}
            <div
              role="checkbox"
              aria-checked={formData.householdPets.hasDogs}
              tabIndex={0}
              onClick={() =>
                setFormData({
                  ...formData,
                  householdPets: { ...formData.householdPets, hasDogs: !formData.householdPets.hasDogs },
                })
              }
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    householdPets: { ...formData.householdPets, hasDogs: !formData.householdPets.hasDogs },
                  });
                }
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                formData.householdPets.hasDogs
                  ? 'border-[#183B2B] bg-[#EDF4F0]/60 ring-1 ring-[#183B2B]/20 shadow-xs'
                  : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-sm text-[#181F1A] block">Other Resident Dogs in Home</span>
                <span className="text-xs text-[#58625B] mt-0.5 block leading-relaxed">
                  Matches dog-social temperaments suitable for multi-dog play and shared living spaces
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  formData.householdPets.hasDogs
                    ? 'bg-[#183B2B] text-white shadow-xs'
                    : 'border-2 border-[#D5CEBF] bg-white'
                }`}
              >
                {formData.householdPets.hasDogs && <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#F2ECE4]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <span>Continue: Living Environment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LIVING ENVIRONMENT */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              2. Living Space & Preferred Size
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Ensures the dog's physical size and territory needs match your dwelling and outdoor access.
            </p>
          </div>

          <div className="space-y-5">
            {/* Dwelling Type Selection */}
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Home Type & Yard Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: 'apartment_no_yard', label: 'Apartment / Condo', desc: 'No private yard access' },
                  { id: 'apartment_balcony', label: 'Apartment with Balcony', desc: 'Enclosed outdoor space' },
                  { id: 'house_small_yard', label: 'House (Small Fenced Yard)', desc: 'Secure fenced perimeter' },
                  { id: 'house_large_yard', label: 'House (Large Fenced Yard)', desc: 'Generous running area' },
                  { id: 'rural_ranch', label: 'Rural Property / Acreage', desc: 'Open country or farm space' },
                ].map((env) => {
                  const isSelected = formData.livingEnvironment === env.id;
                  return (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, livingEnvironment: env.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                        isSelected
                          ? 'border-[#183B2B] bg-[#EDF4F0]/70 ring-1 ring-[#183B2B]/20 shadow-xs'
                          : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white text-[#181F1A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className={`text-xs block font-bold ${isSelected ? 'text-[#183B2B]' : 'text-[#181F1A]'}`}>
                          {env.label}
                        </span>
                        <span className="text-[11px] text-[#58625B] mt-0.5 block">{env.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                          isSelected ? 'border-[#183B2B] bg-white' : 'border-[#D5CEBF] bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#183B2B]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Sizes Selection & Validation */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block">
                  Preferred Dog Sizes
                </label>
                <span className="text-[11px] text-[#8B958E]">Select all that apply</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['small', 'medium', 'large', 'giant'] as DogSize[]).map((size) => {
                  const isChecked = formData.preferredSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2.5 rounded-xl border capitalize font-semibold transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                        isChecked
                          ? 'border-[#183B2B] bg-[#183B2B] text-white shadow-xs'
                          : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#D5CEBF] hover:bg-white'
                      }`}
                    >
                      <span>
                        {size} ({size === 'small' ? '<25 lbs' : size === 'medium' ? '25-55 lbs' : size === 'large' ? '55-85 lbs' : '85+ lbs'})
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>

              {/* Validation Warning when no size selected */}
              {formData.preferredSizes.length === 0 && (
                <div className="mt-3 bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-3 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Please select at least one preferred dog size to match available rescues.</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-[#F2ECE4]">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={formData.preferredSizes.length === 0}
              onClick={() => setCurrentStep(2)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                formData.preferredSizes.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#183B2B] hover:bg-[#24533E] text-white shadow-xs'
              }`}
            >
              <span>Continue: Routine & Energy</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ROUTINE & ENERGY */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              3. Activity Rhythm & Schedule
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Prevents energy mismatches where high-drive working breeds are placed in low-exercise homes.
            </p>
          </div>

          <div className="space-y-6">
            {/* Daily Exercise Slider with Presets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#181F1A] uppercase tracking-wider">
                  Dedicated Daily Exercise Time
                </label>
                <span className="font-bold text-[#183B2B] bg-[#EDF4F0] px-3 py-1 rounded-full border border-[#D8F3DC]">
                  {formData.dailyTimeHours} {formData.dailyTimeHours === 1 ? 'Hour' : 'Hours'} / Day
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
                className="w-full accent-[#183B2B] cursor-pointer"
              />
              {/* Quick Presets */}
              <div className="flex items-center space-x-2 pt-0.5">
                <span className="text-[11px] text-[#8B958E] font-medium mr-1">Presets:</span>
                {[
                  { value: 0.5, label: '30 min (Leisurely)' },
                  { value: 1.0, label: '1 hr (Daily Walk)' },
                  { value: 2.0, label: '2 hrs (Active)' },
                  { value: 3.5, label: '3.5+ hrs (Athletic)' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyTimeHours: preset.value })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      formData.dailyTimeHours === preset.value
                        ? 'bg-[#183B2B] text-white border-[#183B2B]'
                        : 'bg-[#FAF7F2] text-[#58625B] border-[#EAE4DC] hover:border-[#183B2B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Activity Style */}
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Personal Activity Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {[
                  { id: 'sedentary', label: 'Relaxed / Low-key', desc: 'Calm indoor days & strolls' },
                  { id: 'light', label: 'Light', desc: 'Regular neighborhood walks' },
                  { id: 'moderate', label: 'Moderate', desc: 'Parks, play sessions, longer walks' },
                  { id: 'very_active', label: 'Athletic', desc: 'Running, hiking, trail adventures' },
                ].map((act) => {
                  const isSelected = formData.dailyActivityLevel === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyActivityLevel: act.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                        isSelected
                          ? 'border-[#183B2B] bg-[#EDF4F0]/70 ring-1 ring-[#183B2B]/20 shadow-xs'
                          : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white text-[#181F1A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className={`text-xs block font-bold ${isSelected ? 'text-[#183B2B]' : 'text-[#181F1A]'}`}>
                          {act.label}
                        </span>
                        <span className="text-[11px] text-[#58625B] mt-0.5 block">{act.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                          isSelected ? 'border-[#183B2B] bg-white' : 'border-[#D5CEBF] bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#183B2B]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Routine */}
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Work Routine & Hours Away
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: 'full_time', label: 'Full-time WFH', desc: 'Home throughout the day (<2h alone)' },
                  { id: 'hybrid', label: 'Hybrid Schedule', desc: 'In office 2-3 days (4-6h alone)' },
                  { id: 'office', label: 'Full Office Hours', desc: 'Away on standard workday (7-8h alone)' },
                ].map((wrk) => {
                  const isSelected = formData.workFromHome === wrk.id;
                  return (
                    <button
                      key={wrk.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, workFromHome: wrk.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                        isSelected
                          ? 'border-[#183B2B] bg-[#EDF4F0]/70 ring-1 ring-[#183B2B]/20 shadow-xs'
                          : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white text-[#181F1A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className={`text-xs block font-bold ${isSelected ? 'text-[#183B2B]' : 'text-[#181F1A]'}`}>
                          {wrk.label}
                        </span>
                        <span className="text-[11px] text-[#58625B] mt-0.5 block">{wrk.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                          isSelected ? 'border-[#183B2B] bg-white' : 'border-[#D5CEBF] bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#183B2B]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-[#F2ECE4]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <span>Continue: Experience & Care</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: EXPERIENCE & CARE */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              4. Experience & Training Background
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Assesses guardian comfort with behavioral boundaries and accommodation for medical/special care needs.
            </p>
          </div>

          <div className="space-y-5">
            {/* Guardian Experience Cards */}
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Dog Guardian Experience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    id: 'first_time',
                    label: 'First-time Guardian',
                    desc: 'Seeking gentle, forgiving temperaments and easy handling',
                  },
                  {
                    id: 'intermediate',
                    label: 'Intermediate Guardian',
                    desc: 'Comfortable with basic cues, house manners, and routine training',
                  },
                  {
                    id: 'experienced',
                    label: 'Experienced Guardian',
                    desc: 'Familiar with high-drive, reactive, or complex rescue backgrounds',
                  },
                ].map((exp) => {
                  const isSelected = formData.experienceLevel === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: exp.id as any })}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                        isSelected
                          ? 'border-[#183B2B] bg-[#EDF4F0]/70 ring-1 ring-[#183B2B]/20 shadow-xs'
                          : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white text-[#181F1A]'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`font-bold block text-xs ${isSelected ? 'text-[#183B2B]' : 'text-[#181F1A]'}`}>
                          {exp.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ml-2 ${
                            isSelected ? 'border-[#183B2B] bg-white' : 'border-[#D5CEBF] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#183B2B]" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#58625B] mt-2 block leading-relaxed">{exp.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Checkbox: Special Medical / Behavioral Needs */}
            <div
              role="checkbox"
              aria-checked={formData.willingToAccommodateNeeds}
              tabIndex={0}
              onClick={() =>
                setFormData({
                  ...formData,
                  willingToAccommodateNeeds: !formData.willingToAccommodateNeeds,
                })
              }
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    willingToAccommodateNeeds: !formData.willingToAccommodateNeeds,
                  });
                }
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                formData.willingToAccommodateNeeds
                  ? 'border-[#183B2B] bg-[#EDF4F0]/60 ring-1 ring-[#183B2B]/20 shadow-xs'
                  : 'border-[#EAE4DC] bg-[#FAF7F2] hover:border-[#D5CEBF] hover:bg-white'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-sm text-[#181F1A] block">
                  Open to Special Medical or Behavioral Care
                </span>
                <span className="text-xs text-[#58625B] mt-0.5 block leading-relaxed">
                  Includes dietary management, senior joint supplements, medication administration, or structured desensitization
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  formData.willingToAccommodateNeeds
                    ? 'bg-[#183B2B] text-white shadow-xs'
                    : 'border-2 border-[#D5CEBF] bg-white'
                }`}
              >
                {formData.willingToAccommodateNeeds && <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-[#F2ECE4]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndShowResults}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B]"
            >
              <Sparkles className="w-4 h-4 text-[#EDF4F0]" />
              <span>Calculate Matches ({rankedDogs.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MATCH EXPLORER RESULTS */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
                Ranked Compatibility Recommendations ({rankedDogs.length})
              </h2>
              <p className="text-xs text-[#58625B] mt-0.5">
                Calculated using your preferences: {formData.preferredSizes.join(', ')} size • {formData.dailyTimeHours}h daily exercise • {formData.livingEnvironment.replace(/_/g, ' ')}
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(0)}
              className="text-xs font-bold text-[#183B2B] hover:underline flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Answers</span>
            </button>
          </div>

          <div className="space-y-4">
            {rankedDogs.map(({ dog, result }) => (
              <div
                key={dog.id}
                className={`bg-white rounded-3xl p-5 border transition-all shadow-xs hover:shadow-md ${
                  result.hardConstraintFailed
                    ? 'border-[#FCE8E2] bg-[#FFFBFB]'
                    : result.score >= 80
                    ? 'border-[#D8F3DC] hover:border-[#183B2B]'
                    : 'border-[#EAE4DC] hover:border-[#D5CEBF]'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Dog Image */}
                  <img
                    src={dog.photos[0]}
                    alt={dog.name}
                    className="w-full sm:w-36 sm:h-36 rounded-2xl object-cover flex-shrink-0"
                  />

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <h3 className="font-bold text-xl font-serif-heading text-[#181F1A]">
                            {dog.name}
                          </h3>
                          <span className="text-xs text-[#58625B]">
                            {dog.ageYears} yrs • {dog.gender}
                          </span>
                        </div>
                        <p className="text-xs text-[#58625B]">
                          {dog.breed} • {dog.shelterName} ({dog.location})
                        </p>
                      </div>

                      {/* Score Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                          result.hardConstraintFailed
                            ? 'bg-[#FAF0EC] text-[#B85438] border-[#FCE8E2]'
                            : result.score >= 80
                            ? 'bg-[#EDF4F0] text-[#183B2B] border-[#D8F3DC]'
                            : 'bg-[#FAF7F2] text-[#24533E] border-[#EAE4DC]'
                        }`}
                      >
                        {result.score}% Match — {result.verdict}
                      </span>
                    </div>

                    {/* Hard Constraint Failure Alert */}
                    {result.hardConstraintFailed && (
                      <div className="bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-3 rounded-xl text-xs flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#B85438]" />
                        <span className="font-medium">{result.hardConstraintReason}</span>
                      </div>
                    )}

                    {/* Positive Compatibility Highlights */}
                    {result.positiveHighlights.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#357457] tracking-wider block">
                          Why This Dog Matches Your Home:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                          {result.positiveHighlights.map((h, idx) => (
                            <div
                              key={idx}
                              className="text-[#24533E] flex items-center space-x-1.5 bg-[#EDF4F0]/70 p-2 rounded-xl"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#357457] flex-shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Potential Challenges & Care Considerations */}
                    {result.potentialChallenges.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-[#B85438] tracking-wider block">
                          Care Considerations To Keep In Mind:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                          {result.potentialChallenges.map((c, idx) => (
                            <div
                              key={idx}
                              className="text-[#963F28] flex items-center space-x-1.5 bg-[#FAF0EC]/70 p-2 rounded-xl"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-[#B85438] flex-shrink-0" />
                              <span className="truncate">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Temperament Tags & Action */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F2ECE4]">
                      <div className="flex flex-wrap gap-1">
                        {dog.temperament.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#FAF7F2] border border-[#EAE4DC] text-[#58625B] text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onOpenDogModal(dog)}
                        className="px-4 py-1.5 bg-[#183B2B] hover:bg-[#24533E] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                      >
                        <span>Full Breakdown & Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
