import mongoose from 'mongoose';

const adopterPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredSizes: {
      type: [String],
      enum: ['small', 'medium', 'large', 'giant'],
      default: ['small', 'medium'],
    },
    preferredAges: {
      type: [String],
      enum: ['puppy', 'young', 'adult', 'senior'],
      default: ['young', 'adult'],
    },
    dailyActivityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very_active'],
      default: 'moderate',
    },
    dailyTimeHours: {
      type: Number,
      default: 3,
      min: 0,
      max: 24,
    },
    livingEnvironment: {
      type: String,
      enum: ['apartment_no_yard', 'apartment_balcony', 'house_small_yard', 'house_large_yard', 'rural_ranch'],
      default: 'apartment_balcony',
    },
    experienceLevel: {
      type: String,
      enum: ['first_time', 'intermediate', 'experienced'],
      default: 'intermediate',
    },
    householdPets: {
      hasCats: { type: Boolean, default: false },
      hasDogs: { type: Boolean, default: false },
      hasKids: { type: Boolean, default: false },
    },
    willingToAccommodateNeeds: {
      type: Boolean,
      default: true,
    },
    workFromHome: {
      type: String,
      enum: ['full_time', 'hybrid', 'office'],
      default: 'hybrid',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AdopterPreferences = mongoose.model('AdopterPreferences', adopterPreferencesSchema);
export default AdopterPreferences;
