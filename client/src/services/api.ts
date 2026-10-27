import axios from 'axios';
import {
  Dog,
  Shelter,
  UserProfile,
  AdoptionApplication,
  ShelterVisit,
  AdopterLifestylePreferences,
  VisitParticipant,
} from '../types';

// In production VITE_API_BASE is set to https://pawpair-wgz8.onrender.com/api via Vercel env vars.
// In local development it is not set, so we fall back to '/api' and let the Vite dev proxy
// (vite.config.ts → server.proxy) forward requests to http://localhost:5001.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept responses for clear error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  getMe: async (): Promise<UserProfile | null> => {
    try {
      const res = await api.get<{ success: boolean; user: UserProfile }>('/auth/me');
      return res.data.user;
    } catch {
      return null;
    }
  },

  login: async (email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await api.post<{ success: boolean; user: UserProfile }>('/auth/login', {
        email,
        password,
      });
      return { success: true, user: res.data.user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  register: async (params: {
    fullName: string;
    email: string;
    password?: string;
    role: 'adopter' | 'shelter_staff';
    city?: string;
    phone?: string;
    shelterId?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await api.post<{ success: boolean; user: UserProfile }>('/auth/register', params);
      return { success: true, user: res.data.user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  demoSwitch: async (userIdentifier: { userId?: string; email?: string }): Promise<UserProfile> => {
    const res = await api.post<{ success: boolean; user: UserProfile }>('/auth/demo-switch', userIdentifier);
    return res.data.user;
  },

  getDemoUsers: async (): Promise<UserProfile[]> => {
    const res = await api.get<{ success: boolean; users: UserProfile[] }>('/auth/demo-users');
    return res.data.users;
  },
};

// Dogs Service
export const dogService = {
  getDogs: async (params?: Record<string, any>): Promise<Dog[]> => {
    const res = await api.get<Dog[]>('/dogs', { params });
    return res.data;
  },

  getDogById: async (id: string): Promise<Dog> => {
    const res = await api.get<Dog>(`/dogs/${id}`);
    return res.data;
  },

  createDog: async (dogData: Partial<Dog>): Promise<Dog> => {
    const res = await api.post<Dog>('/dogs', dogData);
    return res.data;
  },

  updateDog: async (id: string, updates: Partial<Dog>): Promise<Dog> => {
    const res = await api.patch<Dog>(`/dogs/${id}`, updates);
    return res.data;
  },

  deleteDog: async (id: string): Promise<void> => {
    await api.delete(`/dogs/${id}`);
  },
};

// Shelters Service
export const shelterService = {
  getShelters: async (): Promise<Shelter[]> => {
    const res = await api.get<Shelter[]>('/shelters');
    return res.data;
  },

  getShelterById: async (id: string): Promise<Shelter> => {
    const res = await api.get<Shelter>(`/shelters/${id}`);
    return res.data;
  },

  updateShelter: async (id: string, updates: Partial<Shelter>): Promise<Shelter> => {
    const res = await api.patch<Shelter>(`/shelters/${id}`, updates);
    return res.data;
  },
};

// Applications Service
export const applicationService = {
  getApplications: async (): Promise<AdoptionApplication[]> => {
    const res = await api.get<AdoptionApplication[]>('/applications');
    return res.data;
  },

  submitApplication: async (appData: Record<string, any>): Promise<AdoptionApplication> => {
    const res = await api.post<AdoptionApplication>('/applications', appData);
    return res.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    note?: string
  ): Promise<AdoptionApplication> => {
    const res = await api.patch<AdoptionApplication>(`/applications/${id}/status`, {
      status,
      note,
    });
    return res.data;
  },
};

// Visits Service
export const visitService = {
  getVisits: async (shelterId?: string): Promise<ShelterVisit[]> => {
    const res = await api.get<ShelterVisit[]>('/visits', {
      params: shelterId ? { shelterId } : undefined,
    });
    return res.data;
  },

  getVisitById: async (id: string): Promise<ShelterVisit> => {
    const res = await api.get<ShelterVisit>(`/visits/${id}`);
    return res.data;
  },

  createVisit: async (visitData: Record<string, any>): Promise<ShelterVisit> => {
    const res = await api.post<ShelterVisit>('/visits', visitData);
    return res.data;
  },

  joinVisit: async (id: string, notes?: string): Promise<{ success: boolean; visit: ShelterVisit }> => {
    const res = await api.post<{ success: boolean; visit: ShelterVisit }>(`/visits/${id}/join`, { notes });
    return res.data;
  },

  leaveVisit: async (id: string): Promise<{ success: boolean; visit: ShelterVisit }> => {
    const res = await api.post<{ success: boolean; visit: ShelterVisit }>(`/visits/${id}/leave`);
    return res.data;
  },

  getUserVisitStatus: async (id: string): Promise<boolean> => {
    try {
      const res = await api.get<{ isRegistered: boolean }>(`/visits/${id}/status`);
      return res.data.isRegistered;
    } catch {
      return false;
    }
  },

  getMyRegistrations: async (): Promise<string[]> => {
    try {
      const res = await api.get<string[]>('/visits/my-registrations');
      return res.data;
    } catch {
      return [];
    }
  },

  getParticipants: async (id: string): Promise<VisitParticipant[]> => {
    const res = await api.get<VisitParticipant[]>(`/visits/${id}/participants`);
    return res.data;
  },

  cancelVisit: async (id: string): Promise<ShelterVisit> => {
    const res = await api.patch<ShelterVisit>(`/visits/${id}/cancel`);
    return res.data;
  },
};

// Saved Dogs Service
export const savedDogService = {
  getSavedDogIds: async (): Promise<string[]> => {
    try {
      const res = await api.get<string[]>('/saved-dogs');
      return res.data;
    } catch {
      return [];
    }
  },

  toggleSaveDog: async (dogId: string): Promise<boolean> => {
    const res = await api.post<{ saved: boolean; dogId: string }>('/saved-dogs/toggle', { dogId });
    return res.data.saved;
  },
};

// Preferences Service
export const preferenceService = {
  getPreferences: async (): Promise<AdopterLifestylePreferences | null> => {
    try {
      const res = await api.get<AdopterLifestylePreferences | null>('/preferences');
      return res.data;
    } catch {
      return null;
    }
  },

  savePreferences: async (prefs: AdopterLifestylePreferences): Promise<AdopterLifestylePreferences> => {
    const res = await api.put<AdopterLifestylePreferences>('/preferences', prefs);
    return res.data;
  },
};

// Upload Service (Multer + Cloudinary)
export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ success: boolean; url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.url;
  },
};

export default api;
