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
                  onClick={() => setCurrentStep(idx)}
                  className={`p-2.5 rounded-xl text-left transition flex items-center space-x-2.5 ${
                    isActive
                      ? 'bg-[#183B2B] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#EDF4F0] text-[#183B2B]'
                      : 'bg-[#FAF7F2] text-[#58625B] hover:bg-[#F2ECE4]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : isPast ? 'bg-[#357457] text-white' : 'bg-[#EAE4DC] text-[#58625B]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{step.title.split('. ')[1]}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-gray-200' : 'text-[#8B958E]'}`}>
                      {isActive ? 'In Progress' : isPast ? 'Completed' : 'Pending'}
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
        <div className="bg-white rounded-3xl p-6 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              1. Household Composition & Social Safety
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              These factors trigger animal welfare constraints to prevent placing dogs with prey drive near vulnerable pets or infants.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] hover:border-[#183B2B] transition cursor-pointer">
              <div>
                <span className="font-bold text-sm text-[#181F1A] block">Resident Cat(s)</span>
                <span className="text-xs text-[#58625B]">
                  Applies strict hard constraint against high-prey-drive breeds or cat-reactive rescues
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
                className="w-5 h-5 rounded text-[#183B2B] focus:ring-0 cursor-pointer accent-[#183B2B]"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] hover:border-[#183B2B] transition cursor-pointer">
              <div>
                <span className="font-bold text-sm text-[#181F1A] block">Young Children (&lt; 10 years old)</span>
                <span className="text-xs text-[#58625B]">
                  Ensures gentle, patient temperament suitable for fast movements and loud voices
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
                className="w-5 h-5 rounded text-[#183B2B] focus:ring-0 cursor-pointer accent-[#183B2B]"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] hover:border-[#183B2B] transition cursor-pointer">
              <div>
                <span className="font-bold text-sm text-[#181F1A] block">Other Resident Dogs</span>
                <span className="text-xs text-[#58625B]">
                  Matches dog-social temperaments and multi-dog household compatibility
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
                className="w-5 h-5 rounded text-[#183B2B] focus:ring-0 cursor-pointer accent-[#183B2B]"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2"
            >
              <span>Continue: Living Environment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LIVING ENVIRONMENT */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              2. Living Space & Preferred Size
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Ensures the dog's physical size and territory needs match your home.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Home Type & Yard Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: 'apartment_no_yard', label: 'Apartment / Condo (No Yard)' },
                  { id: 'apartment_balcony', label: 'Apartment with Balcony' },
                  { id: 'house_small_yard', label: 'House with Small Fenced Yard' },
                  { id: 'house_large_yard', label: 'House with Large Fenced Yard' },
                  { id: 'rural_ranch', label: 'Rural Property / Acreage' },
                ].map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, livingEnvironment: env.id as any })
                    }
                    className={`p-3 rounded-2xl border text-left font-medium transition ${
                      formData.livingEnvironment === env.id
                        ? 'border-[#183B2B] bg-[#EDF4F0] text-[#183B2B] font-semibold'
                        : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#183B2B]'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Preferred Dog Sizes
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['small', 'medium', 'large', 'giant'] as DogSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3.5 py-2 rounded-xl border capitalize font-medium transition ${
                      formData.preferredSizes.includes(size)
                        ? 'border-[#183B2B] bg-[#183B2B] text-white shadow-xs'
                        : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#183B2B]'
                    }`}
                  >
                    {size} ({size === 'small' ? '<25 lbs' : size === 'medium' ? '25-55 lbs' : size === 'large' ? '55-85 lbs' : '85+ lbs'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2"
            >
              <span>Continue: Routine & Energy</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ROUTINE & ENERGY */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              3. Activity Rhythm & Schedule
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Prevents energy mismatches where high-drive working breeds are placed in sedentary homes.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#181F1A] uppercase tracking-wider">
                  Dedicated Daily Exercise Time
                </label>
                <span className="font-bold text-[#183B2B] bg-[#EDF4F0] px-3 py-1 rounded-full">
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
                className="w-full accent-[#183B2B] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8B958E]">
                <span>0.5h (Relaxed stroll)</span>
                <span>2.0h (Active walks/park)</span>
                <span>4.0h (Running/Hiking)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Personal Activity Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'sedentary', label: 'Relaxed / Low-key' },
                  { id: 'light', label: 'Light (Daily strolls)' },
                  { id: 'moderate', label: 'Moderate (Active walks)' },
                  { id: 'very_active', label: 'Athletic (Run/Hike)' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, dailyActivityLevel: act.id as any })
                    }
                    className={`p-3 rounded-2xl border text-center font-medium transition ${
                      formData.dailyActivityLevel === act.id
                        ? 'border-[#183B2B] bg-[#EDF4F0] text-[#183B2B] font-semibold'
                        : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#183B2B]'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Work Routine & Hours Away
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'full_time', label: 'Full-time WFH' },
                  { id: 'hybrid', label: 'Hybrid (Part-time home)' },
                  { id: 'office', label: 'Office (Away 8+ hrs)' },
                ].map((wrk) => (
                  <button
                    key={wrk.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, workFromHome: wrk.id as any })
                    }
                    className={`p-3 rounded-2xl border text-center font-medium transition ${
                      formData.workFromHome === wrk.id
                        ? 'border-[#183B2B] bg-[#EDF4F0] text-[#183B2B] font-semibold'
                        : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#183B2B]'
                    }`}
                  >
                    {wrk.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2"
            >
              <span>Continue: Experience & Care</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: EXPERIENCE & CARE */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE4DC] shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE4] pb-3">
            <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
              4. Experience & Training Background
            </h2>
            <p className="text-xs text-[#58625B] mt-0.5">
              Assesses training readiness and accommodation for rescue transition requirements.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#181F1A] uppercase tracking-wider block mb-2">
                Dog Guardian Experience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'first_time', label: 'First-time Guardian', desc: 'Seeking gentle, forgiving dogs' },
                  { id: 'intermediate', label: 'Intermediate Guardian', desc: 'Comfortable with basic training' },
                  { id: 'experienced', label: 'Experienced Guardian', desc: 'Familiar with reactive/high-drive' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, experienceLevel: exp.id as any })
                    }
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      formData.experienceLevel === exp.id
                        ? 'border-[#183B2B] bg-[#EDF4F0] text-[#183B2B]'
                        : 'border-[#EAE4DC] bg-[#FAF7F2] text-[#181F1A] hover:border-[#183B2B]'
                    }`}
                  >
                    <span className="font-bold block">{exp.label}</span>
                    <span className="text-[11px] text-[#58625B] mt-0.5 block">{exp.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] hover:border-[#183B2B] transition cursor-pointer">
              <div>
                <span className="font-bold text-sm text-[#181F1A] block">
                  Open to Special Medical or Behavioral Needs
                </span>
                <span className="text-xs text-[#58625B]">
                  Such as dietary management, senior joint supplements, or structured positive reinforcement
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.willingToAccommodateNeeds}
                onChange={(e) =>
                  setFormData({ ...formData, willingToAccommodateNeeds: e.target.checked })
                }
                className="w-5 h-5 rounded text-[#183B2B] focus:ring-0 cursor-pointer accent-[#183B2B]"
              />
            </label>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleSaveAndShowResults}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#EDF4F0]" />
              <span>Save & View Ranked Matches</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MATCH EXPLORER RESULTS */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif-heading text-[#181F1A]">
              Ranked Compatibility Recommendations ({rankedDogs.length})
            </h2>
            <button
              onClick={() => setCurrentStep(0)}
              className="text-xs font-semibold text-[#183B2B] hover:underline"
            >
              ← Edit Questionnaire Answers
            </button>
          </div>

          <div className="space-y-4">
            {rankedDogs.map(({ dog, result }) => (
              <div
                key={dog.id}
                className={`bg-white rounded-3xl p-5 border transition shadow-xs hover:shadow-md ${
                  result.hardConstraintFailed
                    ? 'border-[#FCE8E2] bg-[#FFFBFB]'
                    : result.score >= 80
                    ? 'border-[#D8F3DC] hover:border-[#183B2B]'
                    : 'border-[#EAE4DC]'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Dog Image */}
                  <img
                    src={dog.photos[0]}
                    alt={dog.name}
                    className="w-full sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0"
                  />

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-xl font-serif-heading text-[#181F1A]">
                          {dog.name}
                        </h3>
                        <p className="text-xs text-[#58625B]">
                          {dog.breed} • {dog.ageYears} yrs • {dog.shelterName}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
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
                      <div className="bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-2.5 rounded-xl text-xs flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                        <span>{result.hardConstraintReason}</span>
                      </div>
                    )}

                    {/* Highlights & Challenges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                      {result.positiveHighlights.slice(0, 1).map((h, idx) => (
                        <div key={idx} className="text-[#24533E] flex items-center space-x-1.5 bg-[#EDF4F0]/60 p-2 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#357457] flex-shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                      {result.potentialChallenges.slice(0, 1).map((c, idx) => (
                        <div key={idx} className="text-[#963F28] flex items-center space-x-1.5 bg-[#FAF0EC]/60 p-2 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#B85438] flex-shrink-0" />
                          <span className="truncate">{c}</span>
                        </div>
                      ))}
                    </div>

                    {/* Profile Action */}
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onOpenDogModal(dog)}
                        className="text-xs font-bold text-[#183B2B] hover:text-[#24533E] flex items-center space-x-1"
                      >
                        <span>View Breakdown & Story</span>
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
