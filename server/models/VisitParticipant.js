import mongoose from 'mongoose';

const visitParticipantSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    visitId: {
      type: String,
      ref: 'ShelterVisit',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    registeredAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
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

visitParticipantSchema.index({ visitId: 1, userId: 1 }, { unique: true });

export const VisitParticipant = mongoose.model('VisitParticipant', visitParticipantSchema);
export default VisitParticipant;
