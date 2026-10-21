import { AdopterLifestylePreferences, Dog, MatchResult, CompatibilityFactor } from '../../types';

/**
 * PawPair Deterministic Matching Engine
 * 
 * Transparent, weighted scoring algorithm for lifestyle and animal welfare compatibility.
 * Total normalized score: 0 to 100 points.
 * 
 * Categories:
 * 1. Household Safety & Social Fit: 25 points (With Animal Welfare Hard Constraints)
 * 2. Activity & Exercise Synergies: 25 points
 * 3. Living Environment & Space: 20 points
 * 4. Experience Level Match: 15 points
 * 5. Time Commitment & Solitude: 15 points
 */

export function calculateCompatibility(
  adopter: AdopterLifestylePreferences | null | undefined,
  dog: Dog
): MatchResult {
  // If no questionnaire completed yet, return unrated baseline with transparent missing-data state
  if (!adopter) {
    return {
      score: 50,
      verdict: 'Moderate Match',
      breakdown: {
        activityScore: 12,
        environmentScore: 10,
        experienceScore: 8,
        householdCompatibilityScore: 12,
        scheduleScore: 8,
      },
      factors: [
        {
          category: 'Lifestyle Profile',
          name: 'Questionnaire Incomplete',
          earned: 50,
          max: 100,
          status: 'neutral',
          detail: 'Complete the adopter lifestyle questionnaire to view your personalized compatibility score.',
        },
      ],
      positiveHighlights: ['Standard rescue adoption guidelines apply.'],
      potentialChallenges: ['Personal lifestyle compatibility has not been evaluated.'],
      careConsiderations: [
        'Every dog has unique personality and transition needs during adoption.',
      ],
      hardConstraintFailed: false,
    };
  }

  const factors: CompatibilityFactor[] = [];
  const positiveHighlights: string[] = [];
  const potentialChallenges: string[] = [];
  const careConsiderations: string[] = [];

  let hardConstraintFailed = false;
  let hardConstraintReason: string | undefined;

  // ------------------------------------------------------------------
  // 1. Household Safety & Compatibility (25 pts) - Hard Constraint Check
  // ------------------------------------------------------------------
  let householdScore = 25;
  const householdIssues: string[] = [];

  // Cats constraint
  if (adopter.householdPets.hasCats) {
    if (!dog.goodWith.cats) {
      householdScore = 0;
      hardConstraintFailed = true;
      hardConstraintReason = `Safety restriction: ${dog.name} has high prey drive or is documented as not safe living with cats.`;
      householdIssues.push('Cat safety restriction triggered');
      potentialChallenges.push(`High risk with resident cats; ${dog.name} requires a cat-free home.`);
    } else {
      positiveHighlights.push(`Documented cat-friendly: ${dog.name} coexists safely with feline family members.`);
    }
  }

  // Children constraint
  if (adopter.householdPets.hasKids) {
    if (!dog.goodWith.children) {
      householdScore = Math.min(householdScore, 5);
      if (!hardConstraintFailed) {
        hardConstraintFailed = true;
        hardConstraintReason = `Safety restriction: ${dog.name} is recommended for adult-only households without small children.`;
      }
      householdIssues.push('Requires adult-only home');
      potentialChallenges.push(`${dog.name} is not suited for homes with young children.`);
    } else {
      positiveHighlights.push(`Gentle with children: patient and friendly temperament with kids.`);
    }
  }

  // Other dogs
  if (adopter.householdPets.hasDogs) {
    if (!dog.goodWith.otherDogs) {
      householdScore = Math.max(0, householdScore - 15);
      potentialChallenges.push(`${dog.name} needs to be the only dog in the household.`);
    } else {
      positiveHighlights.push(`Dog-social: enjoys canine companionship and can share a home with other dogs.`);
    }
  }

  if (householdScore === 25) {
    factors.push({
      category: 'Household Safety',
      name: 'Household & Pet Compatibility',
      earned: 25,
      max: 25,
      status: 'positive',
      detail: `Your household dynamics perfectly match ${dog.name}'s social profile.`,
    });
  } else if (hardConstraintFailed) {
    factors.push({
      category: 'Household Safety',
      name: 'Critical Welfare Constraint',
      earned: householdScore,
      max: 25,
      status: 'incompatible',
      detail: hardConstraintReason || 'Household constraint mismatch.',
    });
  } else {
    factors.push({
      category: 'Household Safety',
      name: 'Partial Household Fit',
      earned: householdScore,
      max: 25,
      status: 'warning',
      detail: householdIssues.join(', ') || 'Some household adjustments required.',
    });
  }

  // ------------------------------------------------------------------
  // 2. Activity & Exercise Synergies (25 pts)
  // ------------------------------------------------------------------
  let activityScore = 25;
  const energyLevels: Record<string, number> = {
    low: 1,
    moderate: 2,
    high: 3,
    very_high: 4,
  };
  const adopterActivityLevels: Record<string, number> = {
    sedentary: 1,
    light: 2,
    moderate: 3,
    very_active: 4,
  };

  const dogEnergyNum = energyLevels[dog.energyLevel] || 2;
  const adopterActivityNum = adopterActivityLevels[adopter.dailyActivityLevel] || 2;
  const energyDiff = Math.abs(dogEnergyNum - adopterActivityNum);

  // Time available vs required exercise hours
  if (adopter.dailyTimeHours < dog.minDailyExerciseHours) {
    const deficit = dog.minDailyExerciseHours - adopter.dailyTimeHours;
    const penalty = Math.min(16, deficit * 8);
    activityScore -= penalty;
    potentialChallenges.push(
      `${dog.name} needs at least ${dog.minDailyExerciseHours}h of daily exercise; your questionnaire indicated ${adopter.dailyTimeHours}h available.`
    );
  } else {
    positiveHighlights.push(
      `Sufficient daily activity commitment (${adopter.dailyTimeHours}h/day vs ${dog.minDailyExerciseHours}h minimum needed).`
    );
  }

  if (energyDiff >= 2) {
    activityScore -= 9;
    potentialChallenges.push(
      `Noticeable energy mismatch: ${dog.name} has ${dog.energyLevel.replace('_', ' ')} energy, while you prefer a ${adopter.dailyActivityLevel} lifestyle.`
    );
  } else if (energyDiff === 0) {
    positiveHighlights.push(
      `Ideal energy match: Both you and ${dog.name} thrive in a ${dog.energyLevel.replace('_', ' ')} pace.`
    );
  }

  activityScore = Math.max(2, Math.min(25, activityScore));

  factors.push({
    category: 'Activity Level',
    name: 'Energy & Exercise Match',
    earned: Math.round(activityScore),
    max: 25,
    status: activityScore >= 20 ? 'positive' : activityScore >= 12 ? 'neutral' : 'warning',
    detail: `${dog.energyLevel.toUpperCase()} energy dog with ${dog.minDailyExerciseHours}h/day minimum exercise requirement.`,
  });

  // ------------------------------------------------------------------
  // 3. Living Environment & Space (20 pts)
  // ------------------------------------------------------------------
  let environmentScore = 20;

  const isApartment = adopter.livingEnvironment.startsWith('apartment');
  const hasYard =
    adopter.livingEnvironment === 'house_small_yard' ||
    adopter.livingEnvironment === 'house_large_yard' ||
    adopter.livingEnvironment === 'rural_ranch';

  if (dog.spaceRequired === 'needs_yard' && !hasYard) {
    environmentScore -= 12;
    potentialChallenges.push(`${dog.name} thrives best with a private, fenced yard for daily enrichment.`);
  } else if (dog.spaceRequired === 'large_property' && isApartment) {
    environmentScore -= 15;
    potentialChallenges.push(`${dog.name} requires substantial open space or a rural setting.`);
  } else if (dog.spaceRequired === 'apartment_friendly') {
    positiveHighlights.push(`${dog.name} is apartment and urban dwelling friendly.`);
  } else if (hasYard) {
    positiveHighlights.push(`Your outdoor yard provides great exercise space for ${dog.name}.`);
  }

  // Size preference check
  if (adopter.preferredSizes && adopter.preferredSizes.length > 0) {
    if (!adopter.preferredSizes.includes(dog.size)) {
      environmentScore -= 4;
      careConsiderations.push(
        `${dog.name} is a ${dog.size} dog (${dog.breed}), which is outside your stated preference.`
      );
    }
  }

  environmentScore = Math.max(3, Math.min(20, environmentScore));

  factors.push({
    category: 'Living Space',
    name: 'Housing & Yard Compatibility',
    earned: Math.round(environmentScore),
    max: 20,
    status: environmentScore >= 16 ? 'positive' : environmentScore >= 10 ? 'neutral' : 'warning',
    detail: `${dog.name} requires: ${dog.spaceRequired.replace(/_/g, ' ')}. Your dwelling: ${adopter.livingEnvironment.replace(/_/g, ' ')}.`,
  });

  // ------------------------------------------------------------------
  // 4. Experience Level Match (15 pts)
  // ------------------------------------------------------------------
  let experienceScore = 15;
  const expWeights: Record<string, number> = {
    first_time: 1,
    intermediate: 2,
    experienced: 3,
  };
  const adopterExpNum = expWeights[adopter.experienceLevel] || 1;
  const dogExpNum = expWeights[dog.experienceLevelNeeded] || 1;

  if (dogExpNum > adopterExpNum) {
    const diff = dogExpNum - adopterExpNum;
    if (diff === 2) {
      experienceScore = 4;
      potentialChallenges.push(
        `${dog.name} requires an experienced dog guardian familiar with behavioral training and boundaries.`
      );
      careConsiderations.push('Enlisting a professional certified dog trainer is strongly advised.');
    } else {
      experienceScore = 9;
      potentialChallenges.push(
        `${dog.name} benefits from intermediate experience with dog handling.`
      );
      careConsiderations.push('Patience and foundational obedience training will help smooth adoption transition.');
    }
  } else {
    positiveHighlights.push(
      `Your ${adopter.experienceLevel.replace('_', ' ')} dog experience meets ${dog.name}'s behavioral profile.`
    );
  }

  factors.push({
    category: 'Experience Level',
    name: 'Handling & Training Needs',
    earned: Math.round(experienceScore),
    max: 15,
    status: experienceScore >= 13 ? 'positive' : experienceScore >= 8 ? 'neutral' : 'warning',
    detail: `Adopter level: ${adopter.experienceLevel}. Dog requirement: ${dog.experienceLevelNeeded}.`,
  });

  // ------------------------------------------------------------------
  // 5. Time Commitment & Solitude (15 pts)
  // ------------------------------------------------------------------
  let scheduleScore = 15;

  if (adopter.workFromHome === 'office') {
    if (dog.ageGroup === 'puppy') {
      scheduleScore -= 8;
      potentialChallenges.push('Puppies cannot be left alone for full 8-hour office days due to feeding and bladder needs.');
      careConsiderations.push('A midday dog-sitter or puppy daycare will be necessary.');
    } else if (dog.energyLevel === 'high' || dog.energyLevel === 'very_high') {
      scheduleScore -= 5;
      careConsiderations.push('Long periods alone may lead to boredom or anxiety without mid-day stimulation.');
    } else {
      scheduleScore -= 2;
    }
  } else if (adopter.workFromHome === 'full_time') {
    positiveHighlights.push('Full-time work-from-home setup allows regular supervision, comfort, and routine.');
  } else {
    positiveHighlights.push('Hybrid schedule provides a balanced presence for acclimation.');
  }

  // Age group preference check
  if (adopter.preferredAges && adopter.preferredAges.length > 0) {
    if (!adopter.preferredAges.includes(dog.ageGroup)) {
      scheduleScore -= 2;
      careConsiderations.push(`${dog.name} is in the ${dog.ageGroup} stage (${dog.ageYears} years old).`);
    }
  }

  // Special needs accommodation
  if (dog.specialNeeds && dog.specialNeeds.length > 0) {
    if (!adopter.willingToAccommodateNeeds) {
      scheduleScore -= 4;
      potentialChallenges.push(`${dog.name} has special needs: ${dog.specialNeeds.join(', ')}.`);
    } else {
      positiveHighlights.push(`You are open to accommodating ${dog.name}'s specific care needs.`);
      careConsiderations.push(`Special needs to be aware of: ${dog.specialNeeds.join(', ')}.`);
    }
  }

  scheduleScore = Math.max(3, Math.min(15, scheduleScore));

  factors.push({
    category: 'Daily Routine',
    name: 'Schedule & Companionship',
    earned: Math.round(scheduleScore),
    max: 15,
    status: scheduleScore >= 12 ? 'positive' : 'neutral',
    detail: `Work setup: ${adopter.workFromHome.replace('_', ' ')}. Age stage: ${dog.ageGroup}.`,
  });

  // ------------------------------------------------------------------
  // Final Score Aggregation and Normalization
  // ------------------------------------------------------------------
  let rawTotal = householdScore + activityScore + environmentScore + experienceScore + scheduleScore;
  let finalScore = Math.round(rawTotal);

  // Hard constraints override: If a critical animal welfare constraint failed, cap score at 32%
  if (hardConstraintFailed) {
    finalScore = Math.min(32, finalScore);
  }

  finalScore = Math.max(5, Math.min(99, finalScore));

  // Determine human-readable verdict
  let verdict: MatchResult['verdict'];
  if (hardConstraintFailed) {
    verdict = 'Not Recommended';
  } else if (finalScore >= 88) {
    verdict = 'Exceptional Match';
  } else if (finalScore >= 75) {
    verdict = 'Great Match';
  } else if (finalScore >= 60) {
    verdict = 'Moderate Match';
  } else {
    verdict = 'Challenging Match';
  }

  // General welfare reminder
  careConsiderations.push(
    'Remember: Compatibility scores are guidelines to foster successful adoptions. Shelter staff make final adoption decisions based on interviews and home readiness.'
  );

  return {
    score: finalScore,
    verdict,
    breakdown: {
      activityScore: Math.round(activityScore),
      environmentScore: Math.round(environmentScore),
      experienceScore: Math.round(experienceScore),
      householdCompatibilityScore: Math.round(householdScore),
      scheduleScore: Math.round(scheduleScore),
    },
    factors,
    positiveHighlights: Array.from(new Set(positiveHighlights)),
    potentialChallenges: Array.from(new Set(potentialChallenges)),
    careConsiderations: Array.from(new Set(careConsiderations)),
    hardConstraintFailed,
    hardConstraintReason,
  };
}
