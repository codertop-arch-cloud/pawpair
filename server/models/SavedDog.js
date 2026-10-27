import mongoose from 'mongoose';

const savedDogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    dogId: {
      type: String,
      ref: 'Dog',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

savedDogSchema.index({ userId: 1, dogId: 1 }, { unique: true });

export const SavedDog = mongoose.model('SavedDog', savedDogSchema);
export default SavedDog;
