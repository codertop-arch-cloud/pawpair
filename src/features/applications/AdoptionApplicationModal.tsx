import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertCircle,
  Building2,
  Home,
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
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE4DC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#EAE4DC] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#EAE4DC] flex-shrink-0">
              <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
                Adoption Application for {dog.name}
              </h2>
              <p className="text-xs text-[#58625B]">
                {dog.breed} • Managed by {dog.shelterName || 'Shelter Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#58625B] hover:bg-[#F2ECE4] transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Application Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: Applicant Information */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE4DC] space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B2B] flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#357457]" />
              <span>1. Applicant Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Housing & Household */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE4DC] space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B2B] flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5 text-[#357457]" />
              <span>2. Housing & Routine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Housing Type</label>
                <select
                  value={housingType}
                  onChange={(e) => setHousingType(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                >
                  <option value="own_house">Own Single-Family House</option>
                  <option value="rent_house">Rent Single-Family House</option>
                  <option value="rent_apartment">Rent Apartment / Condo</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">
                  Average Hours Dog Alone / Day
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hoursAlonePerDay}
                  onChange={(e) => setHoursAlonePerDay(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasYard}
                  onChange={(e) => setHasYard(e.target.checked)}
                  className="w-4 h-4 rounded text-[#183B2B] focus:ring-0 accent-[#183B2B]"
                />
                <span className="font-medium text-[#181F1A]">Property has fully fenced yard</span>
              </label>

              {housingType !== 'own_house' && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={landlordApproval}
                    onChange={(e) => setLandlordApproval(e.target.checked)}
                    className="w-4 h-4 rounded text-[#183B2B] focus:ring-0 accent-[#183B2B]"
                  />
                  <span className="font-medium text-[#181F1A]">
                    Landlord / HOA confirms dog permission
                  </span>
                </label>
              )}
            </div>

            <div className="text-xs">
              <label className="font-semibold text-[#181F1A] block mb-1">
                Household Members
              </label>
              <input
                type="text"
                value={householdMembers}
                onChange={(e) => setHouseholdMembers(e.target.value)}
                placeholder="e.g. 1 adult, quiet home"
                className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
              />
            </div>
          </div>

          {/* Section 3: Pet Experience & Vet Reference */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE4DC] space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B2B] flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-[#357457]" />
              <span>3. Pet Experience & Veterinary Reference</span>
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">
                  Existing Pets in Household
                </label>
                <input
                  type="text"
                  value={existingPetsDetails}
                  onChange={(e) => setExistingPetsDetails(e.target.value)}
                  placeholder="e.g. 1 adult cat, vaccinated"
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">
                    Veterinary Clinic Name
                  </label>
                  <input
                    type="text"
                    value={vetClinicName}
                    onChange={(e) => setVetClinicName(e.target.value)}
                    placeholder="e.g. Cascade Pet Hospital"
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">
                    Clinic Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">
                  Why is {dog.name} the right match for your home? *
                </label>
                <textarea
                  rows={2}
                  required
                  value={reasonForAdopting}
                  onChange={(e) => setReasonForAdopting(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4DC] text-xs space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#183B2B] focus:ring-0 mt-0.5 accent-[#183B2B]"
              />
              <span className="text-[#58625B] leading-relaxed text-[11px]">
                I certify that all information provided is accurate and truthful. I understand that an application does not guarantee adoption and that rescue staff make adoption decisions based on animal welfare and lifelong suitability.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EAE4DC] text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              id="btn-submit-app-confirm"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold transition shadow-xs flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#EDF4F0]" />
              <span>{isSubmitting ? 'Submitting...' : `Submit Application for ${dog.name}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
