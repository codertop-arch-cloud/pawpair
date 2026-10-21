import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Home,
  Clock,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Dog, UserProfile, AdoptionApplication } from '../../types';
import { dataStore } from '../../services/dataService';

interface AdoptionApplicationModalProps {
  dog: Dog | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onApplicationSuccess: (application: AdoptionApplication) => void;
}

export const AdoptionApplicationModal: React.FC<AdoptionApplicationModalProps> = ({
  dog,
  isOpen,
  onClose,
  currentUser,
  onApplicationSuccess,
}) => {
  if (!isOpen || !dog) return null;

  const [applicantName, setApplicantName] = useState(currentUser.fullName);
  const [applicantEmail, setApplicantEmail] = useState(currentUser.email);
  const [applicantPhone, setApplicantPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState('742 Bellevue Way NE, Apt 4B, Bellevue, WA');
  const [housingType, setHousingType] = useState<'own_house' | 'rent_house' | 'rent_apartment'>('rent_apartment');
  const [hasYard, setHasYard] = useState(false);
  const [landlordApproval, setLandlordApproval] = useState(true);
  const [hoursAlonePerDay, setHoursAlonePerDay] = useState(4);
  const [householdMembers, setHouseholdMembers] = useState('1 adult, quiet household');
  const [existingPetsDetails, setExistingPetsDetails] = useState('1 adult indoor cat');
  const [vetClinicName, setVetClinicName] = useState('Lake Union Veterinary Clinic');
  const [vetPhone, setVetPhone] = useState('(206) 555-9081');
  const [experienceDescription, setExperienceDescription] = useState(
    'Grew up with family rescue dogs, experienced with daily routine and positive reinforcement.'
  );
  const [reasonForAdopting, setReasonForAdopting] = useState(
    `We feel an immediate connection with ${dog.name}'s personality and are eager to provide a loving, permanent home.`
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!applicantName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setErrorMessage('Please provide a valid contact email address.');
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please provide a valid 10-digit phone number for phone screening.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your primary residential address.');
      return;
    }
    if (housingType !== 'own_house' && !landlordApproval) {
      setErrorMessage('You must confirm landlord pet approval before submitting an adoption application.');
      return;
    }
    if (hoursAlonePerDay < 0 || hoursAlonePerDay > 24) {
      setErrorMessage('Hours alone per day must be between 0 and 24.');
      return;
    }
    if (!reasonForAdopting.trim() || reasonForAdopting.length < 15) {
      setErrorMessage('Please share a few sentences describing why you wish to adopt this dog.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please confirm agreement with the animal welfare and honesty declaration.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newApp = dataStore.submitApplication({
        dogId: dog.id,
        adopterId: currentUser.id,
        applicantName,
        applicantEmail,
        applicantPhone,
        address,
        housingType,
        hasYard,
        landlordApproval: housingType === 'own_house' ? true : landlordApproval,
        hoursAlonePerDay,
        householdMembers,
        existingPetsDetails,
        vetReference: vetClinicName ? { clinicName: vetClinicName, phone: vetPhone } : undefined,
        experienceDescription,
        reasonForAdopting,
      });

      setIsSubmitting(false);
      onApplicationSuccess(newApp);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit application. Please check your inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E6DFD5] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#E6DFD5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#E6DFD5] flex-shrink-0">
              <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
                Adoption Application for {dog.name}
              </h2>
              <p className="text-xs text-[#5C675F]">
                {dog.breed} • Managed by {dog.shelterName || 'Shelter Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5C675F] hover:bg-[#F4EFEA] transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="bg-[#FFF3F0] border border-[#FCE8E2] text-[#BA5536] p-4 rounded-xl text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Submission Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: Contact Information */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#2D6A4F]" />
              <span>1. Applicant Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Housing & Routine */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332] flex items-center space-x-2">
              <Home className="w-4 h-4 text-[#2D6A4F]" />
              <span>2. Housing & Daily Routine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Housing Type</label>
                <select
                  value={housingType}
                  onChange={(e) => setHousingType(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="own_house">Own Single-Family House</option>
                  <option value="rent_house">Rent House</option>
                  <option value="rent_apartment">Rent Apartment / Condo</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">
                  Average Hours Dog Alone Per Day
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hoursAlonePerDay}
                  onChange={(e) => setHoursAlonePerDay(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasYard}
                  onChange={(e) => setHasYard(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B4332] focus:ring-0"
                />
                <span className="font-medium text-[#1C241E]">Property has fully fenced yard</span>
              </label>

              {housingType !== 'own_house' && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={landlordApproval}
                    onChange={(e) => setLandlordApproval(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-0"
                  />
                  <span className="font-medium text-[#1C241E]">
                    Landlord / HOA allows dogs of this size & breed
                  </span>
                </label>
              )}
            </div>

            <div className="text-xs">
              <label className="font-semibold text-[#1C241E] block mb-1">
                Household Members (Ages & counts)
              </label>
              <input
                type="text"
                value={householdMembers}
                onChange={(e) => setHouseholdMembers(e.target.value)}
                placeholder="e.g. 2 adults, 1 teen (age 14)"
                className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          {/* Section 3: Pet Experience & Vet Reference */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332] flex items-center space-x-2">
              <Heart className="w-4 h-4 text-[#2D6A4F]" />
              <span>3. Pet Experience & Veterinary Reference</span>
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">
                  Existing Pets in Household (Species, age, spay/neuter status)
                </label>
                <input
                  type="text"
                  value={existingPetsDetails}
                  onChange={(e) => setExistingPetsDetails(e.target.value)}
                  placeholder="e.g., 1 neutered domestic cat (age 8), up to date on vaccines"
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">
                    Veterinarian / Clinic Name
                  </label>
                  <input
                    type="text"
                    value={vetClinicName}
                    onChange={(e) => setVetClinicName(e.target.value)}
                    placeholder="e.g. Cascade Pet Hospital"
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">
                    Clinic Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">
                  Describe Your Dog Care & Training Philosophy
                </label>
                <textarea
                  rows={2}
                  value={experienceDescription}
                  onChange={(e) => setExperienceDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">
                  Why is {dog.name} the right match for your family? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reasonForAdopting}
                  onChange={(e) => setReasonForAdopting(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6DFD5] text-xs space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#1B4332] focus:ring-0 mt-0.5"
              />
              <span className="text-[#2D372E] leading-relaxed">
                I certify that all information provided is accurate and truthful. I understand that an application does not guarantee adoption and that rescue staff make adoption decisions based on animal welfare and lifelong suitability.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D5CEBF] text-xs font-semibold text-[#5C675F] hover:bg-[#FAF8F5] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition shadow-xs flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#52B788]" />
              <span>{isSubmitting ? 'Submitting Application...' : `Submit Application for ${dog.name}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
