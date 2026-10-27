import {
  Dog,
  Shelter,
  UserProfile,
  AdoptionApplication,
  ShelterVisit,
  AdopterLifestylePreferences,
  ApplicationStatus,
  VisitParticipant,
} from '../types';
import {
  SEED_DOGS,
  SEED_SHELTERS,
  SEED_USERS,
  SEED_APPLICATIONS,
  SEED_VISITS,
  SEED_VISIT_PARTICIPANTS,
  SEED_SAVED_DOGS,
  SEED_ADOPTER_PREFERENCES,
} from './seedData';

const STORAGE_KEYS = {
  DOGS: 'pawpair_dogs_v1',
  SHELTERS: 'pawpair_shelters_v1',
  USERS: 'pawpair_users_v1',
  APPLICATIONS: 'pawpair_applications_v1',
  VISITS: 'pawpair_visits_v1',
  VISIT_PARTICIPANTS: 'pawpair_visit_participants_v1',
  SAVED_DOGS: 'pawpair_saved_dogs_v1',
  PREFERENCES: 'pawpair_preferences_v1',
  CURRENT_USER: 'pawpair_current_user_v1',
};

interface SafeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStorage implements SafeStorage {
  private memoryStore = new Map<string, string>();
  getItem(key: string): string | null {
    return this.memoryStore.has(key) ? this.memoryStore.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.memoryStore.set(key, value);
  }
  removeItem(key: string): void {
    this.memoryStore.delete(key);
  }
}

function createSafeStorage(): SafeStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('__storage_test__', 'ok');
      window.localStorage.removeItem('__storage_test__');
      return window.localStorage;
    }
  } catch {
    // Falls through to memory storage
  }
  return new MemoryStorage();
}

const storage: SafeStorage = createSafeStorage();

// Check if Supabase environment variables are present
export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && !url.includes('placeholder'));
};

class LocalDataStore {
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (this.initialized) return;

    try {
      if (!storage.getItem(STORAGE_KEYS.DOGS)) {
        storage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(SEED_DOGS));
      }
      if (!storage.getItem(STORAGE_KEYS.SHELTERS)) {
        storage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(SEED_SHELTERS));
      }
      if (!storage.getItem(STORAGE_KEYS.USERS)) {
        storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      }
      if (!storage.getItem(STORAGE_KEYS.APPLICATIONS)) {
        storage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
      }
      if (!storage.getItem(STORAGE_KEYS.VISITS)) {
        storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(SEED_VISITS));
      }
      if (!storage.getItem(STORAGE_KEYS.VISIT_PARTICIPANTS)) {
        storage.setItem(STORAGE_KEYS.VISIT_PARTICIPANTS, JSON.stringify(SEED_VISIT_PARTICIPANTS));
      }
      if (!storage.getItem(STORAGE_KEYS.SAVED_DOGS)) {
        storage.setItem(STORAGE_KEYS.SAVED_DOGS, JSON.stringify(SEED_SAVED_DOGS));
      }
      if (!storage.getItem(STORAGE_KEYS.PREFERENCES)) {
        storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(SEED_ADOPTER_PREFERENCES));
      }
      if (!storage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0])); // Maya Lin default
      }
      this.initialized = true;
    } catch {
      this.initialized = true;
    }
  }

  public resetAllToSeed(): void {
    try {
      storage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(SEED_DOGS));
      storage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(SEED_SHELTERS));
      storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      storage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
      storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(SEED_VISITS));
      storage.setItem(STORAGE_KEYS.VISIT_PARTICIPANTS, JSON.stringify(SEED_VISIT_PARTICIPANTS));
      storage.setItem(STORAGE_KEYS.SAVED_DOGS, JSON.stringify(SEED_SAVED_DOGS));
      storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(SEED_ADOPTER_PREFERENCES));
      storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    } catch (err) {
      console.error('Failed to reset localStorage data', err);
    }
  }

  // --- Current User & Authentication ---
  public getCurrentUser(): UserProfile | null {
    try {
      const data = storage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data === 'null') return null;
      return data ? JSON.parse(data) : SEED_USERS[0];
    } catch {
      return SEED_USERS[0];
    }
  }

  public setCurrentUser(user: UserProfile | null): void {
    try {
      if (user === null) {
        storage.setItem(STORAGE_KEYS.CURRENT_USER, 'null');
      } else {
        storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to save current user', err);
    }
  }

  public getAllUsers(): UserProfile[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  }

  public getAllDemoUsers(): UserProfile[] {
    return this.getAllUsers();
  }

  public registerUser(params: {
    fullName: string;
    email: string;
    password?: string;
    role: 'adopter' | 'shelter_staff';
    city?: string;
    phone?: string;
    shelterId?: string;
    avatarUrl?: string;
    bio?: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    try {
      const trimmedEmail = params.email.trim().toLowerCase();
      if (!trimmedEmail) {
        return { success: false, error: 'Email address is required.' };
      }
      if (!params.fullName.trim()) {
        return { success: false, error: 'Full name is required.' };
      }

      const users = this.getAllUsers();
      const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (existingUser) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please log in instead.',
        };
      }

      const defaultAvatar =
        params.avatarUrl?.trim() ||
        (params.role === 'shelter_staff'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

      const newUser: UserProfile = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fullName: params.fullName.trim(),
        email: trimmedEmail,
        password: params.password,
        role: params.role,
        city: params.city?.trim() || 'Seattle, WA',
        phone: params.phone?.trim() || '(555) 000-0000',
        shelterId:
          params.role === 'shelter_staff'
            ? params.shelterId || 'shelter-green-paws'
            : undefined,
        avatarUrl: defaultAvatar,
        bio: params.bio,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      this.setCurrentUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      console.error('Failed to register user', err);
      return { success: false, error: 'Registration failed due to storage error.' };
    }
  }

  public loginUser(
    email: string,
    password?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return { success: false, error: 'Email address is required.' };
      }

      const users = this.getAllUsers();
      const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

      if (!user) {
        return {
          success: false,
          error: 'No account found with this email. Please check your spelling or register a new profile.',
        };
      }

      if (user.password && password && user.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      this.setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      console.error('Failed to log in user', err);
      return { success: false, error: 'Login failed due to storage error.' };
    }
  }

  public logoutUser(): void {
    this.setCurrentUser(null);
  }

  // --- Dogs ---
  public getDogs(): Dog[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.DOGS);
      return data ? JSON.parse(data) : SEED_DOGS;
    } catch {
      return SEED_DOGS;
    }
  }

  public getDogById(id: string): Dog | undefined {
    return this.getDogs().find((d) => d.id === id);
  }

  public createDog(dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>): Dog {
    const dogs = this.getDogs();
    const newDog: Dog = {
      ...dogData,
      id: `dog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dogs.unshift(newDog);
    storage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(dogs));
    return newDog;
  }

  public updateDog(id: string, updates: Partial<Dog>): Dog {
    const dogs = this.getDogs();
    const index = dogs.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Dog with id ${id} not found`);
    }
    const updated = {
      ...dogs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dogs[index] = updated;
    storage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(dogs));
    return updated;
  }

  // --- Shelters ---
  public getShelters(): Shelter[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.SHELTERS);
      return data ? JSON.parse(data) : SEED_SHELTERS;
    } catch {
      return SEED_SHELTERS;
    }
  }

  public getShelterById(id: string): Shelter | undefined {
    return this.getShelters().find((s) => s.id === id);
  }

  // --- Saved Dogs ---
  public getSavedDogIds(userId: string): string[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.SAVED_DOGS);
      const parsed: Record<string, string[]> = data ? JSON.parse(data) : {};
      return parsed[userId] || [];
    } catch {
      return [];
    }
  }

  public toggleSaveDog(userId: string, dogId: string): boolean {
    try {
      const data = storage.getItem(STORAGE_KEYS.SAVED_DOGS);
      const parsed: Record<string, string[]> = data ? JSON.parse(data) : {};
      const userSaved = parsed[userId] || [];
      const index = userSaved.indexOf(dogId);
      let isSaved = false;
      if (index > -1) {
        userSaved.splice(index, 1);
        isSaved = false;
      } else {
        userSaved.push(dogId);
        isSaved = true;
      }
      parsed[userId] = userSaved;
      storage.setItem(STORAGE_KEYS.SAVED_DOGS, JSON.stringify(parsed));
      return isSaved;
    } catch {
      return false;
    }
  }

  // --- Adopter Preferences ---
  public getAdopterPreferences(userId: string): AdopterLifestylePreferences | null {
    try {
      const data = storage.getItem(STORAGE_KEYS.PREFERENCES);
      const parsed: Record<string, AdopterLifestylePreferences> = data ? JSON.parse(data) : {};
      return parsed[userId] || null;
    } catch {
      return null;
    }
  }

  public saveAdopterPreferences(userId: string, prefs: AdopterLifestylePreferences): void {
    try {
      const data = storage.getItem(STORAGE_KEYS.PREFERENCES);
      const parsed: Record<string, AdopterLifestylePreferences> = data ? JSON.parse(data) : {};
      parsed[userId] = prefs;
      storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(parsed));
    } catch (err) {
      console.error('Failed to save adopter preferences', err);
    }
  }

  // --- Adoption Applications ---
  public getApplications(filter?: { shelterId?: string; adopterId?: string }): AdoptionApplication[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.APPLICATIONS);
      const apps: AdoptionApplication[] = data ? JSON.parse(data) : SEED_APPLICATIONS;
      return apps.filter((app) => {
        if (filter?.shelterId && app.shelterId !== filter.shelterId) return false;
        if (filter?.adopterId && app.adopterId !== filter.adopterId) return false;
        return true;
      });
    } catch {
      return SEED_APPLICATIONS;
    }
  }

  public submitApplication(appInput: {
    dogId: string;
    adopterId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    address: string;
    housingType: 'own_house' | 'rent_house' | 'rent_apartment';
    hasYard: boolean;
    landlordApproval?: boolean;
    hoursAlonePerDay: number;
    householdMembers: string;
    existingPetsDetails: string;
    vetReference?: { clinicName: string; phone: string };
    experienceDescription: string;
    reasonForAdopting: string;
  }): AdoptionApplication {
    const dog = this.getDogById(appInput.dogId);
    if (!dog) {
      throw new Error('Target dog profile does not exist.');
    }
    if (dog.status === 'adopted') {
      throw new Error('This dog has already been adopted and is no longer accepting applications.');
    }

    const allApps = this.getApplications();

    // Prevent duplicate active applications
    const activeExisting = allApps.find(
      (a) =>
        a.dogId === appInput.dogId &&
        a.adopterId === appInput.adopterId &&
        !['rejected', 'withdrawn'].includes(a.status)
    );
    if (activeExisting) {
      throw new Error(
        `You already have an active application (${activeExisting.status.replace(/_/g, ' ')}) on file for ${dog.name}. Please wait for shelter review or contact the shelter directly.`
      );
    }

    const shelter = this.getShelterById(dog.shelterId);
    const newApp: AdoptionApplication = {
      ...appInput,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dogName: dog.name,
      dogPhoto: dog.photos[0] || '',
      shelterId: dog.shelterId,
      shelterName: shelter ? shelter.name : dog.shelterName || 'Shelter Partner',
      status: 'submitted',
      timeline: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          actorName: appInput.applicantName,
          note: 'Application received and logged into shelter queue.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allApps.unshift(newApp);
    storage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(allApps));
    return newApp;
  }

  public updateApplicationStatus(
    appId: string,
    status: ApplicationStatus,
    note?: string,
    actorName: string = 'Shelter Coordinator'
  ): AdoptionApplication {
    const allApps = this.getApplications();
    const index = allApps.findIndex((a) => a.id === appId);
    if (index === -1) {
      throw new Error(`Application with id ${appId} not found.`);
    }

    const current = allApps[index];
    const updatedTimeline = [
      ...current.timeline,
      {
        status,
        timestamp: new Date().toISOString(),
        actorName,
        note: note || `Application status transitioned to ${status.replace(/_/g, ' ')}.`,
      },
    ];

    const updated: AdoptionApplication = {
      ...current,
      status,
      shelterNotes: note ? `${note} (Updated by ${actorName})` : current.shelterNotes,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    };

    allApps[index] = updated;
    storage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(allApps));
    return updated;
  }

  // --- Shelter Visits ---
  public getVisits(shelterId?: string): ShelterVisit[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.VISITS);
      const visits: ShelterVisit[] = data ? JSON.parse(data) : SEED_VISITS;
      return visits.filter((v) => (!shelterId ? true : v.shelterId === shelterId));
    } catch {
      return SEED_VISITS;
    }
  }

  public getVisitById(id: string): ShelterVisit | undefined {
    return this.getVisits().find((v) => v.id === id);
  }

  public isUserRegisteredForVisit(visitId: string, userId: string): boolean {
    try {
      const data = storage.getItem(STORAGE_KEYS.VISIT_PARTICIPANTS);
      const map: Record<string, VisitParticipant[]> = data ? JSON.parse(data) : SEED_VISIT_PARTICIPANTS;
      return (map[visitId] || []).some((p) => p.userId === userId && p.status === 'confirmed');
    } catch {
      return false;
    }
  }

  // only shelter staff can see the participant list
  public getVisitParticipants(visitId: string, requester?: UserProfile): VisitParticipant[] {
    const caller = requester || this.getCurrentUser();
    if (!caller || caller.role !== 'shelter_staff') {
      return [];
    }

    try {
      const data = storage.getItem(STORAGE_KEYS.VISIT_PARTICIPANTS);
      const map: Record<string, VisitParticipant[]> = data ? JSON.parse(data) : SEED_VISIT_PARTICIPANTS;
      return (map[visitId] || []).filter((p) => p.status === 'confirmed');
    } catch {
      return [];
    }
  }

  public createVisit(visitData: {
    shelterId: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }): ShelterVisit {
    if (new Date(visitData.date) < new Date(new Date().toISOString().split('T')[0])) {
      throw new Error('Visit date cannot be in the past.');
    }
    if (visitData.capacity <= 0) {
      throw new Error('Visit capacity must be at least 1.');
    }

    const shelter = this.getShelterById(visitData.shelterId);
    if (!shelter) {
      throw new Error('Shelter not found.');
    }

    const allVisits = this.getVisits();
    const newVisit: ShelterVisit = {
      ...visitData,
      id: `visit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shelterName: shelter.name,
      shelterAddress: `${shelter.address}, ${shelter.city}, ${shelter.state}`,
      participantCount: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    allVisits.push(newVisit);
    storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(allVisits));
    return newVisit;
  }

  public joinVisit(
    visitId: string,
    user: UserProfile,
    notes?: string
  ): { success: boolean; newCount: number } {
    const visits = this.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) {
      throw new Error('Shelter visit not found.');
    }

    const visit = visits[index];
    if (visit.status !== 'upcoming') {
      throw new Error('This visit is no longer open for sign-ups.');
    }

    // Atomic capacity check
    if (visit.participantCount >= visit.capacity) {
      throw new Error(
        `This visit has reached its maximum capacity of ${visit.capacity} attendees. Please select another date.`
      );
    }

    // Check participants
    const data = storage.getItem(STORAGE_KEYS.VISIT_PARTICIPANTS);
    const map: Record<string, VisitParticipant[]> = data ? JSON.parse(data) : {};
    const participants = map[visitId] || [];

    const existingIndex = participants.findIndex((p) => p.userId === user.id);
    if (existingIndex > -1 && participants[existingIndex].status === 'confirmed') {
      throw new Error('You are already registered for this shelter visit.');
    }

    if (existingIndex > -1) {
      participants[existingIndex].status = 'confirmed';
      participants[existingIndex].registeredAt = new Date().toISOString();
      if (notes) participants[existingIndex].notes = notes;
    } else {
      participants.push({
        id: `vp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        visitId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        notes,
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
      });
    }

    // Increment count
    visit.participantCount += 1;
    visits[index] = visit;

    map[visitId] = participants;
    storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    storage.setItem(STORAGE_KEYS.VISIT_PARTICIPANTS, JSON.stringify(map));

    return { success: true, newCount: visit.participantCount };
  }

  public leaveVisit(visitId: string, userId: string): { success: boolean; newCount: number } {
    const visits = this.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) {
      throw new Error('Shelter visit not found.');
    }

    const data = storage.getItem(STORAGE_KEYS.VISIT_PARTICIPANTS);
    const map: Record<string, VisitParticipant[]> = data ? JSON.parse(data) : {};
    const participants = map[visitId] || [];

    const existing = participants.find((p) => p.userId === userId && p.status === 'confirmed');
    if (!existing) {
      throw new Error('No confirmed registration found for this user.');
    }

    existing.status = 'cancelled';
    visits[index].participantCount = Math.max(0, visits[index].participantCount - 1);

    map[visitId] = participants;
    storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    storage.setItem(STORAGE_KEYS.VISIT_PARTICIPANTS, JSON.stringify(map));

    return { success: true, newCount: visits[index].participantCount };
  }

  public cancelVisit(visitId: string): void {
    const visits = this.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) {
      throw new Error('Shelter visit not found.');
    }
    visits[index].status = 'cancelled';
    storage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }
}

export const dataStore = new LocalDataStore();
