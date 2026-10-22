# PawPair 🐾
### Ethical Dog Discovery, Explainable Lifestyle Matching & Coordinated Shelter Visits

> **End-Term Software Engineering Project**  
> **Status:** Fully Functional & Tested | **Build Status:** Passing | **Test Coverage:** 14/14 automated tests passing

---

## 1. Project Overview & Problem Statement

Animal shelter adoptions frequently fail due to lifestyle mismatches rather than malicious intent. Over 3 million shelter dogs enter US shelters annually, with approximately 15–20% returned post-adoption because the guardian’s living space, activity style, work schedule, or household composition (such as resident cats or young children) conflicted with the dog's behavioral profile.

Existing adoption platforms operate primarily as passive, static online classifieds with simplistic keyword search. They lack:
1. **Lifestyle Compatibility Intelligence:** Transparent, explainable scoring that reveals *why* a dog is or is not a match.
2. **Animal Welfare Hard Constraints:** Strict prevention of high-risk placements (e.g. placing high-prey-drive dogs with cats).
3. **Structured Application Workflows:** An end-to-end transparent application pipeline with audit logs and applicant notifications.
4. **Coordinated Socialization Visits:** Safe, shelter-supervised group visits where prospective adopters can meet dogs and other community adopters before committing.

**PawPair** solves this with an ethical, personality-first platform prioritizing animal welfare and lifelong adoption success.

---

## 2. Target Users

1. **Prospective Adopters:** Individuals, couples, or families seeking a dog companion that genuinely fits their home, exercise routine, and family members.
2. **Animal Shelters & Rescue Staff:** Coordinators managing dog intakes, medical verifications, behavioral assessments, application screening, and community orientation visits.
3. **Community & Group Visitors:** Prospective adopters wishing to visit shelters in supportive group visits with fellow adopters under staff supervision.

---

## 3. Core Architecture & Technical Stack

```
pawpair/
├── src/
│   ├── types/                     # Unified TypeScript domain definitions
│   │   └── index.ts
│   ├── features/
│   │   ├── discovery/             # Workflow A: Tinder swipe stack & browse grid
│   │   │   ├── DogDiscoveryView.tsx
│   │   │   └── DogDetailModal.tsx
│   │   ├── matching/              # Workflow B: Deterministic matching engine & UI
│   │   │   ├── matchingEngine.ts
│   │   │   └── LifestyleMatcher.tsx
│   │   ├── applications/          # Workflow C: Application submission & tracking
│   │   │   ├── AdoptionApplicationModal.tsx
│   │   │   └── MyApplicationsView.tsx
│   │   ├── shelters/              # Workflow D: Shelter staff dashboard
│   │   │   └── ShelterManagementDashboard.tsx
│   │   └── visits/                # Workflow E: Group shelter visit coordination
│   │       └── GroupVisitsView.tsx
│   ├── components/                # Reusable presentation components
│   │   ├── Navbar.tsx
│   │   └── SavedDogsDrawer.tsx
│   ├── services/                  # Data access layer & storage abstractions
│   │   ├── dataService.ts         # Persistent data layer (Local/Supabase)
│   │   ├── seedData.ts            # Realistic demonstration dataset
│   │   └── supabaseClient.ts      # Live Supabase PostgreSQL client
│   ├── tests/                     # Automated Vitest test suites
│   │   ├── matchingEngine.test.ts
│   │   └── dataService.test.ts
│   ├── App.tsx                    # Root shell & route controller
│   ├── index.css                  # Tailwind CSS v4 design tokens & fonts
│   └── main.tsx
├── supabase/
│   └── migrations/
│       └── 20261027000000_init_pawpair.sql # PostgreSQL schema & RLS policies
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Technology Selection Rationale
- **Frontend Framework:** React 19 + TypeScript + Vite 8 for fast sub-second HMR and typed domain models.
- **Styling:** Tailwind CSS v4 configured with `@tailwindcss/vite` and curated warm editorial palette (`#FAF8F5` warm ivory, `#1B4332` forest green, `#BA5536` terracotta).
- **Icons:** `lucide-react`.
- **Backend / Database Architecture:**
  - Dual-mode data access layer:
    1. **Production Supabase PostgreSQL** with Row Level Security (RLS) policies, foreign key cascades, and atomic stored procedures (`join_shelter_visit`, `leave_shelter_visit`).
    2. **Browser-Persistent Demo Mode** using an in-memory safe-storage adapter with full localStorage persistence, enabling offline demonstration without blocking when cloud credentials are not supplied.
- **Testing Engine:** Vitest for deterministic unit testing of algorithms, duplicate validation, and concurrency-safe logic.

---

## 4. Implemented Workflows

### WORKFLOW A: Dog Discovery & Rich Profiles
- **Dual Browsing Modes:**
  - *Swipe Card Stack:* Tinder-style tactile card swiping with Undo (↺), Pass (✕), and Like/Save (♥) buttons. Supports keyboard navigation (← Pass, → Like, Space/Details).
  - *Browse Grid View:* Responsive catalog showing real photo previews, breed, age, size, energy badge, and calculated compatibility match percentage.
- **Filtering & Search:** Real-time filtering by Size (Small, Medium, Large, Giant), Energy level (Low, Moderate, High, Very High), Age stage (Puppy, Young, Adult, Senior), Cat-Friendly, Kid-Friendly, and High Match Only (>80%).
- **Interactive Dog Modal:**
  - Multi-photo gallery and video player embed.
  - Social compatibility matrix (Kids, Cats, Other Dogs).
  - Veterinary checklist (Vaccinations, Spay/Neuter, Microchip, Special Care notes).
  - Explainable compatibility score breakdown card.
  - Direct actions to save, apply, or schedule shelter visits.

### WORKFLOW B: Explainable Lifestyle Compatibility Matching
A **100-point deterministic, testable algorithm** (`src/features/matching/matchingEngine.ts`) evaluating 5 dimensions:
1. **Household Safety & Social Fit (25 pts) — Animal Welfare Hard Constraints:**
   - If adopter has resident cats and the dog has a high prey drive (`goodWith.cats = false`), a **Critical Welfare Constraint is triggered**: score is capped at ≤ 32%, verdict becomes `'Not Recommended'`, and an explicit warning is generated.
   - If adopter has young children and the dog requires an adult-only home (`goodWith.children = false`), the constraint triggers similarly.
2. **Activity & Exercise Synergies (25 pts):**
   - Compares adopter’s daily dedicated exercise hours and activity style against dog’s `minDailyExerciseHours` and `energyLevel`.
3. **Living Environment & Space (20 pts):**
   - Matches housing type (Apartment, Balcony, House with yard, Rural property) against dog’s space requirement (`apartment_friendly`, `needs_yard`, `large_property`).
4. **Handler Experience Level (15 pts):**
   - Compares adopter’s background (`first_time`, `intermediate`, `experienced`) against dog’s training needs.
5. **Time Commitment & Daily Routine (15 pts):**
   - Assesses hours left alone per day and work routine (Full WFH, Hybrid, On-site Office).

*Guarantees: Strictly deterministic, stable outputs for identical inputs, dynamically recalculating upon questionnaire change.*

### WORKFLOW C: Adoption Applications Lifecycle
- **Validated Multi-Step Form:**
  - Applicant contact, residential verification, landlord permission check (for renters), daily hours alone, household member demographics, existing pet history, and veterinary clinic reference.
- **Business Rule Enforcement:**
  - Prevents duplicate active applications from the same adopter for the same dog.
  - Prevents applications on adopted or unavailable dogs.
- **Lifecycle Status Stepper:**
  - `submitted` ➔ `under_review` ➔ `more_info_requested` ➔ `approved` / `rejected` / `withdrawn`.
  - Chronological timeline capturing exact ISO timestamps, coordinator notes, and actor names.
  - Adopter self-service application withdrawal.

### WORKFLOW D: Shelter Management Dashboard
- **Role-Based Portal:** Designed for authorized shelter staff (e.g. Elena Vance @ Green Paws Rescue).
- **Dog Listing Operations:**
  - Create new dog listing with photo URLs, video embeds, personality traits, and welfare tags.
  - Edit existing listings and toggle status (`available`, `pending_adoption`, `adopted`, `foster_care`).
- **Application Processing:**
  - Filter queue by status, inspect applicant details, vet references, and motivation.
  - Update status with audit notes appended to the applicant’s timeline.
- **Visit Administration:**
  - Schedule new group visits and review registered attendee rosters.

### WORKFLOW E: Group Shelter Visits
- **Community Visits:** Allows adopters to attend scheduled on-site visits together to meet dogs in outdoor yards with shelter caregivers.
- **Concurrency & Capacity Rules:**
  - Enforces maximum attendee capacity (e.g. 8 spots).
  - Rejects past dates.
  - Prevents duplicate registration by the same user.
  - Automatically frees capacity when a user cancels.
- **Privacy Assurance:** Participant rosters display attendee names only without publicly leaking private phone numbers or emails.

---

## 5. Security & Authorization

1. **Role-Based Permissions:** Adopters can only create and view their own applications and preferences. Shelter staff have administrative rights over their shelter's listings and applications.
2. **PostgreSQL Row Level Security (RLS):** Policies defined in `supabase/migrations/20261027000000_init_pawpair.sql` verify `auth.uid()` against user profiles and shelter memberships.
3. **Atomic Stored Procedures:** Pessimistic row locking (`FOR UPDATE`) in SQL migrations guarantees that simultaneous group visit reservations never exceed maximum capacity.
4. **Environment Isolation:** Secrets are kept out of source code. `.env.example` provides documentation while `.env*` files are strictly excluded via `.gitignore`.
5. **Input Sanitization & Validation:** All user inputs (email, 10-digit phone, hours alone, required motivation lengths) are validated before data persistence.

---

## 6. Seed Data & Persona Walkthrough

PawPair includes realistic demonstration seed data across two rescue shelters:
- **Green Paws Rescue** (Seattle, WA) — Managed by Elena Vance.
- **Sunny Tails Animal Sanctuary** (Portland, OR) — Managed by Marcus Bennett.

### Pre-Configured Personas (Toggleable via top navbar):
1. **Maya Lin (Adopter):**
   - Active hybrid professional living in an apartment with a resident cat named Mochi.
   - Ideal testing persona for cat-friendly matching and adoption applications.
2. **Elena Vance (Shelter Staff):**
   - Shelter Director & Adoption Coordinator at Green Paws Rescue.
   - Access to the Shelter Management Dashboard.
3. **David Kim (Adopter):**
   - Suburban homeowner with fenced yard, previous dog experience.

---

## 7. Installation, Testing & Running Locally

### Prerequisites
- Node.js `v18+` (Tested on `v24.20.0`)
- npm `v9+` (Tested on `11.19.0`)

### Step 1: Clone and Navigate
```bash
cd pawpair
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Automated Test Suites
Execute all 14 unit tests covering matching logic, boundary conditions, hard welfare constraints, application lifecycles, and visit capacity limits:
```bash
npm test
```

### Step 4: Run Production Build
Verify the production bundle compiles with zero TypeScript errors:
```bash
npm run build
```

### Step 5: Start Local Development Server
```bash
npm run dev
```
Open **`http://127.0.0.1:5173/`** in your browser.

---

## 8. Database Setup (Optional Live Supabase)

To link PawPair to a live Supabase PostgreSQL instance:
1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Navigate to the SQL Editor and execute the migration file:
   `supabase/migrations/20261027000000_init_pawpair.sql`
3. Copy your project URL and anon public key into a local `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart Vite. PawPair will automatically detect the Supabase credentials.

---

## 9. Automated Test Coverage Summary

```
 ✓ src/tests/matchingEngine.test.ts (7 tests)
   ✓ handles missing adopter questionnaire gracefully
   ✓ produces high score for well-aligned adopter and dog
   ✓ triggers hard animal welfare constraint when adopter has cats and dog is not cat-safe
   ✓ triggers hard constraint when dog is not safe for small children
   ✓ penalizes significant exercise and energy deficits
   ✓ penalizes space mismatch when dog needs yard but adopter is in apartment without yard
   ✓ is strictly deterministic (identical inputs yield identical outputs)

 ✓ src/tests/dataService.test.ts (7 tests)
   ✓ submits a valid application and creates an initial timeline entry
   ✓ rejects duplicate active applications for the same dog and adopter
   ✓ allows shelter staff to update application status and appends timeline event
   ✓ prevents joining a visit when capacity is exceeded
   ✓ rejects duplicate participation in the same visit
   ✓ releases capacity when a participant cancels their visit
   ✓ rejects past dates when creating a shelter visit

Test Files  2 passed (2)
     Tests  14 passed (14)
```

---

## 10. Known Limitations & Future Roadmap

- **Live Chat:** Real-time messaging between adopter and shelter staff is currently modeled via coordinator timeline notes; future iterations will integrate Supabase Realtime channels.
- **Payment Gateway:** Adoption fee payments currently link to shelter placement agreements rather than direct Stripe processing to comply with non-profit shelter accounting requirements.
- **Native Geolocation:** Search radius currently filters by city/state string matching rather than PostGIS geospatial distance queries.
