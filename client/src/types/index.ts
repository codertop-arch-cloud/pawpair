export type DogSize = 'small' | 'medium' | 'large' | 'giant';
export type DogEnergy = 'low' | 'moderate' | 'high' | 'very_high';
export type DogAgeGroup = 'puppy' | 'young' | 'adult' | 'senior';
export type DogStatus = 'available' | 'pending_adoption' | 'adopted' | 'foster_care';
export type SpaceRequirement = 'apartment_friendly' | 'needs_yard' | 'large_property';
export type ExperienceLevel = 'first_time' | 'intermediate' | 'experienced';

export interface MedicalInfo {
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  specialCare?: string;
  knownConditions?: string[];
}

export interface GoodWith {
  children: boolean;
  cats: boolean;
  otherDogs: boolean;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  ageGroup: DogAgeGroup;
  size: DogSize;
  gender: 'male' | 'female';
  energyLevel: DogEnergy;
  temperament: string[];
  location: string;
  shelterId: string;
  shelterName?: string;
  photos: string[];
  videoUrl?: string;
  backstory: string;
  specialNeeds: string[];
  medicalInfo: MedicalInfo;
  goodWith: GoodWith;
  spaceRequired: SpaceRequirement;
  minDailyExerciseHours: number;
  experienceLevelNeeded: ExperienceLevel;
  adoptionFee: number;
  status: DogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  photoUrl: string;
  verified: boolean;
  directorName: string;
  operatingHours: string;
  foundedYear: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'adopter' | 'shelter_staff';
  shelterId?: string;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  password?: string;
  bio?: string;
  createdAt?: string;
}

export interface AdopterLifestylePreferences {
  preferredSizes: DogSize[];
  preferredAges: DogAgeGroup[];
  dailyActivityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  dailyTimeHours: number;
  livingEnvironment: 'apartment_no_yard' | 'apartment_balcony' | 'house_small_yard' | 'house_large_yard' | 'rural_ranch';
  experienceLevel: ExperienceLevel;
  householdPets: {
    hasCats: boolean;
    hasDogs: boolean;
    hasKids: boolean;
  };
  willingToAccommodateNeeds: boolean;
  workFromHome: 'full_time' | 'hybrid' | 'office';
}

export interface CompatibilityFactor {
  category: string;
  name: string;
  earned: number;
  max: number;
  status: 'positive' | 'neutral' | 'warning' | 'incompatible';
  detail: string;
}

export interface MatchResult {
  score: number;
  verdict: 'Exceptional Match' | 'Great Match' | 'Moderate Match' | 'Challenging Match' | 'Not Recommended';
  breakdown: {
    activityScore: number; // max 25
    environmentScore: number; // max 20
    experienceScore: number; // max 15
    householdCompatibilityScore: number; // max 25
    scheduleScore: number; // max 15
  };
  factors: CompatibilityFactor[];
  positiveHighlights: string[];
  potentialChallenges: string[];
  careConsiderations: string[];
  hardConstraintFailed: boolean;
  hardConstraintReason?: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'more_info_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  actorName: string;
}

export interface AdoptionApplication {
  id: string;
  dogId: string;
  dogName: string;
  dogPhoto: string;
  shelterId: string;
  shelterName: string;
  adopterId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  address: string;
  housingType: 'own_house' | 'rent_house' | 'rent_apartment';
  hasYard: boolean;
  landlordApproval?: boolean;
  hoursAlonePerDay: number;
  householdMembers: string;
  existingPetsDetails: string;
  vetReference?: {
    clinicName: string;
    phone: string;
  };
  experienceDescription: string;
  reasonForAdopting: string;
  status: ApplicationStatus;
  shelterNotes?: string;
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type VisitStatus = 'upcoming' | 'completed' | 'cancelled';

export interface ShelterVisit {
  id: string;
  shelterId: string;
  shelterName: string;
  shelterAddress: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number;
  participantCount: number;
  status: VisitStatus;
  createdAt: string;
}

export interface VisitParticipant {
  id: string;
  visitId: string;
  userId: string;
  userName: string;
  userEmail: string;
  notes?: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled';
}
