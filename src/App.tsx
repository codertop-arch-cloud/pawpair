import React, { useState } from 'react';
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
import { dataStore } from './services/dataService';
import {
  Dog,
  Shelter,
  UserProfile,
  AdoptionApplication,
  ShelterVisit,
  AdopterLifestylePreferences,
} from './types';
import { Sparkles, X } from 'lucide-react';

export function App() {
  // Navigation & current view
  const [currentTab, setCurrentTab] = useState<string>('discover');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Core entities state — currentUser may be null (logged out)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    dataStore.getCurrentUser()
  );
  const [dogs, setDogs] = useState<Dog[]>(() => dataStore.getDogs());
  const [shelters, setShelters] = useState<Shelter[]>(() => dataStore.getShelters());
  const [applications, setApplications] = useState<AdoptionApplication[]>(() =>
    dataStore.getApplications()
  );
  const [visits, setVisits] = useState<ShelterVisit[]>(() => dataStore.getVisits());
  const [adopterPreferences, setAdopterPreferences] = useState<AdopterLifestylePreferences | null>(
    () => (currentUser ? dataStore.getAdopterPreferences(currentUser.id) : null)
  );
  const [savedDogIds, setSavedDogIds] = useState<string[]>(() =>
    currentUser ? dataStore.getSavedDogIds(currentUser.id) : []
  );

  // Modals state
  const [selectedDogForModal, setSelectedDogForModal] = useState<Dog | null>(null);
  const [selectedDogForApplication, setSelectedDogForApplication] = useState<Dog | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize state when currentUser changes
  const refreshUserData = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      dataStore.setCurrentUser(user);
      setAdopterPreferences(dataStore.getAdopterPreferences(user.id));
      setSavedDogIds(dataStore.getSavedDogIds(user.id));
    } else {
      dataStore.setCurrentUser(null);
      setAdopterPreferences(null);
      setSavedDogIds([]);
    }
  };

  const refreshAllData = () => {
    setDogs(dataStore.getDogs());
    setShelters(dataStore.getShelters());
    setApplications(dataStore.getApplications());
    setVisits(dataStore.getVisits());
    if (currentUser) {
      setSavedDogIds(dataStore.getSavedDogIds(currentUser.id));
      setAdopterPreferences(dataStore.getAdopterPreferences(currentUser.id));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ---- Auth handlers ----
  const handleLogin = (
    email: string,
    password?: string
  ): { success: boolean; error?: string } => {
    const result = dataStore.loginUser(email, password);
    if (result.success && result.user) {
      refreshUserData(result.user);
      showToast(`Welcome back, ${result.user.fullName.split(' ')[0]}! 👋`);
    }
    return { success: result.success, error: result.error };
  };

  const handleRegister = (params: {
    fullName: string;
    email: string;
    password?: string;
    role: 'adopter' | 'shelter_staff';
    city?: string;
    phone?: string;
    shelterId?: string;
  }): { success: boolean; error?: string } => {
    const result = dataStore.registerUser(params);
    if (result.success && result.user) {
      refreshUserData(result.user);
      showToast(`Welcome to PawPair, ${result.user.fullName.split(' ')[0]}! 🐾`);
    }
    return { success: result.success, error: result.error };
  };

  const handleLogout = () => {
    dataStore.logoutUser();
    refreshUserData(null);
    setCurrentTab('discover');
    showToast('You have been signed out.');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Toggle Save / Like Dog — require login
  const handleToggleSaveDog = (dogId: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const isNowSaved = dataStore.toggleSaveDog(currentUser.id, dogId);
    setSavedDogIds(dataStore.getSavedDogIds(currentUser.id));
    const target = dataStore.getDogById(dogId);
    const dogName = target ? target.name : 'Dog';
    showToast(isNowSaved ? `Saved ${dogName} to favorites` : `Removed ${dogName} from favorites`);
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Reset local demo store? This will restore original seeded dogs, applications, and sample profiles.'
      )
    ) {
      dataStore.resetAllToSeed();
      const restoredUser = dataStore.getCurrentUser();
      refreshUserData(restoredUser);
      refreshAllData();
      showToast('Demo data restored to initial state.');
    }
  };

  // Save Preferences
  const handleSavePreferences = (prefs: AdopterLifestylePreferences) => {
    if (!currentUser) return;
    dataStore.saveAdopterPreferences(currentUser.id, prefs);
    setAdopterPreferences(prefs);
    showToast('Adopter lifestyle profile saved successfully!');
  };

  // Application Success Callback
  const handleApplicationSuccess = (app: AdoptionApplication) => {
    refreshAllData();
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
        demoUsers={dataStore.getAllDemoUsers()}
        savedDogsCount={savedDogIds.length}
        onOpenSavedDogs={() => setIsSavedDrawerOpen(true)}
        onResetDemoData={handleResetDemoData}
        applicationsCount={userApplicationsCount}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSwitchDemoUser={(user) => {
          refreshUserData(user);
          showToast(`Switched to ${user.fullName} (${user.role === 'shelter_staff' ? 'Staff' : 'Adopter'})`);
        }}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1">
        {currentTab === 'discover' && (
          <DogDiscoveryView
            dogs={dogs}
            adopterPreferences={adopterPreferences}
            savedDogIds={savedDogIds}
            onToggleSaveDog={handleToggleSaveDog}
            onOpenDogModal={(dog) => setSelectedDogForModal(dog)}
            onNavigateToMatching={() => setCurrentTab('matching')}
          />
        )}

        {currentTab === 'matching' && (
          <LifestyleMatcher
            preferences={adopterPreferences}
            onSavePreferences={handleSavePreferences}
            dogs={dogs}
            onOpenDogModal={(dog) => setSelectedDogForModal(dog)}
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
              className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs"
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
              className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs"
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
            availableUsers={dataStore.getAllDemoUsers()}
          />
        )}

        {currentTab === 'shelter' && !currentUser && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
            <div className="text-5xl">🏠</div>
            <h2 className="text-2xl font-bold font-serif-heading text-[#181F1A]">Shelter Portal — Sign In Required</h2>
            <p className="text-sm text-[#58625B] max-w-sm">Sign in with a shelter staff account to access the management dashboard.</p>
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-sm font-semibold rounded-xl transition shadow-xs"
            >
              Sign In
            </button>
          </div>
        )}
      </main>

      {/* Dog Detail Modal */}
      {selectedDogForModal && (
        <DogDetailModal
          dog={selectedDogForModal}
          shelter={shelters.find((s) => s.id === selectedDogForModal.shelterId)}
          isOpen={Boolean(selectedDogForModal)}
          onClose={() => setSelectedDogForModal(null)}
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
        onSelectDog={(dog) => setSelectedDogForModal(dog)}
        onRemoveSavedDog={handleToggleSaveDog}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        availableUsers={dataStore.getAllDemoUsers()}
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
            <button onClick={() => setCurrentTab('discover')} className="hover:underline">
              Discover
            </button>
            <button onClick={() => setCurrentTab('matching')} className="hover:underline">
              Lifestyle Match
            </button>
            <button onClick={() => setCurrentTab('applications')} className="hover:underline">
              Applications
            </button>
            <button onClick={() => setCurrentTab('visits')} className="hover:underline">
              Group Visits
            </button>
            <button onClick={() => setCurrentTab('shelter')} className="hover:underline">
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
