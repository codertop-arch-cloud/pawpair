import mongoose from 'mongoose';

const medicalInfoSchema = new mongoose.Schema(
  {
    vaccinated: { type: Boolean, default: true },
    neutered: { type: Boolean, default: true },
    microchipped: { type: Boolean, default: true },
    specialCare: { type: String, default: '' },
    knownConditions: { type: [String], default: [] },
  },
  { _id: false }
);

const goodWithSchema = new mongoose.Schema(
  {
    children: { type: Boolean, default: true },
    cats: { type: Boolean, default: false },
    otherDogs: { type: Boolean, default: true },
  },
  { _id: false }
);

const dogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: [true, 'Dog name is required'],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
    },
    ageYears: {
      type: Number,
      required: true,
      min: 0,
    },
    ageGroup: {
      type: String,
      enum: ['puppy', 'young', 'adult', 'senior'],
      required: true,
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'giant'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    energyLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      required: true,
    },
    temperament: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: true,
    },
    shelterId: {
      type: String,
      ref: 'Shelter',
      required: true,
      index: true,
    },
    shelterName: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, 'At least one photo is required'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    backstory: {
      type: String,
      default: '',
    },
    specialNeeds: {
      type: [String],
      default: [],
    },
    medicalInfo: {
      type: medicalInfoSchema,
      default: () => ({}),
    },
    goodWith: {
      type: goodWithSchema,
      default: () => ({}),
    },
    spaceRequired: {
      type: String,
      enum: ['apartment_friendly', 'needs_yard', 'large_property'],
      default: 'apartment_friendly',
    },
    minDailyExerciseHours: {
      type: Number,
      default: 1,
    },
    experienceLevelNeeded: {
      type: String,
      enum: ['first_time', 'intermediate', 'experienced'],
      default: 'first_time',
    },
    adoptionFee: {
      type: Number,
      default: 150,
    },
    status: {
      type: String,
      enum: ['available', 'pending_adoption', 'adopted', 'foster_care'],
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

dogSchema.index({ name: 'text', breed: 'text', location: 'text' });

export const Dog = mongoose.model('Dog', dogSchema);
export default Dog;
