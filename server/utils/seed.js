import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Shelter from '../models/Shelter.js';
import Dog from '../models/Dog.js';
import AdoptionApplication from '../models/AdoptionApplication.js';
import AdopterPreferences from '../models/AdopterPreferences.js';
import SavedDog from '../models/SavedDog.js';
import ShelterVisit from '../models/ShelterVisit.js';
import VisitParticipant from '../models/VisitParticipant.js';
import {
  SEED_USERS,
  SEED_SHELTERS,
  SEED_DOGS,
  SEED_APPLICATIONS,
  SEED_VISITS,
  SEED_VISIT_PARTICIPANTS,
  SEED_SAVED_DOGS,
  SEED_ADOPTER_PREFERENCES,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting PawPair database seeding to MongoDB Atlas...');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Shelter.deleteMany({}),
      Dog.deleteMany({}),
      AdoptionApplication.deleteMany({}),
      AdopterPreferences.deleteMany({}),
      SavedDog.deleteMany({}),
      ShelterVisit.deleteMany({}),
      VisitParticipant.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records.');

    // 1. Seed Shelters
    const sheltersToInsert = SEED_SHELTERS.map((s) => ({
      ...s,
      _id: s.id,
    }));
    await Shelter.insertMany(sheltersToInsert);
    console.log(`✅ Seeded ${sheltersToInsert.length} shelters.`);

    // 2. Seed Users with securely hashed passwords
    const salt = await bcrypt.genSalt(10);
    const usersToInsert = await Promise.all(
      SEED_USERS.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password || 'password123', salt);
        return {
          _id: u.id,
          fullName: u.fullName,
          email: u.email.toLowerCase().trim(),
          password: hashedPassword,
          role: u.role,
          shelterId: u.shelterId || null,
          avatarUrl: u.avatarUrl || '',
          phone: u.phone || '',
          city: u.city || '',
          bio: u.bio || '',
        };
      })
    );
    await User.insertMany(usersToInsert);
    console.log(`✅ Seeded ${usersToInsert.length} users with bcrypt password hashes.`);

    // 3. Seed Dogs
    const dogsToInsert = SEED_DOGS.map((d) => ({
      ...d,
      _id: d.id,
    }));
    await Dog.insertMany(dogsToInsert);
    console.log(`✅ Seeded ${dogsToInsert.length} dogs.`);

    // 4. Seed Applications
    const appsToInsert = SEED_APPLICATIONS.map((a) => ({
      ...a,
      _id: a.id,
    }));
    await AdoptionApplication.insertMany(appsToInsert);
    console.log(`✅ Seeded ${appsToInsert.length} adoption applications.`);

    // 5. Seed Visits
    const visitsToInsert = SEED_VISITS.map((v) => ({
      ...v,
      _id: v.id,
    }));
    await ShelterVisit.insertMany(visitsToInsert);
    console.log(`✅ Seeded ${visitsToInsert.length} shelter visits.`);

    // 6. Seed Visit Participants
    const participantsToInsert = Object.entries(SEED_VISIT_PARTICIPANTS).flatMap(
      ([visitId, participants]) =>
        participants.map((vp) => ({
          ...vp,
          _id: `${visitId}-${vp.userId}`,
          visitId,
        }))
    );
    if (participantsToInsert.length > 0) {
      await VisitParticipant.insertMany(participantsToInsert);
      console.log(`✅ Seeded ${participantsToInsert.length} visit participants.`);
    }

    // 7. Seed Saved Dogs
    const savedDogsToInsert = Object.entries(SEED_SAVED_DOGS).flatMap(([userId, dogIds]) =>
      dogIds.map((dogId) => ({ userId, dogId }))
    );
    if (savedDogsToInsert.length > 0) {
      await SavedDog.insertMany(savedDogsToInsert);
      console.log(`✅ Seeded ${savedDogsToInsert.length} saved dogs favorites.`);
    }

    // 8. Seed Preferences
    const prefsToInsert = Object.entries(SEED_ADOPTER_PREFERENCES).map(([userId, prefs]) => ({
      ...prefs,
      userId,
    }));
    if (prefsToInsert.length > 0) {
      await AdopterPreferences.insertMany(prefsToInsert);
      console.log(`✅ Seeded ${prefsToInsert.length} adopter preference profiles.`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

// Run if directly executed
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}
