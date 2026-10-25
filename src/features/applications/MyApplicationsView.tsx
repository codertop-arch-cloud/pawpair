import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Building2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  User,
  Home,
} from 'lucide-react';
import { AdoptionApplication, UserProfile, ApplicationStatus } from '../../types';
import { dataStore } from '../../services/dataService';

interface MyApplicationsViewProps {
  applications: AdoptionApplication[];
  currentUser: UserProfile;
  onRefreshApplications: () => void;
  onNavigateToDiscover: () => void;
}

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({
  applications,
  currentUser,
  onRefreshApplications,
  onNavigateToDiscover,
}) => {
  const userApplications = applications.filter(
    (app) => app.adopterId === currentUser.id || currentUser.role === 'shelter_staff'
  );

  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    userApplications[0]?.id || null
  );

  const selectedApp =
    userApplications.find((a) => a.id === selectedAppId) || userApplications[0];

  const handleWithdraw = (appId: string) => {
    if (window.confirm('Are you sure you wish to withdraw this adoption application?')) {
      dataStore.updateApplicationStatus(
        appId,
        'withdrawn',
        'Application voluntarily withdrawn by adopter.',
        currentUser.fullName
      );
      onRefreshApplications();
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Submitted — In Queue',
          icon: Clock,
        };
      case 'under_review':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Under Review',
          icon: Clock,
        };
      case 'more_info_requested':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          label: 'More Info Requested',
          icon: AlertCircle,
        };
      case 'approved':
        return {
          bg: 'bg-[#EDF4F0] text-[#183B2B] border-[#D8F3DC]',
          label: 'Approved for Meet & Greet',
          icon: CheckCircle2,
        };
      case 'rejected':
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'Not Selected',
          icon: XCircle,
        };
      case 'withdrawn':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          label: 'Withdrawn',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-600 border-gray-200',
          label: status,
          icon: Clock,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#EAE4DC]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] text-[11px] font-semibold mb-1.5">
            <ShieldCheck className="w-3 h-3 text-[#357457]" />
            <span>Adoption Pipeline Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#181F1A] tracking-tight">
            Adoption Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#58625B] max-w-xl mt-0.5">
            Review status updates, shelter coordinator messages, and chronological milestone logs.
          </p>
        </div>

        <button
          onClick={onNavigateToDiscover}
          className="text-xs font-semibold text-[#183B2B] hover:underline self-start sm:self-auto"
        >
          + Apply for Another Dog
        </button>
      </div>

      {userApplications.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#EAE4DC] max-w-sm mx-auto space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#58625B] flex items-center justify-center mx-auto border border-[#EAE4DC]">
            <FileText className="w-7 h-7 text-[#183B2B]" />
          </div>
          <h2 className="text-xl font-bold font-serif-heading text-[#181F1A]">
            No Applications Yet
          </h2>
          <p className="text-xs text-[#58625B] max-w-xs mx-auto">
            You haven't submitted any adoption applications yet. Explore available rescue dogs to begin.
          </p>
          <button
            onClick={onNavigateToDiscover}
            className="px-5 py-2.5 bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Browse Dogs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Master List Column */}
          <div className="lg:col-span-5 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B958E] px-1 block">
              Applications ({userApplications.length})
            </span>

            {userApplications.map((app) => {
              const badge = getStatusBadge(app.status);
              const BadgeIcon = badge.icon;
              const isSelected = selectedApp?.id === app.id;

              return (
                <div
                  key={app.id}
                  id={`app-card-${app.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    if (window.innerWidth < 1024) {
                      document.getElementById('application-detail-panel')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setSelectedAppId(app.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex space-x-3 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B2B] ${
                    isSelected
                      ? 'bg-white border-[#183B2B] shadow-sm ring-2 ring-[#183B2B]/10'
                      : 'bg-white border-[#EAE4DC] hover:border-[#D5CEBF]'
                  }`}
                >
                  <img
                    src={app.dogPhoto}
                    alt={app.dogName}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm font-serif-heading text-[#181F1A] truncate">
                        {app.dogName}
                      </h3>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#183B2B]' : 'text-[#8B958E]'}`} />
                    </div>
                    <p className="text-xs text-[#58625B] truncate">{app.shelterName}</p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[10px] text-[#8B958E]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail View Column */}
          <div id="application-detail-panel" className="lg:col-span-7">
            {selectedApp && (
              <div className="bg-white rounded-3xl border border-[#EAE4DC] p-5 sm:p-7 shadow-xs space-y-6">
                {/* Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[#F2ECE4] gap-3">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={selectedApp.dogPhoto}
                      alt={selectedApp.dogName}
                      className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-[#EAE4DC]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#181F1A]">
                          {selectedApp.dogName}
                        </h2>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-[#183B2B] font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-[#357457] flex-shrink-0" />
                        <span>{selectedApp.shelterName}</span>
                      </div>
                      <p className="text-[11px] text-[#8B958E]">
                        Submitted {new Date(selectedApp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} by{' '}
                        <strong className="text-[#58625B]">{selectedApp.applicantName}</strong>
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const badge = getStatusBadge(selectedApp.status);
                    const Icon = badge.icon;
                    return (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto flex items-center space-x-1.5 shadow-xs ${badge.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>

                {/* Latest Coordinator Update (Prominently displayed) */}
                {selectedApp.shelterNotes ? (
                  <div className="bg-[#EDF4F0] border border-[#D8F3DC] rounded-2xl p-4 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#183B2B] flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#357457]" />
                        <span>Latest Shelter Coordinator Update</span>
                      </span>
                      <span className="text-[10px] text-[#357457] font-medium">
                        {new Date(selectedApp.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#24533E] leading-relaxed">
                      {selectedApp.shelterNotes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-2xl p-3.5 text-xs text-[#58625B] flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#8B958E]" />
                    <span>Application is queued for review by the shelter adoption coordinator.</span>
                  </div>
                )}

                {/* Audit & Review Timeline (Unclipped layout with solid spacing) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B958E] block">
                    Chronological Review Timeline
                  </span>

                  <div className="space-y-3 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE4DC]">
                    {selectedApp.timeline.map((event, idx) => {
                      const isLatest = idx === selectedApp.timeline.length - 1;
                      return (
                        <div key={idx} className="relative">
                          {/* Timeline Node Dot */}
                          <div
                            className={`absolute -left-7 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isLatest
                                ? 'border-[#183B2B] bg-[#183B2B] text-white shadow-xs'
                                : 'border-[#D5CEBF] bg-white text-[#8B958E]'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          </div>

                          {/* Event Card */}
                          <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#F2ECE4] space-y-1 text-xs">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="font-bold text-[#181F1A] capitalize text-xs">
                                {event.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-[#8B958E] flex-shrink-0">
                                {new Date(event.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[#58625B] text-xs leading-relaxed">{event.note}</p>
                            <div className="flex items-center space-x-1 pt-0.5 text-[10px] text-[#8B958E]">
                              <User className="w-3 h-3 text-[#8B958E]" />
                              <span>Recorded by {event.actorName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Application Details Grid */}
                <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EAE4DC] space-y-3 text-xs">
                  <span className="font-bold text-[#181F1A] text-xs uppercase tracking-wider block">
                    Applicant Information On File
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#58625B]">
                    <div>
                      <span className="font-semibold text-[#181F1A] block">Contact Phone:</span>
                      <span>{selectedApp.applicantPhone}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#181F1A] block">Housing Type:</span>
                      <span className="capitalize">{selectedApp.housingType.replace(/_/g, ' ')} ({selectedApp.hasYard ? 'Fenced Yard' : 'No Private Yard'})</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#181F1A] block">Daily Alone Time:</span>
                      <span>{selectedApp.hoursAlonePerDay} hours per day</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#181F1A] block">Veterinary Clinic Reference:</span>
                      <span>{selectedApp.vetReference?.clinicName ? `${selectedApp.vetReference.clinicName} (${selectedApp.vetReference.phone})` : 'None Provided'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F2ECE4] text-[#58625B]">
                    <span className="font-semibold text-[#181F1A] block mb-0.5">Adoption Motivation:</span>
                    <p className="italic bg-white/70 p-2.5 rounded-xl border border-[#EAE4DC] text-xs leading-relaxed">
                      "{selectedApp.reasonForAdopting}"
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4]">
                  <span className="text-[10px] text-[#8B958E]">
                    Ref: {selectedApp.id}
                  </span>
                  {selectedApp.status !== 'withdrawn' && selectedApp.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleWithdraw(selectedApp.id)}
                      className="text-xs font-semibold text-[#B85438] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85438] rounded-md px-1"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
