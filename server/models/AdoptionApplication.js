import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'more_info_requested', 'approved', 'rejected', 'withdrawn'],
      required: true,
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
    },
    note: {
      type: String,
      default: '',
    },
    actorName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    dogId: {
      type: String,
      ref: 'Dog',
      required: true,
      index: true,
    },
    dogName: {
      type: String,
      required: true,
    },
    dogPhoto: {
      type: String,
      default: '',
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
    adopterId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    applicantPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    housingType: {
      type: String,
      enum: ['own_house', 'rent_house', 'rent_apartment'],
      required: true,
    },
    hasYard: {
      type: Boolean,
      default: false,
    },
    landlordApproval: {
      type: Boolean,
      default: false,
    },
    hoursAlonePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    householdMembers: {
      type: String,
      required: true,
    },
    existingPetsDetails: {
      type: String,
      default: 'None',
    },
    vetReference: {
      clinicName: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    experienceDescription: {
      type: String,
      required: true,
    },
    reasonForAdopting: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'more_info_requested', 'approved', 'rejected', 'withdrawn'],
      default: 'submitted',
      index: true,
    },
    shelterNotes: {
      type: String,
      default: '',
    },
    timeline: {
      type: [timelineEventSchema],
      default: [],
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

export const AdoptionApplication = mongoose.model('AdoptionApplication', applicationSchema);
export default AdoptionApplication;
