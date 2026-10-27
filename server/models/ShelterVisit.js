import mongoose from 'mongoose';

const shelterVisitSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    shelterId: {
      type: String,
      ref: 'Shelter',
      required: true,
      index: true,
    },
    shelterName: {
      type: String,
      required: true,
    },
    shelterAddress: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Visit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // HH:MM
      required: true,
    },
    endTime: {
      type: String, // HH:MM
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 10,
    },
    participantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
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

export const ShelterVisit = mongoose.model('ShelterVisit', shelterVisitSchema);
export default ShelterVisit;
