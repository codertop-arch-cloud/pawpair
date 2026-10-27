# PawPair 🐾

A dog adoption platform I built for my Software Engineering course project. The idea was to make something actually useful — most adoption sites just show you a photo and a name, which doesn't help you figure out if the dog actually fits your lifestyle.

## What it does

- **Dog discovery** — browse available rescue dogs with detailed profiles (energy level, temperament, medical info, etc.)
- **Lifestyle matching** — fill in a quick questionnaire about your living situation, activity level, work schedule and it scores dogs by compatibility. Shows you *why* a dog is or isn't a good match, not just a percentage
- **Adoption applications** — submit and track applications, shelter staff can review and update status
- **Group shelter visits** — book coordinated visits to meet dogs in person, see who else is coming
- **Shelter management dashboard** — staff view to manage listings, review applications, schedule visits
- **Auth** — register a profile, log in, switch between adopter/shelter-staff roles

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- localStorage for persistence (no backend needed to run)
- Vitest for tests

## Running locally

```bash
npm install
npm run dev
```

Tests:
```bash
npm test
```

## Project structure

```
src/
├── features/
│   ├── discovery/      # dog browsing + detail modal
│   ├── matching/       # compatibility engine + UI
│   ├── applications/   # submit + track adoption apps
│   ├── shelters/       # shelter staff dashboard
│   └── visits/         # group visit booking
├── components/         # navbar, saved dogs drawer, auth modal
├── services/           # data layer + seed data
├── types/              # TypeScript interfaces
└── tests/              # matching engine + data service tests
```

## Demo accounts

The app ships with some seeded data. You can register your own account or use the demo persona switcher (under the account dropdown) to switch between:
- **Maya Lin** — prospective adopter
- **Jordan Rivera** — adopter  
- **Dr. Sarah Mitchell** — shelter staff at Green Paws

## Notes

- All data is stored in localStorage, so it persists between sessions but is local to your browser
- Reset Sample Data option in the demo panel restores everything to the initial seed data
- The Supabase integration files are included but optional — runs fully offline without any env vars

---

*Built for CS end-term project, Oct 2026*
