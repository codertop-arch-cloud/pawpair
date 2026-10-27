# PawPair 🐾 — Full MERN Stack Architecture

PawPair is an ethical dog adoption and shelter discovery platform connecting prospective adopters with rescue dogs based on explainable lifestyle compatibility, living space, daily routines, and verified group shelter visits.

This project has been completely transformed into a production-grade **MERN** application using **MongoDB Atlas**, **Express**, **React 19**, **Node.js**, **Cloudinary**, **Multer**, **React Router**, **Axios**, **Socket.IO**, and **JWT authentication with HTTP-only cookies**, while preserving 100% of the existing UI design, styling, and user experience.

---

## Architecture Overview

```
pawpair/
├── client/                     # Frontend SPA (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, AuthModal, SavedDogsDrawer
│   │   ├── features/           # Discovery, Matching, Applications, Shelters, Visits
│   │   ├── services/           # Axios API client, Socket.IO client, seed data
│   │   ├── types/              # Domain interfaces
│   │   ├── App.tsx             # Main router & reactive state coordination
│   │   └── main.tsx            # BrowserRouter entry point
│   ├── package.json
│   └── vite.config.ts          # Vite proxy to Express API (/api, /socket.io)
├── server/                     # Backend API & Socket Server (Node.js + Express)
│   ├── config/                 # MongoDB Atlas connection & Cloudinary setup
│   ├── controllers/            # Auth, Dogs, Shelters, Applications, Visits, SavedDogs, Upload
│   ├── middleware/             # JWT auth with HTTP-only cookies, Multer upload, error handling
│   ├── models/                 # Mongoose models (User, Shelter, Dog, Application, Visit, etc.)
│   ├── routes/                 # Express API routes mounted under /api
│   ├── sockets/                # Socket.IO real-time event broadcasting
│   ├── utils/                  # Seeding utility for initial domain records
│   ├── tests/                  # Backend integration tests with Vitest & Supertest
│   ├── index.js                # Server entry point
│   ├── package.json
│   └── .env.example            # Environment template
├── package.json                # Monorepo scripts (concurrently dev, test, build, seed)
├── .gitignore
└── README.md
```

---

## Features

- **Dog Discovery & Detailed Profiles**: Browse rescue dogs with filters (size, energy, age, breed, fees). Modal profiles display personality backstory, medical history, welfare flags, and shelter details.
- **Explainable Lifestyle Compatibility**: Multi-dimensional matching algorithm scoring prospective homes across activity, living environment, experience, household pets, and schedule.
- **Persistent Adoption Applications**: Secure application submission with real-time shelter notifications, reviewer status updates, notes, and complete timeline audit trail.
- **Group Shelter Visits**: Real-time capacity-managed visit booking with duplicate prevention and attendee tracking.
- **Shelter Staff Management Dashboard**: Complete management portal allowing authorized staff to manage listings, upload media directly to Cloudinary via Multer, review applicant dossiers, and schedule group visits.
- **Secure Authentication & Identity Enforcement**: Passwords hashed with `bcryptjs`, sessions issued through secure, HTTP-only JWT cookies. User roles and shelter ownership are derived on the server.
- **Real-time Synchronization**: Socket.IO integration for live application submissions, review updates, capacity changes, and listing modifications.

---

## Configuration

Server environment variables (`server/.env`):

```ini
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://<username>:<password>@<cluster-shards>/pawpair?ssl=true&replicaSet=atlas-g2f3rr-shard-0&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=pawpair_super_secret_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=dtqsa2oh
CLOUDINARY_API_KEY=738738788838782
CLOUDINARY_API_SECRET=-P7fY8H8PDfAgMxfHMSnwnOXZAg
```

---

## Getting Started

### 1. Install Dependencies
Install all root, client, and server dependencies with one command:
```bash
npm run install:all
```

### 2. Seed Database
Initialize MongoDB Atlas with the rich initial domain dataset:
```bash
npm run seed
```

### 3. Run Development Servers
Start both the Express backend (`localhost:5001`) and Vite frontend (`localhost:5173`) concurrently:
```bash
npm run dev
```

### 4. Run Test Suites
Run all frontend and backend tests:
```bash
npm test
```

### 5. Production Build
Build the client application:
```bash
npm run build
```

---

## Demo Personas

The database ships with ready-to-test personas accessible from the top-right persona switcher or login modal:
- **Maya Lin** (`maya.lin@example.com`) — Prospective adopter in an apartment
- **Elena Rostova** (`elena.rostova@example.com`) — Active suburban adopter with an existing dog
- **Marcus Vance** (`marcus.vance@example.com`) — Shelter Manager at *Green Paws Rescue*
- **Sarah Chen** (`sarah.chen@example.com`) — Director at *Second Chance Rescue Collective*
