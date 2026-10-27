import React, { useState } from 'react';
import {
  X,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  Sparkles,
  PlayCircle,
  Award,
  Check,
} from 'lucide-react';
import { Dog, AdopterLifestylePreferences, Shelter } from '../../types';
import { calculateCompatibility } from '../matching/matchingEngine';

interface DogDetailModalProps {
  dog: Dog | null;
  shelter?: Shelter;
  isOpen: boolean;
  onClose: () => void;
  adopterPreferences: AdopterLifestylePreferences | null;
  isSaved: boolean;
  onToggleSave: (dogId: string) => void;
  onApply: (dog: Dog) => void;
  onNavigateToMatching: () => void;
  onNavigateToVisits: () => void;
}

export const DogDetailModal: React.FC<DogDetailModalProps> = ({
  dog,
  shelter,
  isOpen,
  onClose,
  adopterPreferences,
  isSaved,
  onToggleSave,
  onApply,
  onNavigateToMatching,
  onNavigateToVisits,
}) => {
  if (!isOpen || !dog) return null;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const matchResult = calculateCompatibility(adopterPreferences, dog);

  const getScoreBadgeClass = (score: number) => {
    if (matchResult.hardConstraintFailed) return 'text-[#B85438] bg-[#FAF0EC] border-[#FCE8E2]';
    if (score >= 85) return 'text-[#183B2B] bg-[#EDF4F0] border-[#D8F3DC]';
    if (score >= 70) return 'text-[#24533E] bg-[#FAF7F2] border-[#EAE4DC]';
    return 'text-[#B85438] bg-[#FAF0EC] border-[#FCE8E2]';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE4DC] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white border-b border-[#EAE4DC] px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#181F1A]">
              {dog.name}
            </h2>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                dog.status === 'available'
                  ? 'bg-[#EDF4F0] text-[#183B2B]'
                  : dog.status === 'pending_adoption'
                  ? 'bg-[#FAF0EC] text-[#B85438]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {dog.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleSave(dog.id)}
              className="p-2 rounded-xl border border-[#EAE4DC] text-[#B85438] hover:bg-[#FAF0EC] transition flex items-center space-x-1.5 text-xs font-semibold"
              title={isSaved ? 'Remove from saved' : 'Save to favorites'}
            >
              <Heart className="w-4 h-4" fill={isSaved ? '#B85438' : 'none'} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#58625B] hover:bg-[#F2ECE4] transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Hero Photos & Media */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-84 bg-[#EAE4DC] shadow-inner group">
              {showVideo && dog.videoUrl ? (
                <iframe
                  src={dog.videoUrl}
                  title={`${dog.name} video`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={dog.photos[activePhotoIndex] || dog.photos[0]}
                  alt={`${dog.name} photo`}
                  className="w-full h-full object-cover transition duration-300"
                />
              )}

              {dog.videoUrl && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xs transition flex items-center space-x-1.5 shadow-md"
                >
                  <PlayCircle className="w-4 h-4 text-[#EDF4F0]" />
                  <span>{showVideo ? 'Photos' : 'Video'}</span>
                </button>
              )}
            </div>

            {/* Photo Thumbnails */}
            {dog.photos.length > 1 && !showVideo && (
              <div className="flex space-x-2">
                {dog.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      activePhotoIndex === index
                        ? 'border-[#183B2B] scale-105 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Ribbon */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#8B958E] block text-[10px] uppercase font-semibold">Breed</span>
              <span className="font-bold text-[#181F1A]">{dog.breed}</span>
            </div>
            <div>
              <span className="text-[#8B958E] block text-[10px] uppercase font-semibold">Age & Gender</span>
              <span className="font-bold text-[#181F1A] capitalize">
                {dog.ageYears} yrs • {dog.gender}
              </span>
            </div>
            <div>
              <span className="text-[#8B958E] block text-[10px] uppercase font-semibold">Energy & Size</span>
              <span className="font-bold text-[#181F1A] capitalize">
                {dog.energyLevel.replace('_', ' ')} • {dog.size}
              </span>
            </div>
            <div>
              <span className="text-[#8B958E] block text-[10px] uppercase font-semibold">Adoption Fee</span>
              <span className="font-bold text-[#183B2B]">${dog.adoptionFee}</span>
            </div>
          </div>

          {/* Explainable Compatibility Match Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE4DC] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F2ECE4] gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#357457]" />
                <h3 className="font-bold font-serif-heading text-[#181F1A] text-base">
                  Explainable Lifestyle Compatibility
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${getScoreBadgeClass(matchResult.score)}`}>
                {matchResult.score}% Compatibility — {matchResult.verdict}
              </span>
            </div>

            {/* Hard Constraint Alert if applicable */}
            {matchResult.hardConstraintFailed && (
              <div className="bg-[#FAF0EC] border border-[#FCE8E2] rounded-xl p-3 flex items-start space-x-2.5 text-xs text-[#963F28]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#B85438]" />
                <div>
                  <h4 className="font-bold text-xs text-[#B85438]">
                    Animal Welfare Constraint Triggered
                  </h4>
                  <p className="mt-0.5">{matchResult.hardConstraintReason}</p>
                </div>
              </div>
            )}

            {/* Score Breakdown (5 categories) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                <div className="text-[10px] text-[#58625B] font-medium">Household</div>
                <div className="font-bold text-xs text-[#181F1A] mt-0.5">
                  {matchResult.breakdown.householdCompatibilityScore}/25
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                <div className="text-[10px] text-[#58625B] font-medium">Activity Fit</div>
                <div className="font-bold text-xs text-[#181F1A] mt-0.5">
                  {matchResult.breakdown.activityScore}/25
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                <div className="text-[10px] text-[#58625B] font-medium">Living Space</div>
                <div className="font-bold text-xs text-[#181F1A] mt-0.5">
                  {matchResult.breakdown.environmentScore}/20
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                <div className="text-[10px] text-[#58625B] font-medium">Experience</div>
                <div className="font-bold text-xs text-[#181F1A] mt-0.5">
                  {matchResult.breakdown.experienceScore}/15
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                <div className="text-[10px] text-[#58625B] font-medium">Schedule</div>
                <div className="font-bold text-xs text-[#181F1A] mt-0.5">
                  {matchResult.breakdown.scheduleScore}/15
                </div>
              </div>
            </div>

            {/* Highlights & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              {matchResult.positiveHighlights.length > 0 && (
                <div className="bg-[#EDF4F0]/70 p-3 rounded-xl border border-[#D8F3DC] space-y-1">
                  <span className="font-bold text-[#183B2B] flex items-center space-x-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#357457]" />
                    <span>Key Synergy Factors</span>
                  </span>
                  <ul className="space-y-1 text-[#24533E] text-[11px]">
                    {matchResult.positiveHighlights.map((h, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span>•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchResult.potentialChallenges.length > 0 && (
                <div className="bg-[#FAF0EC]/70 p-3 rounded-xl border border-[#FCE8E2] space-y-1">
                  <span className="font-bold text-[#B85438] flex items-center space-x-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B85438]" />
                    <span>Care Considerations</span>
                  </span>
                  <ul className="space-y-1 text-[#963F28] text-[11px]">
                    {matchResult.potentialChallenges.map((c, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-[#58625B]">
              <span className="italic">* Deterministic lifestyle match based on your questionnaire.</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMatching();
                }}
                className="text-[#183B2B] font-semibold underline hover:text-[#24533E]"
              >
                Edit Questionnaire →
              </button>
            </div>
          </div>

          {/* Story & Personality */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE4DC] shadow-xs space-y-2.5">
            <h3 className="font-bold font-serif-heading text-[#181F1A] text-base">
              {dog.name}'s Story & Personality
            </h3>
            <p className="text-xs sm:text-sm text-[#2D372E] leading-relaxed whitespace-pre-line">
              {dog.backstory}
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-semibold text-[#8B958E] uppercase tracking-wider block mb-1.5">
                Temperament Traits
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dog.temperament.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] text-xs font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Compatibility & Veterinary Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Social Fit */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE4DC] shadow-xs space-y-2">
              <h3 className="font-bold font-serif-heading text-[#181F1A] text-sm">
                Social Compatibility
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                  <span className="text-[#58625B]">Children</span>
                  <span className="font-semibold text-[#181F1A]">
                    {dog.goodWith.children ? 'Gentle & Patient' : 'Adults Only'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                  <span className="text-[#58625B]">Resident Cats</span>
                  <span className="font-semibold text-[#181F1A]">
                    {dog.goodWith.cats ? 'Safe Coexistence' : 'No Cats (Prey Drive)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                  <span className="text-[#58625B]">Other Dogs</span>
                  <span className="font-semibold text-[#181F1A]">
                    {dog.goodWith.otherDogs ? 'Dog-Social' : 'Single Dog Preferred'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#58625B]">Housing Space</span>
                  <span className="font-semibold text-[#181F1A] capitalize">
                    {dog.spaceRequired.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Verification */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE4DC] shadow-xs space-y-2">
              <h3 className="font-bold font-serif-heading text-[#181F1A] text-sm">
                Veterinary Verification
              </h3>
              <div className="space-y-1.5 text-[#181F1A]">
                <div className="flex items-center space-x-2 py-0.5">
                  <Check className="w-3.5 h-3.5 text-[#357457]" />
                  <span>Vaccinations Up to Date</span>
                </div>
                <div className="flex items-center space-x-2 py-0.5">
                  <Check className="w-3.5 h-3.5 text-[#357457]" />
                  <span>Spayed / Neutered</span>
                </div>
                <div className="flex items-center space-x-2 py-0.5">
                  <Check className="w-3.5 h-3.5 text-[#357457]" />
                  <span>Microchipped</span>
                </div>
                {dog.medicalInfo.specialCare && (
                  <p className="text-[11px] text-[#58625B] pt-1 border-t border-[#F2ECE4]">
                    <strong>Note:</strong> {dog.medicalInfo.specialCare}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shelter Card */}
          <div className="bg-[#EDF4F0]/60 p-4 rounded-2xl border border-[#D8F3DC] text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Building2 className="w-5 h-5 text-[#357457] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#183B2B] block">
                  {dog.shelterName || shelter?.name || 'Rescue Partner'}
                </span>
                <span className="text-[#58625B] text-[11px] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{shelter?.address || dog.location}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="bg-white border-t border-[#EAE4DC] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-[#58625B]">
            <Award className="w-3.5 h-3.5 text-[#357457]" />
            <span>Adoptions include behavioral transition guidance and medical records.</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigateToVisits();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#181F1A] hover:bg-[#FAF7F2] transition"
            >
              Shelter Visits
            </button>
            <button
              disabled={dog.status !== 'available'}
              onClick={() => {
                onClose();
                onApply(dog);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 ${
                dog.status === 'available'
                  ? 'bg-[#183B2B] hover:bg-[#24533E] text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{dog.status === 'available' ? `Apply to Adopt ${dog.name}` : 'Not Available'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
