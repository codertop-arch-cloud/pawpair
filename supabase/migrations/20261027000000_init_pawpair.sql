-- ==============================================================================
-- PawPair Complete Database Migration & Row Level Security (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('adopter', 'shelter_staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dog_status AS ENUM ('available', 'pending_adoption', 'adopted', 'foster_care');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE app_status AS ENUM ('submitted', 'under_review', 'more_info_requested', 'approved', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('upcoming', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  website TEXT,
  photo_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  director_name TEXT,
  operating_hours TEXT,
  founded_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'adopter',
  shelter_id UUID REFERENCES shelters(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOGS TABLE
CREATE TABLE IF NOT EXISTS dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years NUMERIC(3, 1) NOT NULL CHECK (age_years >= 0),
  age_group TEXT NOT NULL CHECK (age_group IN ('puppy', 'young', 'adult', 'senior')),
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large', 'giant')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  energy_level TEXT NOT NULL CHECK (energy_level IN ('low', 'moderate', 'high', 'very_high')),
  temperament TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  backstory TEXT NOT NULL,
  special_needs TEXT[] DEFAULT '{}',
  medical_info JSONB NOT NULL DEFAULT '{"vaccinated": true, "neutered": true, "microchipped": true}',
  good_with JSONB NOT NULL DEFAULT '{"children": true, "cats": true, "otherDogs": true}',
  space_required TEXT NOT NULL CHECK (space_required IN ('apartment_friendly', 'needs_yard', 'large_property')),
  min_daily_exercise_hours NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
  experience_level_needed TEXT NOT NULL CHECK (experience_level_needed IN ('first_time', 'intermediate', 'experienced')),
  adoption_fee NUMERIC(6, 2) NOT NULL DEFAULT 150.00,
  status dog_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ADOPTER LIFESTYLE PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS adopter_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVED DOGS (FAVORITES)
CREATE TABLE IF NOT EXISTS saved_dogs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, dog_id)
);

-- 8. ADOPTION APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS adoption_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE RESTRICT,
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE RESTRICT,
  adopter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  housing_type TEXT NOT NULL CHECK (housing_type IN ('own_house', 'rent_house', 'rent_apartment')),
  has_yard BOOLEAN NOT NULL DEFAULT FALSE,
  landlord_approval BOOLEAN DEFAULT TRUE,
  hours_alone_per_day NUMERIC(3, 1) NOT NULL CHECK (hours_alone_per_day >= 0 AND hours_alone_per_day <= 24),
  household_members TEXT NOT NULL,
  existing_pets_details TEXT DEFAULT '',
  vet_reference JSONB,
  experience_description TEXT NOT NULL,
  reason_for_adopting TEXT NOT NULL,
  status app_status NOT NULL DEFAULT 'submitted',
  shelter_notes TEXT,
  timeline JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent multiple concurrent pending applications from the same adopter for the same dog
  CONSTRAINT unique_active_app_per_user_dog UNIQUE (dog_id, adopter_id)
);

-- 9. SHELTER GROUP VISITS TABLE
CREATE TABLE IF NOT EXISTS shelter_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  visit_date DATE NOT NULL CHECK (visit_date >= CURRENT_DATE),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  participant_count INTEGER NOT NULL DEFAULT 0 CHECK (participant_count >= 0 AND participant_count <= capacity),
  status visit_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VISIT PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS visit_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES shelter_visits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participant_per_visit UNIQUE (visit_id, user_id)
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_dogs_status ON dogs(status);
CREATE INDEX IF NOT EXISTS idx_dogs_shelter ON dogs(shelter_id);
CREATE INDEX IF NOT EXISTS idx_dogs_size_energy ON dogs(size, energy_level);
CREATE INDEX IF NOT EXISTS idx_apps_adopter ON adoption_applications(adopter_id);
CREATE INDEX IF NOT EXISTS idx_apps_shelter ON adoption_applications(shelter_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON shelter_visits(visit_date, status);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE adopter_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_participants ENABLE ROW LEVEL SECURITY;

-- Shelters: Anyone can read, only associated staff can update
CREATE POLICY "Public shelters read" ON shelters FOR SELECT USING (true);
CREATE POLICY "Staff shelter update" ON shelters FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = shelters.id AND profiles.role = 'shelter_staff')
);

-- Profiles: Users can view all public names; only update own profile
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Self profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Dogs: Public can read available dogs; shelter staff can manage their shelter's dogs
CREATE POLICY "Public dogs read" ON dogs FOR SELECT USING (true);
CREATE POLICY "Staff dogs insert" ON dogs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = dogs.shelter_id AND profiles.role = 'shelter_staff')
);
CREATE POLICY "Staff dogs update" ON dogs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = dogs.shelter_id AND profiles.role = 'shelter_staff')
);
CREATE POLICY "Staff dogs delete" ON dogs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = dogs.shelter_id AND profiles.role = 'shelter_staff')
);

-- Adopter Preferences: Users can manage only their own preferences
CREATE POLICY "Owner preferences select" ON adopter_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner preferences upsert" ON adopter_preferences FOR ALL USING (auth.uid() = user_id);

-- Saved Dogs: Users can manage only their own saved dogs
CREATE POLICY "Owner saved_dogs select" ON saved_dogs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner saved_dogs insert" ON saved_dogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner saved_dogs delete" ON saved_dogs FOR DELETE USING (auth.uid() = user_id);

-- Adoption Applications:
-- Adopters can view and submit their own applications
-- Shelter staff can view and update applications for dogs in their shelter
CREATE POLICY "Adopter view own applications" ON adoption_applications FOR SELECT USING (auth.uid() = adopter_id);
CREATE POLICY "Adopter submit application" ON adoption_applications FOR INSERT WITH CHECK (auth.uid() = adopter_id);
CREATE POLICY "Shelter staff view shelter applications" ON adoption_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = adoption_applications.shelter_id AND profiles.role = 'shelter_staff')
);
CREATE POLICY "Shelter staff update application status" ON adoption_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = adoption_applications.shelter_id AND profiles.role = 'shelter_staff')
);

-- Shelter Visits: Anyone can view upcoming visits; staff can create/cancel
CREATE POLICY "Public visits read" ON shelter_visits FOR SELECT USING (true);
CREATE POLICY "Staff visits insert" ON shelter_visits FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = shelter_visits.shelter_id AND profiles.role = 'shelter_staff')
);
CREATE POLICY "Staff visits update" ON shelter_visits FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.shelter_id = shelter_visits.shelter_id AND profiles.role = 'shelter_staff')
);

-- Visit Participants:
CREATE POLICY "Public participants view" ON visit_participants FOR SELECT USING (true);
CREATE POLICY "Adopter join visit" ON visit_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Adopter cancel visit participation" ON visit_participants FOR UPDATE USING (auth.uid() = user_id);

-- 13. ATOMIC STORED PROCEDURES / RPC FOR CONCURRENCY-SAFE OPERATIONS

-- Atomic Visit Join with Row Lock (Pessimistic Locking)
CREATE OR REPLACE FUNCTION join_shelter_visit(
  p_visit_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacity INTEGER;
  v_current_count INTEGER;
  v_status visit_status;
  v_participant_id UUID;
BEGIN
  -- Acquire exclusive lock on the visit row to prevent concurrent race conditions
  SELECT capacity, participant_count, status
  INTO v_capacity, v_current_count, v_status
  FROM shelter_visits
  WHERE id = p_visit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Shelter visit not found');
  END IF;

  IF v_status <> 'upcoming' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This visit is no longer open for reservations');
  END IF;

  IF v_current_count >= v_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'This shelter visit has reached maximum capacity');
  END IF;

  -- Check if already registered
  IF EXISTS (SELECT 1 FROM visit_participants WHERE visit_id = p_visit_id AND user_id = p_user_id AND status = 'confirmed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already registered for this shelter visit');
  END IF;

  -- Insert or update participation record
  INSERT INTO visit_participants (visit_id, user_id, user_name, user_email, notes, status, registered_at)
  VALUES (p_visit_id, p_user_id, p_user_name, p_user_email, p_notes, 'confirmed', NOW())
  ON CONFLICT (visit_id, user_id)
  DO UPDATE SET status = 'confirmed', registered_at = NOW(), notes = EXCLUDED.notes
  RETURNING id INTO v_participant_id;

  -- Increment participant count atomically
  UPDATE shelter_visits
  SET participant_count = participant_count + 1
  WHERE id = p_visit_id;

  RETURN jsonb_build_object('success', true, 'participantId', v_participant_id, 'newCount', v_current_count + 1);
END;
$$;

-- Atomic Visit Leave
CREATE OR REPLACE FUNCTION leave_shelter_visit(
  p_visit_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Acquire lock on visit
  SELECT participant_count INTO v_current_count
  FROM shelter_visits
  WHERE id = p_visit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Shelter visit not found');
  END IF;

  -- Update participation status
  UPDATE visit_participants
  SET status = 'cancelled'
  WHERE visit_id = p_visit_id AND user_id = p_user_id AND status = 'confirmed';

  IF FOUND THEN
    UPDATE shelter_visits
    SET participant_count = GREATEST(0, participant_count - 1)
    WHERE id = p_visit_id;
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'No active registration found');
  END IF;
END;
$$;
