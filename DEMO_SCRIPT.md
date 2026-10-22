# PawPair — 3 to 5 Minute Demo Script & Presentation Guide

This script guides the evaluator or presenter through a complete 3 to 5-minute walkthrough of **PawPair**, highlighting engineering decisions, animal welfare intelligence, and end-to-end user workflows.

---

## Act 1: Problem & Value Proposition (0:00 – 0:45)

**Spoken Narration:**
> "Welcome to PawPair. Every year, over three million dogs enter animal shelters in the United States, and roughly 15 to 20 percent are returned post-adoption. Why? Not because adopters lack good intentions, but because existing platforms treat adoption like passive classified ads—relying on superficial photos without evaluating whether a dog's energy level, space needs, and prey drive match the adopter's actual lifestyle.
>
> PawPair is built differently. It's a humane, full-stack adoption platform engineered around three pillars:
> 1. Deterministic, explainable lifestyle compatibility matching with animal welfare hard constraints.
> 2. An end-to-end adoption application lifecycle with audit logs.
> 3. Coordinated group shelter visits where prospective adopters can meet dogs in a safe, staff-supervised community environment."

---

## Act 2: Dog Discovery & Rich Profiles (0:45 – 1:30)

**On-Screen Action:**
1. Start at `http://127.0.0.1:5173/` on the **Discover Dogs** tab.
2. Observe the top demo mode strip showing that the application is running with persistent browser storage and persona switcher.
3. Show the **Tinder-style Swipe Stack**:
   - Point out Clover's card: large photograph, breed, age, shelter name, and real-time compatibility score badge.
   - Click the pass button or press the left arrow key, then click the **Undo** button (↺) to demonstrate stack history restoration.
4. Switch to **Browse Grid View**:
   - Demonstrate quick filters: toggle 'Cat-Friendly Only' or select 'Low Energy'. Notice how the cards filter dynamically.
5. Click on **Clover** or **Barnaby** to open the **Dog Detail Modal**:
   - Highlight the photo gallery and video preview toggle.
   - Show the veterinary verification checklist: vaccinations, spayed/neutered, microchipped.
   - Point out the **Explainable Compatibility Card**: note the breakdown scores across Household Safety, Activity, Living Space, Experience, and Schedule.

**Spoken Narration:**
> "In Discovery, adopters have both a card stack for intuitive browsing and a structured grid. When opening a dog's profile, notice that we don't just display a random percentage. We provide a transparent breakdown explaining why this dog fits the adopter's routine, and we explicitly highlight care considerations and medical notes."

---

## Act 3: Explainable Compatibility Engine & Welfare Constraints (1:30 – 2:30)

**On-Screen Action:**
1. Click **Lifestyle Match** in the navigation bar.
2. Show the 7-dimension questionnaire on the left and the live ranked match results on the right.
3. **Trigger an Animal Welfare Hard Constraint:**
   - In Section 1, check **'Resident Cat(s)'**.
   - Scroll through the results to find a dog that is documented as not cat-safe (such as **Zephyr** or **Atlas**).
   - Point out that instead of averaging out the score, the algorithm triggers a **Critical Welfare Constraint**:
     - Score is capped at ≤ 32%.
     - Marked with a red alert banner: *'Safety restriction: Dog has high prey drive or is documented as not safe living with cats.'*
4. Now change the questionnaire to reflect an active, house-with-yard lifestyle and click **'Save & Update All Match Calculations'**:
   - Point out the green confirmation toast.
   - Note how scores across all dogs recalculate deterministically.

**Spoken Narration:**
> "Our compatibility engine is completely deterministic and test-backed. A key engineering decision was implementing animal welfare hard constraints. If an adopter has a cat and a rescue dog has high prey drive, standard recommender systems might still rate them at 80% because of matching size or energy. PawPair strictly overrides the score, capping it and warning both the adopter and shelter to protect animal welfare."

---

## Act 4: Adoption Application Lifecycle & Shelter Portal (2:30 – 3:45)

**On-Screen Action:**
1. Return to **Discover Dogs**, open **Barnaby**'s profile, and click **'Apply to Adopt Barnaby'**.
2. Walk through the application form:
   - Point out pre-filled fields from the user profile.
   - Note the validation: residential address, landlord confirmation for renters, hours left alone, and veterinary clinic reference.
   - Check the honesty declaration and click **'Submit Application for Barnaby'**.
3. The app redirects to **My Applications**:
   - Show Barnaby's application now listed with status `'submitted'`.
   - Show the chronological audit timeline.
4. **Demonstrate Shelter Management:**
   - In the top right persona dropdown, switch from **Maya Lin (Adopter)** to **Elena Vance (Shelter Staff)**.
   - Click **Shelter Portal**:
     - Point out the shelter overview metrics: active listings, pending applications, approved placements.
     - Click the **Adoption Applications** tab.
     - Find the application just submitted.
     - Click **'Update Status'**, select `'Approve for Meet-and-Greet'`, enter a coordinator note (*'References verified. Home visit scheduled for Saturday 11am.'*), and click **'Confirm Status Change'**.
   - Switch back to **Maya Lin** and navigate to **My Applications**:
     - Verify that the status immediately reflects `'Approved for Meet & Greet'` with Elena's audit note visible in the timeline!

**Spoken Narration:**
> "Notice the complete round-trip lifecycle. An application is submitted with validation and duplicate prevention. Shelter staff review the application, add notes, and transition its state. When the adopter checks their portal, the state and timeline are synchronized."

---

## Act 5: Group Shelter Visits & Architecture Wrap-Up (3:45 – 4:30)

**On-Screen Action:**
1. Click **Group Visits** in the navigation bar.
2. Highlight the safety assurance: shelter-supervised, on-site, and private user contact details are never leaked.
3. Show the **Capacity Progress Bar** (e.g. 5 / 8 attendees).
4. Click **'Join Group Shelter Visit'** and confirm:
   - Notice the attendee count increments to 6 / 8, the progress bar updates, and the button changes to a green `'You're Going'` badge.
   - Click **'Cancel My Reservation'** to demonstrate capacity being released atomically.
5. Conclude the demonstration.

**Spoken Narration:**
> "Under the hood, PawPair is built with React 19, TypeScript, and Tailwind CSS v4. Data access is abstracted behind a repository interface that supports persistent browser storage with safe fallbacks and a full Supabase PostgreSQL schema with Row Level Security and atomic stored procedures.
>
> All 14 automated unit tests are passing, covering matching boundaries, duplicate prevention, and capacity enforcement.
>
> Thank you for reviewing PawPair—reimagining dog adoption through engineering, empathy, and animal welfare."

---

## Checklist for Live Video Recording
- [x] Resolution: 1080p (1920x1080).
- [x] Server running at `http://127.0.0.1:5173/`.
- [x] Automated test suite verified (`npm test`).
- [x] Production build verified (`npm run build`).
- [x] Clean browser recording available in artifacts.
