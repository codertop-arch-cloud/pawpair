import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Check,
  X,
  MapPin,
} from 'lucide-react';
import {
  Dog,
  Shelter,
  UserProfile,
  AdoptionApplication,
  ShelterVisit,
  ApplicationStatus,
  DogStatus,
} from '../../types';
import { dataStore } from '../../services/dataService';

interface ShelterManagementDashboardProps {
  currentUser: UserProfile;
  dogs: Dog[];
  shelters: Shelter[];
  applications: AdoptionApplication[];
  visits: ShelterVisit[];
  onRefreshData: () => void;
  onSwitchUser: (user: UserProfile) => void;
  availableUsers: UserProfile[];
}

export const ShelterManagementDashboard: React.FC<ShelterManagementDashboardProps> = ({
  currentUser,
  dogs,
  shelters,
  applications,
  visits,
  onRefreshData,
  onSwitchUser,
  availableUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'applications' | 'visits'>('listings');
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [statusUpdateAppId, setStatusUpdateAppId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('under_review');
  const [showCreateVisitModal, setShowCreateVisitModal] = useState(false);

  // New dog form state
  const [newDogName, setNewDogName] = useState('');
  const [newDogBreed, setNewDogBreed] = useState('');
  const [newDogAge, setNewDogAge] = useState(2.0);
  const [newDogSize, setNewDogSize] = useState<'small' | 'medium' | 'large' | 'giant'>('medium');
  const [newDogGender, setNewDogGender] = useState<'male' | 'female'>('male');
  const [newDogEnergy, setNewDogEnergy] = useState<'low' | 'moderate' | 'high' | 'very_high'>('moderate');
  const [newDogPhoto, setNewDogPhoto] = useState(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80'
  );
  const [newDogVideo, setNewDogVideo] = useState('');
  const [newDogBackstory, setNewDogBackstory] = useState('');
  const [newDogFee, setNewDogFee] = useState(150);
  const [newDogKids, setNewDogKids] = useState(true);
  const [newDogCats, setNewDogCats] = useState(true);
  const [newDogDogs, setNewDogDogs] = useState(true);
  const [newDogSpace, setNewDogSpace] = useState<'apartment_friendly' | 'needs_yard' | 'large_property'>('apartment_friendly');
  const [newDogExercise, setNewDogExercise] = useState(1.5);
  const [newDogExp, setNewDogExp] = useState<'first_time' | 'intermediate' | 'experienced'>('first_time');

  // New visit form state
  const [visitTitle, setVisitTitle] = useState('');
  const [visitDescription, setVisitDescription] = useState('');
  const [visitDate, setVisitDate] = useState('2026-11-20');
  const [visitStartTime, setVisitStartTime] = useState('11:00');
  const [visitEndTime, setVisitEndTime] = useState('12:30');
  const [visitCapacity, setVisitCapacity] = useState(8);
  const [visitError, setVisitError] = useState<string | null>(null);

  const currentShelterId = currentUser.shelterId || 'shelter-green-paws';
  const shelter = shelters.find((s) => s.id === currentShelterId) || shelters[0];

  const shelterDogs = dogs.filter((d) => d.shelterId === currentShelterId);
  const shelterApplications = applications.filter((a) => a.shelterId === currentShelterId);
  const shelterVisits = visits.filter((v) => v.shelterId === currentShelterId);

  // Metrics
  const activeListingsCount = shelterDogs.filter((d) => d.status === 'available').length;
  const pendingAppsCount = shelterApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const approvedAppsCount = shelterApplications.filter((a) => a.status === 'approved').length;

  const handleCreateDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDogName.trim() || !newDogBreed.trim() || !newDogBackstory.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    let ageGroup: 'puppy' | 'young' | 'adult' | 'senior' = 'adult';
    if (newDogAge < 1) ageGroup = 'puppy';
    else if (newDogAge < 3) ageGroup = 'young';
    else if (newDogAge < 8) ageGroup = 'adult';
    else ageGroup = 'senior';

    dataStore.createDog({
      name: newDogName,
      breed: newDogBreed,
      ageYears: newDogAge,
      ageGroup,
      size: newDogSize,
      gender: newDogGender,
      energyLevel: newDogEnergy,
      temperament: ['Gentle', 'Loyal', 'Friendly'],
      location: `${shelter.city}, ${shelter.state}`,
      shelterId: shelter.id,
      shelterName: shelter.name,
      photos: [newDogPhoto],
      videoUrl: newDogVideo || undefined,
      backstory: newDogBackstory,
      specialNeeds: [],
      medicalInfo: {
        vaccinated: true,
        neutered: true,
        microchipped: true,
      },
      goodWith: {
        children: newDogKids,
        cats: newDogCats,
        otherDogs: newDogDogs,
      },
      spaceRequired: newDogSpace,
      minDailyExerciseHours: newDogExercise,
      experienceLevelNeeded: newDogExp,
      adoptionFee: newDogFee,
      status: 'available',
    });

    setShowAddDogModal(false);
    onRefreshData();
    setNewDogName('');
    setNewDogBreed('');
    setNewDogBackstory('');
  };

  const handleUpdateDogStatus = (dogId: string, status: DogStatus) => {
    dataStore.updateDog(dogId, { status });
    onRefreshData();
  };

  const handleApplicationStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateAppId) return;

    dataStore.updateApplicationStatus(
      statusUpdateAppId,
      targetStatus,
      statusNote,
      currentUser.fullName
    );

    setStatusUpdateAppId(null);
    setStatusNote('');
    onRefreshData();
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitError(null);

    try {
      dataStore.createVisit({
        shelterId: shelter.id,
        title: visitTitle,
        description: visitDescription,
        date: visitDate,
        startTime: visitStartTime,
        endTime: visitEndTime,
        capacity: visitCapacity,
      });

      setShowCreateVisitModal(false);
      setVisitTitle('');
      setVisitDescription('');
      onRefreshData();
    } catch (err: any) {
      setVisitError(err.message || 'Failed to create visit.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE4DC] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF4F0] text-[#183B2B] flex items-center justify-center border border-[#D8F3DC] flex-shrink-0">
            <Building2 className="w-6 h-6 text-[#357457]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#181F1A]">
                {shelter.name}
              </h1>
              <span className="bg-[#EDF4F0] text-[#183B2B] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D8F3DC]">
                Portal
              </span>
            </div>
            <p className="text-xs text-[#58625B] mt-0.5">
              Director: <strong>{shelter.directorName}</strong> • {shelter.address}, {shelter.city}, {shelter.state}
            </p>
          </div>
        </div>

        {/* Demo Switcher Callout if viewing as adopter */}
        {currentUser.role !== 'shelter_staff' && (
          <div className="bg-[#FAF0EC] border border-[#FCE8E2] px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-3 w-full md:w-auto">
            <span className="text-[#963F28]">
              Logged in as Adopter ({currentUser.fullName}). Switch to Elena Vance to test staff workflows.
            </span>
            <button
              onClick={() => {
                const staffUser = availableUsers.find((u) => u.role === 'shelter_staff');
                if (staffUser) onSwitchUser(staffUser);
              }}
              className="px-3 py-1 bg-[#B85438] text-white rounded-lg font-bold text-xs hover:bg-[#963F28] transition flex-shrink-0"
            >
              Switch to Elena (Staff)
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] shadow-xs">
          <span className="text-[10px] text-[#8B958E] uppercase tracking-wider font-bold block mb-0.5">
            Available Dogs
          </span>
          <div className="text-2xl font-bold font-serif-heading text-[#183B2B]">
            {activeListingsCount}
          </div>
          <span className="text-[11px] text-[#58625B] mt-0.5 block">
            {shelterDogs.length} total profiles
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] shadow-xs">
          <span className="text-[10px] text-[#8B958E] uppercase tracking-wider font-bold block mb-0.5">
            Pending Applications
          </span>
          <div className="text-2xl font-bold font-serif-heading text-[#B85438]">
            {pendingAppsCount}
          </div>
          <span className="text-[11px] text-[#58625B] mt-0.5 block">In review queue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] shadow-xs">
          <span className="text-[10px] text-[#8B958E] uppercase tracking-wider font-bold block mb-0.5">
            Approved Meets
          </span>
          <div className="text-2xl font-bold font-serif-heading text-[#24533E]">
            {approvedAppsCount}
          </div>
          <span className="text-[11px] text-[#58625B] mt-0.5 block">Adoptions in progress</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] shadow-xs">
          <span className="text-[10px] text-[#8B958E] uppercase tracking-wider font-bold block mb-0.5">
            Group Visits
          </span>
          <div className="text-2xl font-bold font-serif-heading text-[#181F1A]">
            {shelterVisits.length}
          </div>
          <span className="text-[11px] text-[#58625B] mt-0.5 block">Scheduled sessions</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#EAE4DC] space-x-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-[#183B2B] text-[#183B2B]'
              : 'border-transparent text-[#58625B] hover:text-[#181F1A]'
          }`}
        >
          Dog Listings ({shelterDogs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'applications'
              ? 'border-[#183B2B] text-[#183B2B]'
              : 'border-transparent text-[#58625B] hover:text-[#181F1A]'
          }`}
        >
          <span>Applications ({shelterApplications.length})</span>
          {pendingAppsCount > 0 && (
            <span className="text-[10px] bg-[#B85438] text-white px-1.5 py-0.2 rounded-full font-bold">
              {pendingAppsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'visits'
              ? 'border-[#183B2B] text-[#183B2B]'
              : 'border-transparent text-[#58625B] hover:text-[#181F1A]'
          }`}
        >
          Group Visits ({shelterVisits.length})
        </button>
      </div>

      {/* TAB 1: DOG LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold font-serif-heading text-[#181F1A]">
              Managed Dog Profiles
            </h2>
            <button
              onClick={() => setShowAddDogModal(true)}
              className="px-3.5 py-1.5 bg-[#183B2B] hover:bg-[#24533E] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Dog Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelterDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-2xl border border-[#EAE4DC] p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex space-x-3">
                  <img
                    src={dog.photos[0]}
                    alt={dog.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-bold text-sm font-serif-heading text-[#181F1A] truncate">
                        {dog.name}
                      </h3>
                      <span className="text-xs font-semibold text-[#183B2B]">${dog.adoptionFee}</span>
                    </div>
                    <p className="text-xs text-[#58625B] truncate">{dog.breed}</p>
                    <p className="text-[11px] text-[#8B958E]">
                      {dog.ageYears} yrs • {dog.size} • {dog.energyLevel.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                  <span className="text-[#58625B] text-[11px]">Availability:</span>
                  <select
                    value={dog.status}
                    onChange={(e) => handleUpdateDogStatus(dog.id, e.target.value as DogStatus)}
                    className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-lg px-2 py-0.5 text-xs font-semibold text-[#183B2B] focus:outline-none focus:border-[#183B2B]"
                  >
                    <option value="available">Available</option>
                    <option value="pending_adoption">Pending Adoption</option>
                    <option value="adopted">Adopted</option>
                    <option value="foster_care">In Foster Care</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADOPTION APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif-heading text-[#181F1A]">
            Applications Queue
          </h2>

          {shelterApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE4DC]">
              <p className="text-xs text-[#58625B]">No applications currently in queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shelterApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#EAE4DC] p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#F2ECE4] gap-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={app.dogPhoto}
                        alt={app.dogName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-sm font-serif-heading text-[#181F1A]">
                          Application for {app.dogName}
                        </h3>
                        <p className="text-xs text-[#58625B]">
                          Applicant: <strong className="text-[#181F1A]">{app.applicantName}</strong> ({app.applicantPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A]">
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => {
                          setStatusUpdateAppId(app.id);
                          setTargetStatus(app.status);
                        }}
                        className="px-2.5 py-1 bg-[#183B2B] text-white rounded-lg text-xs font-bold hover:bg-[#24533E] transition"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F2ECE4]">
                    <div>
                      <span className="text-[#8B958E] text-[10px] block">Housing</span>
                      <span className="font-semibold text-[#181F1A]">
                        {app.housingType.replace('_', ' ')} • {app.hasYard ? 'Yard' : 'No Yard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8B958E] text-[10px] block">Hours Alone</span>
                      <span className="font-semibold text-[#181F1A]">
                        {app.hoursAlonePerDay} hours / day
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8B958E] text-[10px] block">Veterinary Reference</span>
                      <span className="font-semibold text-[#181F1A]">
                        {app.vetReference?.clinicName || 'None listed'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#58625B]">
                    <span className="font-semibold text-[#181F1A]">Motivation:</span>{' '}
                    <span className="italic">"{app.reasonForAdopting}"</span>
                  </div>

                  {app.shelterNotes && (
                    <div className="text-[11px] text-[#183B2B] bg-[#EDF4F0] p-2 rounded-lg border border-[#D8F3DC]">
                      <strong>Coordinator Log:</strong> {app.shelterNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold font-serif-heading text-[#181F1A]">
              Group Visit Schedule
            </h2>
            <button
              onClick={() => setShowCreateVisitModal(true)}
              className="px-3.5 py-1.5 bg-[#183B2B] hover:bg-[#24533E] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Schedule Visit Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelterVisits.map((visit) => {
              const participants = dataStore.getVisitParticipants(visit.id);

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl border border-[#EAE4DC] p-4 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm font-serif-heading text-[#181F1A]">
                        {visit.title}
                      </h3>
                      <p className="text-xs text-[#58625B] mt-0.5">{visit.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] capitalize">
                      {visit.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#357457] font-semibold flex flex-wrap gap-2 pt-1 border-t border-[#F2ECE4]">
                    <span>{visit.date}</span>
                    <span>•</span>
                    <span>{visit.startTime} - {visit.endTime}</span>
                    <span>•</span>
                    <span>
                      {visit.participantCount} / {visit.capacity} Attendees
                    </span>
                  </div>

                  {participants.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-[#8B958E] uppercase tracking-wider block mb-1">
                        Roster:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {participants.map((p) => (
                          <span
                            key={p.id}
                            className="text-[10px] bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] px-2 py-0.5 rounded"
                          >
                            {p.userName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD DOG */}
      {showAddDogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE4DC] overflow-hidden">
            <div className="bg-white border-b border-[#EAE4DC] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif-heading text-[#181F1A]">
                Add Dog Listing ({shelter.name})
              </h2>
              <button
                onClick={() => setShowAddDogModal(false)}
                className="p-1 rounded-lg text-[#58625B] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDog} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Dog Name *</label>
                  <input
                    type="text"
                    required
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    placeholder="e.g. Bella"
                    className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    value={newDogBreed}
                    onChange={(e) => setNewDogBreed(e.target.value)}
                    placeholder="e.g. Shepherd Mix"
                    className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.2"
                    value={newDogAge}
                    onChange={(e) => setNewDogAge(parseFloat(e.target.value) || 1)}
                    className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Size</label>
                  <select
                    value={newDogSize}
                    onChange={(e) => setNewDogSize(e.target.value as any)}
                    className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="giant">Giant</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDogFee}
                    onChange={(e) => setNewDogFee(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Photo URL *</label>
                <input
                  type="url"
                  required
                  value={newDogPhoto}
                  onChange={(e) => setNewDogPhoto(e.target.value)}
                  className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Backstory & Personality *</label>
                <textarea
                  rows={2}
                  required
                  value={newDogBackstory}
                  onChange={(e) => setNewDogBackstory(e.target.value)}
                  placeholder="Describe temperament, care notes, and ideal placement..."
                  className="w-full bg-white border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A]"
                />
              </div>

              {/* Welfare flags */}
              <div className="bg-white p-3 rounded-xl border border-[#EAE4DC] space-y-1.5">
                <span className="font-semibold text-[#181F1A] block">Social Welfare Checks:</span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogKids}
                      onChange={(e) => setNewDogKids(e.target.checked)}
                      className="rounded text-[#183B2B] accent-[#183B2B]"
                    />
                    <span>Kid-Safe</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogCats}
                      onChange={(e) => setNewDogCats(e.target.checked)}
                      className="rounded text-[#183B2B] accent-[#183B2B]"
                    />
                    <span>Cat-Safe (Low prey drive)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogDogs}
                      onChange={(e) => setNewDogDogs(e.target.checked)}
                      className="rounded text-[#183B2B] accent-[#183B2B]"
                    />
                    <span>Dog-Social</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddDogModal(false)}
                  className="px-4 py-2 border border-[#EAE4DC] rounded-xl text-[#58625B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#183B2B] text-white rounded-xl font-bold hover:bg-[#24533E]"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS */}
      {statusUpdateAppId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#EAE4DC] space-y-4">
            <h3 className="text-lg font-bold font-serif-heading text-[#181F1A]">
              Update Application Status
            </h3>

            <form onSubmit={handleApplicationStatusSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">New Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] font-semibold"
                >
                  <option value="under_review">Under Shelter Review</option>
                  <option value="more_info_requested">Request More Information</option>
                  <option value="approved">Approve for Meet-and-Greet</option>
                  <option value="rejected">Decline Application</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">
                  Coordinator Note (Visible to applicant)
                </label>
                <textarea
                  rows={2}
                  required
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Landlord verification received. Approved for Saturday 11am visit."
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusUpdateAppId(null)}
                  className="px-4 py-2 border border-[#EAE4DC] rounded-xl text-[#58625B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#183B2B] text-white rounded-xl font-bold hover:bg-[#24533E]"
                >
                  Confirm Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE VISIT */}
      {showCreateVisitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#EAE4DC] space-y-4">
            <h3 className="text-lg font-bold font-serif-heading text-[#181F1A]">
              Schedule Group Visit Slot
            </h3>

            {visitError && (
              <div className="bg-[#FAF0EC] text-[#B85438] p-3 rounded-xl text-xs">
                {visitError}
              </div>
            )}

            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Foster & Adopter Pack Walk"
                  value={visitTitle}
                  onChange={(e) => setVisitTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#181F1A] block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={visitDescription}
                  onChange={(e) => setVisitDescription(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={visitCapacity}
                    onChange={(e) => setVisitCapacity(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={visitStartTime}
                    onChange={(e) => setVisitStartTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#181F1A] block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={visitEndTime}
                    onChange={(e) => setVisitEndTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2 text-xs text-[#181F1A]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateVisitModal(false)}
                  className="px-4 py-2 border border-[#EAE4DC] rounded-xl text-[#58625B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#183B2B] text-white rounded-xl font-bold hover:bg-[#24533E]"
                >
                  Publish Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
