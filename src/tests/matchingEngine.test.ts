import { describe, it, expect } from 'vitest';
import { calculateCompatibility } from '../features/matching/matchingEngine';
import { Dog, AdopterLifestylePreferences } from '../types';

const mockDog: Dog = {
  id: 'dog-1',
  name: 'Barnaby',
  breed: 'Golden Retriever Mix',
  ageYears: 3,
  ageGroup: 'adult',
  size: 'large',
  gender: 'male',
  energyLevel: 'moderate',
  temperament: ['Gentle', 'Loyal', 'Friendly'],
  location: 'Seattle, WA',
  shelterId: 'shelter-1',
  photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d'],
  backstory: 'Surrendered due to owner moving abroad; loved by all staff.',
  specialNeeds: [],
  medicalInfo: { vaccinated: true, neutered: true, microchipped: true },
  goodWith: { children: true, cats: true, otherDogs: true },
  spaceRequired: 'apartment_friendly',
  minDailyExerciseHours: 1.5,
  experienceLevelNeeded: 'first_time',
  adoptionFee: 150,
  status: 'available',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockCatUnsafeDog: Dog = {
  ...mockDog,
  id: 'dog-2',
  name: 'Hunter',
  breed: 'Terrier Hound Mix',
  goodWith: { children: true, cats: false, otherDogs: true },
  energyLevel: 'high',
  minDailyExerciseHours: 2.5,
  spaceRequired: 'needs_yard',
  experienceLevelNeeded: 'experienced',
};

const mockIdealAdopter: AdopterLifestylePreferences = {
  preferredSizes: ['large', 'medium'],
  preferredAges: ['adult'],
  dailyActivityLevel: 'moderate',
  dailyTimeHours: 2,
  livingEnvironment: 'house_small_yard',
  experienceLevel: 'intermediate',
  householdPets: { hasCats: true, hasDogs: false, hasKids: true },
  willingToAccommodateNeeds: true,
  workFromHome: 'hybrid',
};

describe('PawPair Matching Engine', () => {
  it('handles missing adopter questionnaire gracefully', () => {
    const result = calculateCompatibility(null, mockDog);
    expect(result.score).toBe(50);
    expect(result.verdict).toBe('Moderate Match');
    expect(result.factors[0].name).toContain('Questionnaire Incomplete');
    expect(result.hardConstraintFailed).toBe(false);
  });

  it('produces high score for well-aligned adopter and dog', () => {
    const result = calculateCompatibility(mockIdealAdopter, mockDog);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(['Exceptional Match', 'Great Match']).toContain(result.verdict);
    expect(result.hardConstraintFailed).toBe(false);
    expect(result.positiveHighlights.length).toBeGreaterThan(0);
    expect(result.breakdown.householdCompatibilityScore).toBe(25);
  });

  it('triggers hard animal welfare constraint when adopter has cats and dog is not cat-safe', () => {
    const catOwner: AdopterLifestylePreferences = {
      ...mockIdealAdopter,
      householdPets: { hasCats: true, hasDogs: false, hasKids: false },
    };

    const result = calculateCompatibility(catOwner, mockCatUnsafeDog);
    expect(result.hardConstraintFailed).toBe(true);
    expect(result.score).toBeLessThanOrEqual(32);
    expect(result.verdict).toBe('Not Recommended');
    expect(result.hardConstraintReason).toContain('cats');
    expect(result.potentialChallenges.some(c => c.toLowerCase().includes('cat'))).toBe(true);
  });

  it('triggers hard constraint when dog is not safe for small children', () => {
    const kidUnsafeDog: Dog = {
      ...mockDog,
      goodWith: { children: false, cats: true, otherDogs: true },
    };
    const familyWithKids: AdopterLifestylePreferences = {
      ...mockIdealAdopter,
      householdPets: { hasCats: false, hasDogs: false, hasKids: true },
    };

    const result = calculateCompatibility(familyWithKids, kidUnsafeDog);
    expect(result.hardConstraintFailed).toBe(true);
    expect(result.score).toBeLessThanOrEqual(32);
    expect(result.verdict).toBe('Not Recommended');
    expect(result.hardConstraintReason).toContain('children');
  });

  it('penalizes significant exercise and energy deficits', () => {
    const sedentaryBusyAdopter: AdopterLifestylePreferences = {
      ...mockIdealAdopter,
      dailyActivityLevel: 'sedentary',
      dailyTimeHours: 0.5,
      householdPets: { hasCats: false, hasDogs: false, hasKids: false },
    };

    const result = calculateCompatibility(sedentaryBusyAdopter, mockCatUnsafeDog);
    expect(result.breakdown.activityScore).toBeLessThan(12);
    expect(result.potentialChallenges.some(c => c.includes('exercise'))).toBe(true);
  });

  it('penalizes space mismatch when dog needs yard but adopter is in apartment without yard', () => {
    const apartmentAdopter: AdopterLifestylePreferences = {
      ...mockIdealAdopter,
      livingEnvironment: 'apartment_no_yard',
      householdPets: { hasCats: false, hasDogs: false, hasKids: false },
    };

    const result = calculateCompatibility(apartmentAdopter, mockCatUnsafeDog);
    expect(result.breakdown.environmentScore).toBeLessThan(15);
    expect(result.potentialChallenges.some(c => c.includes('yard'))).toBe(true);
  });

  it('is strictly deterministic (identical inputs yield identical outputs)', () => {
    const run1 = calculateCompatibility(mockIdealAdopter, mockDog);
    const run2 = calculateCompatibility(mockIdealAdopter, mockDog);
    expect(run1).toEqual(run2);
  });
});
