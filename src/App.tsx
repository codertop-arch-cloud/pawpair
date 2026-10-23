import React, { useState } from 'react';
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
import { Sparkles, ShieldCheck, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAF7F2] text-[#181F1A] flex flex-col font-sans selection:bg-[#EDF4F0] selection:text-[#183B2B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#183B2B] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200 border border-[#24533E]">
          <Sparkles className="w-3.5 h-3.5 text-[#EDF4F0]" />
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
          <span>© 2026 PawPair Platform. Built for end-term software engineering evaluation.</span>
          <span>Warm editorial aesthetics • Animal welfare priority</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
