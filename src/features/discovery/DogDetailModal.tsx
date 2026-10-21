import React, { useState } from 'react';
import {
  X,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Activity,
  Home,
  Check,
  Building2,
  Sparkles,
  Info,
  PlayCircle,
  Clock,
  Award,
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

  const getScoreColor = (score: number) => {
    if (matchResult.hardConstraintFailed) return 'text-[#BA5536] bg-[#FFF3F0] border-[#FCE8E2]';
    if (score >= 85) return 'text-[#1B4332] bg-[#EBF7EE] border-[#D8F3DC]';
    if (score >= 70) return 'text-[#2D6A4F] bg-[#FAF8F5] border-[#D5CEBF]';
    return 'text-[#BA5536] bg-[#FFF3F0] border-[#FCE8E2]';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E6DFD5] overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-[#E6DFD5] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold font-serif-heading text-[#1B4332]">
              {dog.name}
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                dog.status === 'available'
                  ? 'bg-[#EBF7EE] text-[#1B4332]'
                  : dog.status === 'pending_adoption'
                  ? 'bg-[#FFF3F0] text-[#BA5536]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {dog.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleSave(dog.id)}
              className="p-2 rounded-xl border border-[#E6DFD5] text-[#BA5536] hover:bg-[#FFF3F0] transition flex items-center space-x-1.5 text-xs font-semibold"
              title={isSaved ? 'Remove from saved' : 'Save to favorites'}
            >
              <Heart className="w-4 h-4" fill={isSaved ? '#BA5536' : 'none'} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#5C675F] hover:bg-[#F4EFEA] transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photos & Media Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-[#E6DFD5] shadow-inner group">
                {showVideo && dog.videoUrl ? (
                  <iframe
                    src={dog.videoUrl}
                    title={`${dog.name} introduction video`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={dog.photos[activePhotoIndex] || dog.photos[0]}
                    alt={`${dog.name} photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover transition duration-300"
                  />
                )}

                {dog.videoUrl && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition flex items-center space-x-1.5 shadow-md"
                  >
                    <PlayCircle className="w-4 h-4 text-[#52B788]" />
                    <span>{showVideo ? 'Show Photos' : 'Watch Video'}</span>
                  </button>
                )}
              </div>

              {/* Photo Thumbnails */}
              {dog.photos.length > 1 && !showVideo && (
                <div className="flex space-x-2 pt-1">
                  {dog.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePhotoIndex(index)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        activePhotoIndex === index
                          ? 'border-[#1B4332] scale-105 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="md:col-span-4 flex flex-col justify-between space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] space-y-3">
                <div className="border-b border-[#F4EFEA] pb-2">
                  <span className="text-xs text-[#8E9991] uppercase tracking-wider font-semibold">
                    Breed & Age
                  </span>
                  <div className="text-sm font-bold text-[#1C241E]">{dog.breed}</div>
                  <div className="text-xs text-[#5C675F]">
                    {dog.ageYears} years old ({dog.ageGroup})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FAF8F5] p-2 rounded-lg">
                    <span className="text-[#8E9991] block">Size</span>
                    <span className="font-semibold text-[#1C241E] capitalize">{dog.size}</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-lg">
                    <span className="text-[#8E9991] block">Gender</span>
                    <span className="font-semibold text-[#1C241E] capitalize">{dog.gender}</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-lg">
                    <span className="text-[#8E9991] block">Energy</span>
                    <span className="font-semibold text-[#1C241E] capitalize">
                      {dog.energyLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-lg">
                    <span className="text-[#8E9991] block">Daily Exercise</span>
                    <span className="font-semibold text-[#1C241E]">
                      {dog.minDailyExerciseHours}h / day
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F4EFEA] flex justify-between items-center text-xs">
                  <span className="text-[#8E9991]">Adoption Fee</span>
                  <span className="font-bold text-[#1B4332] text-sm">${dog.adoptionFee}</span>
                </div>
              </div>

              {/* Shelter Card */}
              <div className="bg-[#EBF7EE] p-4 rounded-2xl border border-[#D8F3DC] text-xs space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[#1B4332] font-bold">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{dog.shelterName || shelter?.name || 'Rescue Partner'}</span>
                </div>
                <p className="text-[#2D6A4F] flex items-center space-x-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{shelter?.address || dog.location}</span>
                </p>
                <p className="text-[#5C675F] text-[11px] pt-1">
                  Visits & meet-and-greets are coordinated through PawPair with certified staff.
                </p>
              </div>
            </div>
          </div>

          {/* Explainable Compatibility Match Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFEA] gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
                <h3 className="font-bold font-serif-heading text-[#1B4332] text-lg">
                  Explainable Lifestyle Compatibility
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(matchResult.score)}`}>
                  {matchResult.score}% Compatibility — {matchResult.verdict}
                </span>
              </div>
            </div>

            {/* Animal Welfare Hard Constraint Alert if applicable */}
            {matchResult.hardConstraintFailed && (
              <div className="bg-[#FFF3F0] border border-[#FCE8E2] rounded-xl p-3.5 flex items-start space-x-3 text-xs text-[#9E4732]">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#BA5536]" />
                <div>
                  <h4 className="font-bold text-sm text-[#BA5536] mb-0.5">
                    Critical Welfare & Safety Constraint Triggered
                  </h4>
                  <p>{matchResult.hardConstraintReason}</p>
                </div>
              </div>
            )}

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5C675F] font-medium">Household</span>
                  <span className="font-bold text-[#1B4332]">
                    {matchResult.breakdown.householdCompatibilityScore}/25
                  </span>
                </div>
                <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D6A4F] h-full rounded-full"
                    style={{ width: `${(matchResult.breakdown.householdCompatibilityScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5C675F] font-medium">Activity Fit</span>
                  <span className="font-bold text-[#1B4332]">
                    {matchResult.breakdown.activityScore}/25
                  </span>
                </div>
                <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D6A4F] h-full rounded-full"
                    style={{ width: `${(matchResult.breakdown.activityScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5C675F] font-medium">Living Space</span>
                  <span className="font-bold text-[#1B4332]">
                    {matchResult.breakdown.environmentScore}/20
                  </span>
                </div>
                <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D6A4F] h-full rounded-full"
                    style={{ width: `${(matchResult.breakdown.environmentScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5C675F] font-medium">Experience</span>
                  <span className="font-bold text-[#1B4332]">
                    {matchResult.breakdown.experienceScore}/15
                  </span>
                </div>
                <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D6A4F] h-full rounded-full"
                    style={{ width: `${(matchResult.breakdown.experienceScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5C675F] font-medium">Schedule</span>
                  <span className="font-bold text-[#1B4332]">
                    {matchResult.breakdown.scheduleScore}/15
                  </span>
                </div>
                <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D6A4F] h-full rounded-full"
                    style={{ width: `${(matchResult.breakdown.scheduleScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Positive Factors & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              {matchResult.positiveHighlights.length > 0 && (
                <div className="bg-[#EBF7EE]/60 p-3.5 rounded-xl space-y-2 border border-[#D8F3DC]">
                  <span className="font-bold text-[#1B4332] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Key Synergy Factors</span>
                  </span>
                  <ul className="space-y-1 text-[#2D6A4F]">
                    {matchResult.positiveHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-[#52B788]">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchResult.potentialChallenges.length > 0 && (
                <div className="bg-[#FFF3F0]/60 p-3.5 rounded-xl space-y-2 border border-[#FCE8E2]">
                  <span className="font-bold text-[#BA5536] flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#BA5536]" />
                    <span>Lifestyle Considerations & Challenges</span>
                  </span>
                  <ul className="space-y-1 text-[#9E4732]">
                    {matchResult.potentialChallenges.map((challenge, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-[#BA5536]">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#5C675F] pt-2">
              <span className="italic">
                * Scored deterministically based on your lifestyle profile answers.
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMatching();
                }}
                className="text-[#1B4332] font-semibold underline hover:text-[#2D6A4F]"
              >
                Edit Lifestyle Questionnaire →
              </button>
            </div>
          </div>

          {/* Backstory & Personality */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] shadow-xs space-y-3">
            <h3 className="font-bold font-serif-heading text-[#1B4332] text-lg">
              {dog.name}'s Story & Personality
            </h3>
            <p className="text-sm text-[#2D372E] leading-relaxed whitespace-pre-line">
              {dog.backstory}
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-[#8E9991] uppercase tracking-wider block mb-2">
                Personality Traits
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dog.temperament.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#F4EFEA] text-[#1B4332] text-xs font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Compatibility & Medical Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Household Social Fit */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] shadow-xs space-y-3">
              <h3 className="font-bold font-serif-heading text-[#1B4332] text-base">
                Social Compatibility
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#2D372E]">Good with children</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      dog.goodWith.children
                        ? 'bg-[#EBF7EE] text-[#1B4332]'
                        : 'bg-[#FFF3F0] text-[#BA5536]'
                    }`}
                  >
                    {dog.goodWith.children ? 'Yes, gentle' : 'Adults only'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#2D372E]">Good with cats</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      dog.goodWith.cats
                        ? 'bg-[#EBF7EE] text-[#1B4332]'
                        : 'bg-[#FFF3F0] text-[#BA5536]'
                    }`}
                  >
                    {dog.goodWith.cats ? 'Yes, coexists safely' : 'No cats (High prey drive)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#2D372E]">Good with other dogs</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      dog.goodWith.otherDogs
                        ? 'bg-[#EBF7EE] text-[#1B4332]'
                        : 'bg-[#FFF3F0] text-[#BA5536]'
                    }`}
                  >
                    {dog.goodWith.otherDogs ? 'Yes, dog-social' : 'Only dog preferred'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#2D372E]">Housing requirement</span>
                  <span className="font-semibold text-[#1C241E] capitalize">
                    {dog.spaceRequired.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical & Veterinary Info */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] shadow-xs space-y-3">
              <h3 className="font-bold font-serif-heading text-[#1B4332] text-base">
                Veterinary & Health Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#1B4332]">
                  <Check className="w-4 h-4 text-[#52B788]" />
                  <span>Vaccinations up to date</span>
                </div>
                <div className="flex items-center space-x-2 text-[#1B4332]">
                  <Check className="w-4 h-4 text-[#52B788]" />
                  <span>Spayed / Neutered</span>
                </div>
                <div className="flex items-center space-x-2 text-[#1B4332]">
                  <Check className="w-4 h-4 text-[#52B788]" />
                  <span>Microchipped</span>
                </div>

                {dog.medicalInfo.specialCare && (
                  <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E6DFD5] text-[#5C675F] mt-2">
                    <span className="font-semibold text-[#1C241E] block mb-0.5">Special Care:</span>
                    <span>{dog.medicalInfo.specialCare}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="bg-white border-t border-[#E6DFD5] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-[#5C675F]">
            <Award className="w-4 h-4 text-[#2D6A4F]" />
            <span>Shelter placement includes post-adoption behavioral support.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigateToVisits();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#D5CEBF] text-xs font-semibold text-[#1B4332] hover:bg-[#FAF8F5] transition"
            >
              Group Shelter Visits
            </button>
            <button
              disabled={dog.status !== 'available'}
              onClick={() => {
                onClose();
                onApply(dog);
              }}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 ${
                dog.status === 'available'
                  ? 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white'
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
