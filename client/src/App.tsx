import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SavedDogsDrawer } from './components/SavedDogsDrawer';
import { AuthModal } from './components/AuthModal';
import { DogDiscoveryView } from './features/discovery/DogDiscoveryView';
import { DogDetailModal } from './features/discovery/DogDetailModal';
import { LifestyleMatcher } from './features/matching/LifestyleMatcher';
import { AdoptionApplicationModal } from './features/applications/AdoptionApplicationModal';
import { MyApplicationsView } from './features/applications/MyApplicationsView';
import { ShelterManagementDashboard } from './features/shelters/ShelterManagementDashboard';
import { GroupVisitsView } from './features/visits/GroupVisitsView';
import {
  authService,
  dogService,
  shelterService,
  applicationService,
  visitService,
  savedDogService,
  preferenceService,
} from './services/api';
import { getSocket, joinRooms } from './services/socket';
import {
  Dog,
  Shelter,
  UserProfile,
  AdoptionApplication,
  ShelterVisit,
  AdopterLifestylePreferences,
} from './types';
import { Sparkles, X, AlertTriangle, RefreshCw } from 'lucide-react';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab derived from URL route
  const currentTab = (() => {
    const path = location.pathname.replace(/^\//, '');
    if (!path || path === 'discover') return 'discover';
    if (path.startsWith('dogs/')) return 'discover';
    if (['matching', 'applications', 'visits', 'shelter'].includes(path)) return path;
    return 'discover';
  })();

  const setCurrentTab = (tab: string) => {
    navigate(`/${tab === 'discover' ? '' : tab}`);
  };

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Core entities state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [visits, setVisits] = useState<ShelterVisit[]>([]);
  const [adopterPreferences, setAdopterPreferences] = useState<AdopterLifestylePreferences | null>(null);
  const [savedDogIds, setSavedDogIds] = useState<string[]>([]);

  // Modals and UI state
  const [selectedDogForModal, setSelectedDogForModal] = useState<Dog | null>(null);
  const [selectedDogForApplication, setSelectedDogForApplication] = useState<Dog | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize user-specific data from persistent MongoDB backend
  const refreshUserData = useCallback(async (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      joinRooms(user.id, user.shelterId);
      try {
        const [prefs, saved, apps] = await Promise.all([
          preferenceService.getPreferences(),
          savedDogService.getSavedDogIds(),
          applicationService.getApplications(),
        ]);
        setAdopterPreferences(prefs);
        setSavedDogIds(saved);
        setApplications(apps);
      } catch (err: any) {
        console.error('Failed to load user-specific data:', err);
      }
    } else {
      setAdopterPreferences(null);
      setSavedDogIds([]);
      setApplications([]);
    }
  }, []);

  // Fetch all core domain data from MongoDB backend
  const refreshAllData = useCallback(async () => {
    try {
      setApiError(null);
      const [fetchedDogs, fetchedShelters, fetchedVisits, fetchedDemos] = await Promise.all([
        dogService.getDogs(),
        shelterService.getShelters(),
        visitService.getVisits(),
        authService.getDemoUsers().catch(() => []),
      ]);

      setDogs(fetchedDogs);
      setShelters(fetchedShelters);
      setVisits(fetchedVisits);
      if (fetchedDemos.length > 0) setDemoUsers(fetchedDemos);

      // Refresh logged-in user specific data
      const user = await authService.getMe();
      await refreshUserData(user);
    } catch (err: any) {
      console.error('Error fetching data from MongoDB backend:', err);
      setApiError(err.message || 'Unable to connect to PawPair database backend.');
    } finally {
      setLoading(false);
    }
  }, [refreshUserData]);

  // Initial load on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // URL dog detail modal handling (e.g. /dogs/:id)
  useEffect(() => {
    const match = location.pathname.match(/^\/dogs\/(.+)$/);
    if (match && match[1] && dogs.length > 0) {
      const dog = dogs.find((d) => d.id === match[1]);
      if (dog) setSelectedDogForModal(dog);
    }
  }, [location.pathname, dogs]);

  // Real-time Socket.IO subscriptions
  useEffect(() => {
    const socket = getSocket();

    const handleApplicationNew = (newApp: AdoptionApplication) => {
      setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
      showToast(`New adoption application submitted for ${newApp.dogName}!`);
    };

    const handleApplicationUpdated = (updatedApp: AdoptionApplication) => {
      setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
      showToast(`Application for ${updatedApp.dogName} updated to ${updatedApp.status.replace('_', ' ')}`);
    };

    const handleVisitUpdated = (updatedVisit: ShelterVisit) => {
      setVisits((prev) => prev.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
    };

    const handleVisitCreated = (newVisit: ShelterVisit) => {
      setVisits((prev) => [...prev, newVisit]);
    };

    const handleDogCreated = (newDog: Dog) => {
      setDogs((prev) => [newDog, ...prev]);
    };

    const handleDogUpdated = (updatedDog: Dog) => {
      setDogs((prev) => prev.map((d) => (d.id === updatedDog.id ? updatedDog : d)));
    };

    const handleDogDeleted = ({ id }: { id: string }) => {
      setDogs((prev) => prev.filter((d) => d.id !== id));
    };

    socket.on('application:new', handleApplicationNew);
    socket.on('application:updated', handleApplicationUpdated);
    socket.on('visit:updated', handleVisitUpdated);
    socket.on('visit:created', handleVisitCreated);
    socket.on('dog:created', handleDogCreated);
    socket.on('dog:updated', handleDogUpdated);
    socket.on('dog:deleted', handleDogDeleted);

    return () => {
      socket.off('application:new', handleApplicationNew);
      socket.off('application:updated', handleApplicationUpdated);
      socket.off('visit:updated', handleVisitUpdated);
      socket.off('visit:created', handleVisitCreated);
      socket.off('dog:created', handleDogCreated);
      socket.off('dog:updated', handleDogUpdated);
      socket.off('dog:deleted', handleDogDeleted);
    };
  }, []);

  // ---- Auth handlers ----
  const handleLogin = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      await refreshUserData(result.user);
      showToast(`Welcome back, ${result.user.fullName.split(' ')[0]}! 👋`);
      return { success: true };
    }
    return { success: false, error: result.error || 'Login failed' };
  };

  const handleRegister = async (params: {
    fullName: string;
    email: string;
    password?: string;
    role: 'adopter' | 'shelter_staff';
    city?: string;
    phone?: string;
    shelterId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.register(params);
    if (result.success && result.user) {
      await refreshUserData(result.user);
      showToast(`Welcome to PawPair, ${result.user.fullName.split(' ')[0]}! 🐾`);
      return { success: true };
    }
    return { success: false, error: result.error || 'Registration failed' };
  };

  const handleLogout = async () => {
    await authService.logout();
    await refreshUserData(null);
    setCurrentTab('discover');
    showToast('You have been signed out.');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Toggle Save / Like Dog — persists to MongoDB
  const handleToggleSaveDog = async (dogId: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    try {
      const isNowSaved = await savedDogService.toggleSaveDog(dogId);
      setSavedDogIds((prev) =>
        isNowSaved ? [...prev, dogId] : prev.filter((id) => id !== dogId)
      );
      const target = dogs.find((d) => d.id === dogId);
      const dogName = target ? target.name : 'Dog';
      showToast(isNowSaved ? `Saved ${dogName} to favorites` : `Removed ${dogName} from favorites`);
    } catch (err: any) {
      showToast(err.message || 'Could not update favorites');
    }
  };

  // Safe development persona switching via HTTP-only JWT
  const handleSwitchDemoUser = async (user: UserProfile) => {
    try {
      const updatedUser = await authService.demoSwitch({ userId: user.id });
      await refreshUserData(updatedUser);
      showToast(`Switched to ${updatedUser.fullName} (${updatedUser.role === 'shelter_staff' ? 'Staff' : 'Adopter'})`);
    } catch (err: any) {
      showToast(err.message || 'Failed to switch demo persona');
    }
  };

  // Reset Demo Session / Seed Data
  const handleResetDemoData = async () => {
    if (
      window.confirm(
        'Switch to default demo adopter persona (Maya Lin) and refresh data from MongoDB Atlas?'
      )
    ) {
      try {
        const mayaUser = demoUsers.find((u) => u.email === 'maya.lin@example.com') || demoUsers[0];
        if (mayaUser) {
          const user = await authService.demoSwitch({ userId: mayaUser.id });
          await refreshUserData(user);
        }
        await refreshAllData();
        showToast('Demo session refreshed from MongoDB Atlas.');
      } catch (err: any) {
        showToast(err.message || 'Failed to refresh demo session');
      }
    }
  };

  // Save Preferences to MongoDB Atlas
  const handleSavePreferences = async (prefs: AdopterLifestylePreferences) => {
    if (!currentUser) return;
    try {
      const updated = await preferenceService.savePreferences(prefs);
      setAdopterPreferences(updated);
      showToast('Adopter lifestyle profile saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences');
    }
  };

  // Application Success Callback
  const handleApplicationSuccess = (app: AdoptionApplication) => {
    setApplications((prev) => [app, ...prev]);
    showToast(`Adoption application for ${app.dogName} submitted to shelter!`);
    setCurrentTab('applications');
  };

  const savedDogsList = dogs.filter((d) => savedDogIds.includes(d.id));
  const userApplicationsCount = currentUser
    ? applications.filter(
        (a) => a.adopterId === currentUser.id || currentUser.role === 'shelter_staff'
      ).length
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#181F1A] flex flex-col font-sans selection:bg-[#EDF4F0] selection:text-[#183B2B]">
      {/* API / Database Connection Error Banner */}
      {apiError && (
        <div className="bg-[#B85438] text-white px-4 py-2 text-xs flex items-center justify-between shadow-md z-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Backend Notice:</strong> {apiError} Ensure the PawPair Express server and MongoDB Atlas cluster are active.
            </span>
          </div>
          <button
            onClick={() => refreshAllData()}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white font-semibold px-2 py-1 rounded-md text-[11px] transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#183B2B] text-white pl-4 pr-3 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200 border border-[#24533E] max-w-sm">
          <Sparkles className="w-4 h-4 text-[#EDF4F0] flex-shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg transition ml-1 text-white/80 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        demoUsers={demoUsers}
        savedDogsCount={savedDogIds.length}
        onOpenSavedDogs={() => setIsSavedDrawerOpen(true)}
        onResetDemoData={handleResetDemoData}
        applicationsCount={userApplicationsCount}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSwitchDemoUser={handleSwitchDemoUser}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="animate-spin text-3xl">🐾</div>
            <p className="text-xs text-[#58625B] font-medium">Connecting to PawPair MongoDB Atlas...</p>
          </div>
        ) : (
          <>
            {currentTab === 'discover' && (
              <DogDiscoveryView
                dogs={dogs}
                adopterPreferences={adopterPreferences}
                savedDogIds={savedDogIds}
                onToggleSaveDog={handleToggleSaveDog}
                onOpenDogModal={(dog) => {
                  setSelectedDogForModal(dog);
                  navigate(`/dogs/${dog.id}`);
                }}
                onNavigateToMatching={() => setCurrentTab('matching')}
              />
            )}

            {currentTab === 'matching' && (
              <LifestyleMatcher
                preferences={adopterPreferences}
                onSavePreferences={handleSavePreferences}
                dogs={dogs}
                onOpenDogModal={(dog) => {
                  setSelectedDogForModal(dog);
                  navigate(`/dogs/${dog.id}`);
                }}
              />
            )}

            {currentTab === 'applications' && currentUser && (
              <MyApplicationsView
                applications={applications}
                currentUser={currentUser}
                onRefreshApplications={refreshAllData}
                onNavigateToDiscover={() => setCurrentTab('discover')}
              />
            )}

            {currentTab === 'applications' && !currentUser && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
                <div className="text-5xl">📋</div>
                <h2 className="text-2xl font-bold font-serif-heading text-[#181F1A]">Sign In to View Applications</h2>
                <p className="text-sm text-[#58625B] max-w-sm">Create a profile or sign in to track your adoption applications.</p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {currentTab === 'visits' && currentUser && (
              <GroupVisitsView
                visits={visits}
                currentUser={currentUser}
                onRefreshVisits={refreshAllData}
              />
            )}

            {currentTab === 'visits' && !currentUser && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
                <div className="text-5xl">📅</div>
                <h2 className="text-2xl font-bold font-serif-heading text-[#181F1A]">Sign In to Book Shelter Visits</h2>
                <p className="text-sm text-[#58625B] max-w-sm">Register a free profile to book group shelter visits and meet dogs in person.</p>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Create Free Profile
                </button>
              </div>
            )}

            {currentTab === 'shelter' && currentUser && (
              <ShelterManagementDashboard
                currentUser={currentUser}
                dogs={dogs}
                shelters={shelters}
                applications={applications}
                visits={visits}
                onRefreshData={refreshAllData}
                onSwitchUser={(user) => refreshUserData(user)}
                availableUsers={demoUsers}
              />
            )}

            {currentTab === 'shelter' && !currentUser && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
                <div className="text-5xl">🏠</div>
                <h2 className="text-2xl font-bold font-serif-heading text-[#181F1A]">Shelter Portal — Sign In Required</h2>
                <p className="text-sm text-[#58625B] max-w-sm">Sign in with a shelter staff account to access the management dashboard.</p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Dog Detail Modal */}
      {selectedDogForModal && (
        <DogDetailModal
          dog={selectedDogForModal}
          shelter={shelters.find((s) => s.id === selectedDogForModal.shelterId)}
          isOpen={Boolean(selectedDogForModal)}
          onClose={() => {
            setSelectedDogForModal(null);
            if (location.pathname.startsWith('/dogs/')) {
              navigate('/discover');
            }
          }}
          adopterPreferences={adopterPreferences}
          isSaved={savedDogIds.includes(selectedDogForModal.id)}
          onToggleSave={handleToggleSaveDog}
          onApply={(dog) => {
            if (!currentUser) {
              handleOpenAuth('login');
              return;
            }
            setSelectedDogForApplication(dog);
          }}
          onNavigateToMatching={() => setCurrentTab('matching')}
          onNavigateToVisits={() => setCurrentTab('visits')}
        />
      )}

      {/* Adoption Application Submission Modal */}
      {selectedDogForApplication && currentUser && (
        <AdoptionApplicationModal
          dog={selectedDogForApplication}
          isOpen={Boolean(selectedDogForApplication)}
          onClose={() => setSelectedDogForApplication(null)}
          currentUser={currentUser}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}

      {/* Saved Dogs Drawer */}
      <SavedDogsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedDogs={savedDogsList}
        onSelectDog={(dog) => {
          setSelectedDogForModal(dog);
          navigate(`/dogs/${dog.id}`);
        }}
        onRemoveSavedDog={handleToggleSaveDog}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        availableUsers={demoUsers}
        shelters={shelters}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Editorial Footer */}
      <footer className="bg-white border-t border-[#EAE4DC] py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#58625B]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🐾</span>
              <span className="font-bold font-serif-heading text-base text-[#183B2B]">PawPair</span>
              <span className="text-[11px] text-[#8B958E]">• Ethical Dog Adoption & Shelter Discovery</span>
            </div>
            <p className="text-xs text-[#58625B] max-w-lg leading-relaxed">
              Transparent, personality-first companion discovery connecting prospective adopters with shelter rescues through explainable lifestyle compatibility and verified group visits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#183B2B]">
            <button onClick={() => setCurrentTab('discover')} className="hover:underline cursor-pointer">
              Discover
            </button>
            <button onClick={() => setCurrentTab('matching')} className="hover:underline cursor-pointer">
              Lifestyle Match
            </button>
            <button onClick={() => setCurrentTab('applications')} className="hover:underline cursor-pointer">
              Applications
            </button>
            <button onClick={() => setCurrentTab('visits')} className="hover:underline cursor-pointer">
              Group Visits
            </button>
            <button onClick={() => setCurrentTab('shelter')} className="hover:underline cursor-pointer">
              Shelter Portal
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-[#F2ECE4] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8B958E]">
          <span>© 2026 PawPair Platform. All rights reserved.</span>
          <span>Compassionate companion adoption • Animal welfare priority</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
