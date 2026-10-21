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
  Edit3,
  Trash2,
  Eye,
  ShieldCheck,
  Check,
  X,
  Search,
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
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
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

  // Filter applications by shelter
  const currentShelterId = currentUser.shelterId || 'shelter-green-paws';
  const shelter = shelters.find((s) => s.id === currentShelterId) || shelters[0];

  const shelterDogs = dogs.filter((d) => d.shelterId === currentShelterId);
  const shelterApplications = applications.filter((a) => a.shelterId === currentShelterId);
  const shelterVisits = visits.filter((v) => v.shelterId === currentShelterId);

  // Stats
  const activeListingsCount = shelterDogs.filter((d) => d.status === 'available').length;
  const pendingAppsCount = shelterApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const approvedAppsCount = shelterApplications.filter((a) => a.status === 'approved').length;

  // Handle Dog Creation
  const handleCreateDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDogName.trim() || !newDogBreed.trim() || !newDogBackstory.trim()) {
      alert('Please fill out all required dog profile fields.');
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
      temperament: ['Friendly', 'Gentle', 'Loyal'],
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
    // Reset form
    setNewDogName('');
    setNewDogBreed('');
    setNewDogBackstory('');
  };

  // Handle Dog Status Change
  const handleUpdateDogStatus = (dogId: string, status: DogStatus) => {
    dataStore.updateDog(dogId, { status });
    onRefreshData();
  };

  // Handle Application Status Update
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

  // Handle Visit Creation
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Shelter Header & Role Indicator */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DFD5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF7EE] text-[#1B4332] flex items-center justify-center border border-[#D8F3DC] flex-shrink-0">
            <Building2 className="w-7 h-7 text-[#2D6A4F]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#1B4332]">
                {shelter.name}
              </h1>
              <span className="bg-[#EBF7EE] text-[#1B4332] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#D8F3DC]">
                Staff Portal
              </span>
            </div>
            <p className="text-xs text-[#5C675F] mt-0.5">
              Logged in as <strong>{currentUser.fullName}</strong> • {shelter.address}, {shelter.city}, {shelter.state}
            </p>
          </div>
        </div>

        {/* Demo Role Switcher Reminder if current user is an adopter */}
        {currentUser.role !== 'shelter_staff' && (
          <div className="bg-[#FFF3F0] border border-[#FCE8E2] p-3 rounded-xl text-xs flex items-center justify-between gap-3 w-full md:w-auto">
            <span className="text-[#9E4732]">
              You are currently viewing as Adopter ({currentUser.fullName}). Switch to Elena Vance to test staff permissions.
            </span>
            <button
              onClick={() => {
                const staffUser = availableUsers.find((u) => u.role === 'shelter_staff');
                if (staffUser) onSwitchUser(staffUser);
              }}
              className="px-3 py-1 bg-[#BA5536] text-white rounded-lg font-bold text-xs hover:bg-[#9E4732] transition flex-shrink-0"
            >
              Switch to Elena (Staff)
            </button>
          </div>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <span className="text-xs text-[#8E9991] uppercase tracking-wider font-semibold block mb-1">
            Active Available Dogs
          </span>
          <div className="text-3xl font-bold font-serif-heading text-[#1B4332]">
            {activeListingsCount}
          </div>
          <span className="text-xs text-[#5C675F] mt-1 block">
            {shelterDogs.length} total profiles managed
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <span className="text-xs text-[#8E9991] uppercase tracking-wider font-semibold block mb-1">
            Applications in Queue
          </span>
          <div className="text-3xl font-bold font-serif-heading text-[#BA5536]">
            {pendingAppsCount}
          </div>
          <span className="text-xs text-[#5C675F] mt-1 block">Awaiting review or references</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <span className="text-xs text-[#8E9991] uppercase tracking-wider font-semibold block mb-1">
            Approved Placements
          </span>
          <div className="text-3xl font-bold font-serif-heading text-[#2D6A4F]">
            {approvedAppsCount}
          </div>
          <span className="text-xs text-[#5C675F] mt-1 block">Meet-and-greets scheduled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <span className="text-xs text-[#8E9991] uppercase tracking-wider font-semibold block mb-1">
            Upcoming Group Visits
          </span>
          <div className="text-3xl font-bold font-serif-heading text-[#1C241E]">
            {shelterVisits.length}
          </div>
          <span className="text-xs text-[#5C675F] mt-1 block">Community walk & foster days</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E6DFD5] space-x-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#5C675F] hover:text-[#1B4332]'
          }`}
        >
          <span>Dog Listings ({shelterDogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'applications'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#5C675F] hover:text-[#1B4332]'
          }`}
        >
          <span>Adoption Applications ({shelterApplications.length})</span>
          {pendingAppsCount > 0 && (
            <span className="text-[10px] bg-[#BA5536] text-white px-2 py-0.5 rounded-full">
              {pendingAppsCount} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'visits'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#5C675F] hover:text-[#1B4332]'
          }`}
        >
          <span>Shelter Group Visits ({shelterVisits.length})</span>
        </button>
      </div>

      {/* TAB 1: DOG LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-serif-heading text-[#1B4332]">
              Rescue Dog Profiles Managed by {shelter.name}
            </h2>
            <button
              onClick={() => setShowAddDogModal(true)}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Dog Listing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelterDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs p-4 flex flex-col justify-between space-y-4"
              >
                <div className="flex space-x-3">
                  <img
                    src={dog.photos[0]}
                    alt={dog.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base font-serif-heading text-[#1C241E]">
                        {dog.name}
                      </h3>
                      <span className="text-xs text-[#8E9991] font-semibold">${dog.adoptionFee}</span>
                    </div>
                    <p className="text-xs text-[#5C675F] truncate">{dog.breed}</p>
                    <p className="text-xs text-[#8E9991]">
                      {dog.ageYears} yrs • {dog.size} • {dog.energyLevel.replace('_', ' ')}
                    </p>
                    <div className="flex gap-1 mt-1 text-[10px]">
                      {dog.goodWith.cats && (
                        <span className="bg-[#EBF7EE] text-[#1B4332] px-1.5 py-0.5 rounded">
                          Cat-safe
                        </span>
                      )}
                      {dog.goodWith.children && (
                        <span className="bg-[#EBF7EE] text-[#1B4332] px-1.5 py-0.5 rounded">
                          Kid-safe
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between text-xs">
                  <span className="text-[#5C675F] font-medium">Status:</span>
                  <select
                    value={dog.status}
                    onChange={(e) => handleUpdateDogStatus(dog.id, e.target.value as DogStatus)}
                    className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#1B4332] focus:outline-none focus:border-[#1B4332]"
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
          <h2 className="text-lg font-bold font-serif-heading text-[#1B4332]">
            Adoption Applications Queue
          </h2>

          {shelterApplications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E6DFD5]">
              <p className="text-sm font-semibold text-[#1C241E]">No applications submitted yet</p>
              <p className="text-xs text-[#5C675F]">
                New adoption requests for {shelter.name}'s dogs will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shelterApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFEA] gap-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={app.dogPhoto}
                        alt={app.dogName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-base font-serif-heading text-[#1C241E]">
                          Application for {app.dogName}
                        </h3>
                        <p className="text-xs text-[#5C675F]">
                          Applicant: <strong>{app.applicantName}</strong> ({app.applicantEmail} •{' '}
                          {app.applicantPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] text-[#1B4332]">
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => {
                          setStatusUpdateAppId(app.id);
                          setTargetStatus(app.status);
                        }}
                        className="px-3 py-1 bg-[#1B4332] text-white rounded-lg text-xs font-bold hover:bg-[#2D6A4F] transition"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                    <div>
                      <span className="text-[#8E9991] block">Housing & Yard</span>
                      <span className="font-semibold text-[#1C241E]">
                        {app.housingType.replace('_', ' ')} •{' '}
                        {app.hasYard ? 'Fenced Yard' : 'No Yard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8E9991] block">Hours Alone / Day</span>
                      <span className="font-semibold text-[#1C241E]">
                        {app.hoursAlonePerDay} hours / day
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8E9991] block">Veterinary Reference</span>
                      <span className="font-semibold text-[#1C241E]">
                        {app.vetReference?.clinicName || 'None listed'} (
                        {app.vetReference?.phone || 'N/A'})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#2D372E] space-y-1">
                    <span className="font-semibold text-[#1C241E]">Applicant Motivation:</span>
                    <p className="italic bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E6DFD5]">
                      "{app.reasonForAdopting}"
                    </p>
                  </div>

                  {app.shelterNotes && (
                    <div className="text-xs text-[#1B4332] bg-[#EBF7EE] p-2.5 rounded-lg border border-[#D8F3DC]">
                      <strong>Staff Note:</strong> {app.shelterNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHELTER GROUP VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-serif-heading text-[#1B4332]">
              Group Shelter Visits & Orientations
            </h2>
            <button
              onClick={() => setShowCreateVisitModal(true)}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule New Visit Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelterVisits.map((visit) => {
              const participants = dataStore.getVisitParticipants(visit.id);

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base font-serif-heading text-[#1C241E]">
                        {visit.title}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1B4332] capitalize">
                        {visit.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C675F]">{visit.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-[#2D6A4F] font-semibold pt-1">
                      <span>Date: {visit.date}</span>
                      <span>Time: {visit.startTime} - {visit.endTime}</span>
                      <span>
                        Capacity: {visit.participantCount} / {visit.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Registered Participants Roster */}
                  <div className="pt-3 border-t border-[#F4EFEA] space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8E9991] block">
                      Registered Prospective Adopters ({participants.length})
                    </span>
                    {participants.length === 0 ? (
                      <p className="text-xs text-[#8E9991] italic">No signups yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {participants.map((p) => (
                          <div
                            key={p.id}
                            className="text-xs bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#F4EFEA] flex justify-between"
                          >
                            <span className="font-semibold text-[#1C241E]">{p.userName}</span>
                            <span className="text-[#5C675F]">{p.userEmail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW DOG */}
      {showAddDogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E6DFD5] overflow-hidden">
            <div className="bg-white border-b border-[#E6DFD5] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
                Create Dog Listing ({shelter.name})
              </h2>
              <button
                onClick={() => setShowAddDogModal(false)}
                className="p-1.5 rounded-lg text-[#5C675F] hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDog} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Dog Name *</label>
                  <input
                    type="text"
                    required
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    placeholder="e.g. Bella"
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Breed / Mix *</label>
                  <input
                    type="text"
                    required
                    value={newDogBreed}
                    onChange={(e) => setNewDogBreed(e.target.value)}
                    placeholder="e.g. Shepherd & Husky Mix"
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Age in Years</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.2"
                    max="20"
                    value={newDogAge}
                    onChange={(e) => setNewDogAge(parseFloat(e.target.value) || 1)}
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Adoption Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDogFee}
                    onChange={(e) => setNewDogFee(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Size</label>
                  <select
                    value={newDogSize}
                    onChange={(e) => setNewDogSize(e.target.value as any)}
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                  >
                    <option value="small">Small (&lt; 25 lbs)</option>
                    <option value="medium">Medium (25-55 lbs)</option>
                    <option value="large">Large (55-85 lbs)</option>
                    <option value="giant">Giant (85+ lbs)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Gender</label>
                  <select
                    value={newDogGender}
                    onChange={(e) => setNewDogGender(e.target.value as any)}
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Energy Level</label>
                  <select
                    value={newDogEnergy}
                    onChange={(e) => setNewDogEnergy(e.target.value as any)}
                    className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                  >
                    <option value="low">Low Energy</option>
                    <option value="moderate">Moderate Energy</option>
                    <option value="high">High Energy</option>
                    <option value="very_high">Very High Energy</option>
                  </select>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <label className="font-semibold text-[#1C241E] block">Photo URL *</label>
                <input
                  type="url"
                  required
                  value={newDogPhoto}
                  onChange={(e) => setNewDogPhoto(e.target.value)}
                  className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              <div className="text-xs space-y-2">
                <label className="font-semibold text-[#1C241E] block">Video URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={newDogVideo}
                  onChange={(e) => setNewDogVideo(e.target.value)}
                  className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              <div className="text-xs space-y-2">
                <label className="font-semibold text-[#1C241E] block">
                  Backstory & Temperament Details *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDogBackstory}
                  onChange={(e) => setNewDogBackstory(e.target.value)}
                  placeholder="Describe rescue history, personality, quirks, and ideal home environment..."
                  className="w-full bg-white border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              {/* Welfare flags */}
              <div className="bg-white p-3 rounded-xl border border-[#E6DFD5] space-y-2 text-xs">
                <span className="font-semibold text-[#1C241E] block">Welfare & Social Flags:</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogKids}
                      onChange={(e) => setNewDogKids(e.target.checked)}
                      className="rounded text-[#1B4332]"
                    />
                    <span>Good with kids</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogCats}
                      onChange={(e) => setNewDogCats(e.target.checked)}
                      className="rounded text-[#1B4332]"
                    />
                    <span>Good with cats (low prey drive)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDogDogs}
                      onChange={(e) => setNewDogDogs(e.target.checked)}
                      className="rounded text-[#1B4332]"
                    />
                    <span>Good with other dogs</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDogModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-[#5C675F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F]"
                >
                  Publish Dog Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE APPLICATION STATUS */}
      {statusUpdateAppId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-lg font-bold font-serif-heading text-[#1B4332]">
              Update Application Status
            </h3>

            <form onSubmit={handleApplicationStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">New Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E] font-semibold"
                >
                  <option value="under_review">Under Shelter Review</option>
                  <option value="more_info_requested">Request More Information</option>
                  <option value="approved">Approve for Meet-and-Greet</option>
                  <option value="rejected">Decline Application</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">
                  Coordinator Note for Adopter & Audit Trail
                </label>
                <textarea
                  rows={3}
                  required
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Landlord verification received. Approved for Saturday 11am visit."
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusUpdateAppId(null)}
                  className="px-4 py-2 border rounded-xl text-[#5C675F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B4332] text-white rounded-xl font-bold hover:bg-[#2D6A4F]"
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE VISIT */}
      {showCreateVisitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-lg font-bold font-serif-heading text-[#1B4332]">
              Schedule Group Shelter Visit
            </h3>

            {visitError && (
              <div className="bg-[#FFF3F0] text-[#BA5536] p-3 rounded-xl text-xs">
                {visitError}
              </div>
            )}

            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Visit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Foster & Adopter Pack Walk"
                  value={visitTitle}
                  onChange={(e) => setVisitTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1C241E] block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail activities, safety guidelines, and what prospective adopters will experience..."
                  value={visitDescription}
                  onChange={(e) => setVisitDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2 text-xs text-[#1C241E]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={visitCapacity}
                    onChange={(e) => setVisitCapacity(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2 text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={visitStartTime}
                    onChange={(e) => setVisitStartTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2 text-xs text-[#1C241E]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1C241E] block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={visitEndTime}
                    onChange={(e) => setVisitEndTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2 text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateVisitModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#5C675F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B4332] text-white rounded-xl font-bold hover:bg-[#2D6A4F]"
                >
                  Publish Visit Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
