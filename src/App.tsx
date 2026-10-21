import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SavedDogsDrawer } from './components/SavedDogsDrawer';
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
import { Heart, ShieldCheck, Sparkles, Building2, ExternalLink } from 'lucide-react';

export function App() {
  // Navigation & current view
  const [currentTab, setCurrentTab] = useState<string>('discover');

  // Core entities state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => dataStore.getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() =>
    dataStore.getAllDemoUsers()
  );
  const [dogs, setDogs] = useState<Dog[]>(() => dataStore.getDogs());
  const [shelters, setShelters] = useState<Shelter[]>(() => dataStore.getShelters());
  const [applications, setApplications] = useState<AdoptionApplication[]>(() =>
    dataStore.getApplications()
  );
  const [visits, setVisits] = useState<ShelterVisit[]>(() => dataStore.getVisits());
  const [adopterPreferences, setAdopterPreferences] = useState<AdopterLifestylePreferences | null>(
    () => dataStore.getAdopterPreferences(currentUser.id)
  );
  const [savedDogIds, setSavedDogIds] = useState<string[]>(() =>
    dataStore.getSavedDogIds(currentUser.id)
  );

  // Modals state
  const [selectedDogForModal, setSelectedDogForModal] = useState<Dog | null>(null);
  const [selectedDogForApplication, setSelectedDogForApplication] = useState<Dog | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize state when currentUser changes
  const refreshUserData = (user: UserProfile) => {
    setCurrentUser(user);
    dataStore.setCurrentUser(user);
    setAdopterPreferences(dataStore.getAdopterPreferences(user.id));
    setSavedDogIds(dataStore.getSavedDogIds(user.id));
  };

  const handleSwitchUser = (user: UserProfile) => {
    refreshUserData(user);
    showToast(`Switched active persona to ${user.fullName} (${user.role.replace('_', ' ')})`);
  };

  const refreshAllData = () => {
    setDogs(dataStore.getDogs());
    setShelters(dataStore.getShelters());
    setApplications(dataStore.getApplications());
    setVisits(dataStore.getVisits());
    setSavedDogIds(dataStore.getSavedDogIds(currentUser.id));
    setAdopterPreferences(dataStore.getAdopterPreferences(currentUser.id));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Save / Like Dog
  const handleToggleSaveDog = (dogId: string) => {
    const isNowSaved = dataStore.toggleSaveDog(currentUser.id, dogId);
    setSavedDogIds(dataStore.getSavedDogIds(currentUser.id));
    const target = dataStore.getDogById(dogId);
    const dogName = target ? target.name : 'Dog';
    showToast(isNowSaved ? `Saved ${dogName} to favorites!` : `Removed ${dogName} from favorites`);
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Reset local demo store? This will restore original seeded dogs, applications, and sample profiles.'
      )
    ) {
      dataStore.resetAllToSeed();
      refreshUserData(dataStore.getCurrentUser());
      refreshAllData();
      showToast('Demo data restored to initial state.');
    }
  };

  // Save Preferences
  const handleSavePreferences = (prefs: AdopterLifestylePreferences) => {
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
  const userApplicationsCount = applications.filter(
    (a) => a.adopterId === currentUser.id || currentUser.role === 'shelter_staff'
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C241E] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200 border border-[#2D6A4F]">
          <Sparkles className="w-4 h-4 text-[#52B788]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSwitchUser={handleSwitchUser}
        savedDogsCount={savedDogIds.length}
        onOpenSavedDogs={() => setIsSavedDrawerOpen(true)}
        onResetDemoData={handleResetDemoData}
        applicationsCount={userApplicationsCount}
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

        {currentTab === 'applications' && (
          <MyApplicationsView
            applications={applications}
            currentUser={currentUser}
            onRefreshApplications={refreshAllData}
            onNavigateToDiscover={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'visits' && (
          <GroupVisitsView
            visits={visits}
            currentUser={currentUser}
            onRefreshVisits={refreshAllData}
          />
        )}

        {currentTab === 'shelter' && (
          <ShelterManagementDashboard
            currentUser={currentUser}
            dogs={dogs}
            shelters={shelters}
            applications={applications}
            visits={visits}
            onRefreshData={refreshAllData}
            onSwitchUser={handleSwitchUser}
            availableUsers={availableUsers}
          />
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
            setSelectedDogForApplication(dog);
          }}
          onNavigateToMatching={() => setCurrentTab('matching')}
          onNavigateToVisits={() => setCurrentTab('visits')}
        />
      )}

      {/* Adoption Application Submission Modal */}
      {selectedDogForApplication && (
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

      {/* Footer */}
      <footer className="bg-white border-t border-[#E6DFD5] py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#5C675F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🐾</span>
              <span className="font-bold font-serif-heading text-lg text-[#1B4332]">PawPair</span>
            </div>
            <p className="max-w-md leading-relaxed text-[#2D372E]">
              PawPair is an ethical, welfare-first discovery platform connecting prospective adopters with shelter dogs through explainable lifestyle compatibility and coordinated shelter visits.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-[#2D6A4F] font-semibold">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-[#52B788]" />
                <span>Deterministic Scoring</span>
              </span>
              <span className="flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-[#52B788]" />
                <span>Shelter-Verified Placement</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#1C241E] uppercase tracking-wider mb-2 font-serif-heading">
              Platform Workflows
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setCurrentTab('discover')} className="hover:text-[#1B4332]">
                  Dog Discovery & Swiping
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('matching')} className="hover:text-[#1B4332]">
                  Lifestyle Compatibility Engine
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('applications')} className="hover:text-[#1B4332]">
                  Adoption Application Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('visits')} className="hover:text-[#1B4332]">
                  Group Shelter Visits
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('shelter')} className="hover:text-[#1B4332]">
                  Shelter Staff Portal
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C241E] uppercase tracking-wider mb-2 font-serif-heading">
              Demonstration & Ethics
            </h4>
            <p className="text-[11px] leading-relaxed text-[#8E9991]">
              Demonstration prototype with browser persistence. Profiles represent rescue scenarios with real Unsplash dog photography. No real shelter affiliations or live multi-user authentication are fabricated.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#F4EFEA] flex flex-col sm:flex-row items-center justify-between gap-2 text-[#8E9991]">
          <span>© 2026 PawPair Platform. Built for end-term software engineering submission.</span>
          <span>Designed with warm editorial aesthetics & animal welfare priority.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
