import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore } from '../services/dataService';
import { SEED_USERS } from '../services/seedData';

describe('PawPair Data Service & Workflows', () => {
  beforeEach(() => {
    dataStore.resetAllToSeed();
  });

  describe('Adoption Applications Lifecycle', () => {
    it('submits a valid application and creates an initial timeline entry', () => {
      const adopter = SEED_USERS[0]; // Maya Lin
      const app = dataStore.submitApplication({
        dogId: 'dog-barnaby',
        adopterId: adopter.id,
        applicantName: adopter.fullName,
        applicantEmail: adopter.email,
        applicantPhone: '(206) 555-4412',
        address: '123 Pine St, Seattle, WA',
        housingType: 'rent_apartment',
        hasYard: false,
        hoursAlonePerDay: 3,
        householdMembers: '1 adult',
        existingPetsDetails: '1 cat',
        experienceDescription: 'Experienced dog owner',
        reasonForAdopting: 'Looking for a gentle companion',
      });

      expect(app.id).toBeDefined();
      expect(app.status).toBe('submitted');
      expect(app.dogName).toBe('Barnaby');
      expect(app.timeline.length).toBe(1);
      expect(app.timeline[0].status).toBe('submitted');
    });

    it('rejects duplicate active applications for the same dog and adopter', () => {
      const adopter = SEED_USERS[0];
      // App for clover already exists in seed data for Maya Lin
      expect(() => {
        dataStore.submitApplication({
          dogId: 'dog-clover',
          adopterId: adopter.id,
          applicantName: adopter.fullName,
          applicantEmail: adopter.email,
          applicantPhone: '(206) 555-4412',
          address: '123 Pine St, Seattle, WA',
          housingType: 'rent_apartment',
          hasYard: false,
          hoursAlonePerDay: 3,
          householdMembers: '1 adult',
          existingPetsDetails: '1 cat',
          experienceDescription: 'Experienced dog owner',
          reasonForAdopting: 'Looking for a gentle companion',
        });
      }).toThrow(/already have an active application/i);
    });

    it('allows shelter staff to update application status and appends timeline event', () => {
      const apps = dataStore.getApplications();
      const targetApp = apps[0];

      const updated = dataStore.updateApplicationStatus(
        targetApp.id,
        'approved',
        'Home check completed successfully.',
        'Elena Vance'
      );

      expect(updated.status).toBe('approved');
      expect(updated.timeline[updated.timeline.length - 1].status).toBe('approved');
      expect(updated.timeline[updated.timeline.length - 1].actorName).toBe('Elena Vance');
    });
  });

  describe('Shelter Group Visits & Capacity Enforcement', () => {
    it('prevents joining a visit when capacity is exceeded', () => {
      // Create a test visit with capacity 1
      const visit = dataStore.createVisit({
        shelterId: 'shelter-green-paws',
        title: 'Exclusive Mini Visit',
        description: 'Single slot visit test',
        date: '2026-12-01',
        startTime: '10:00',
        endTime: '11:00',
        capacity: 1,
      });

      // User 1 joins
      const user1 = SEED_USERS[0];
      const res1 = dataStore.joinVisit(visit.id, user1);
      expect(res1.success).toBe(true);
      expect(res1.newCount).toBe(1);

      // User 2 attempts to join
      const user2 = SEED_USERS[2];
      expect(() => {
        dataStore.joinVisit(visit.id, user2);
      }).toThrow(/reached its maximum capacity/i);
    });

    it('rejects duplicate participation in the same visit', () => {
      const visit = dataStore.createVisit({
        shelterId: 'shelter-green-paws',
        title: 'Multi Spot Visit',
        description: 'Test duplicates',
        date: '2026-12-02',
        startTime: '14:00',
        endTime: '15:00',
        capacity: 5,
      });

      const user = SEED_USERS[0];
      dataStore.joinVisit(visit.id, user);

      expect(() => {
        dataStore.joinVisit(visit.id, user);
      }).toThrow(/already registered/i);
    });

    it('releases capacity when a participant cancels their visit', () => {
      const visit = dataStore.createVisit({
        shelterId: 'shelter-green-paws',
        title: 'Cancellation Test Visit',
        description: 'Testing leaving a visit',
        date: '2026-12-03',
        startTime: '10:00',
        endTime: '11:00',
        capacity: 4,
      });

      const user = SEED_USERS[0];
      dataStore.joinVisit(visit.id, user);
      expect(dataStore.getVisitById(visit.id)?.participantCount).toBe(1);

      const leaveRes = dataStore.leaveVisit(visit.id, user.id);
      expect(leaveRes.success).toBe(true);
      expect(leaveRes.newCount).toBe(0);
      expect(dataStore.getVisitById(visit.id)?.participantCount).toBe(0);
    });

    it('rejects past dates when creating a shelter visit', () => {
      expect(() => {
        dataStore.createVisit({
          shelterId: 'shelter-green-paws',
          title: 'Past Visit',
          description: 'Should fail',
          date: '2020-01-01',
          startTime: '10:00',
          endTime: '11:00',
          capacity: 5,
        });
      }).toThrow(/cannot be in the past/i);
    });
  });
});
