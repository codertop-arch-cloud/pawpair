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
  ExternalLink,
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
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications[0]?.id || null
  );

  const userApplications = applications.filter(
    (app) => app.adopterId === currentUser.id || currentUser.role === 'shelter_staff'
  );

  const selectedApp = userApplications.find((a) => a.id === selectedAppId) || userApplications[0];

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
          label: 'Submitted — In Shelter Queue',
          icon: Clock,
        };
      case 'under_review':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Under Shelter Review',
          icon: Clock,
        };
      case 'more_info_requested':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          label: 'More Information Requested',
          icon: AlertCircle,
        };
      case 'approved':
        return {
          bg: 'bg-[#EBF7EE] text-[#1B4332] border-[#D8F3DC]',
          label: 'Approved for Meet & Greet',
          icon: CheckCircle2,
        };
      case 'rejected':
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'Not Selected / Closed',
          icon: XCircle,
        };
      case 'withdrawn':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          label: 'Withdrawn by Applicant',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E6DFD5]">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Transparent Adoption Lifecycle</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-[#1B4332] tracking-tight">
          Adoption Applications
        </h1>
        <p className="text-sm text-[#5C675F] max-w-2xl mt-1">
          Track the live review status, coordinator notes, and decision milestones for your adoption requests.
        </p>
      </div>

      {userApplications.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-[#E6DFD5] shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#5C675F] flex items-center justify-center mx-auto border border-[#E6DFD5]">
            <FileText className="w-8 h-8 text-[#1B4332]" />
          </div>
          <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
            No Applications on File
          </h2>
          <p className="text-xs text-[#5C675F] max-w-xs mx-auto">
            You haven't submitted any adoption applications yet. Explore our available dogs and apply when you find the right match!
          </p>
          <button
            onClick={onNavigateToDiscover}
            className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Discover Available Dogs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Application Cards List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8E9991] px-1">
              Your Submissions ({userApplications.length})
            </h2>

            {userApplications.map((app) => {
              const badge = getStatusBadge(app.status);
              const BadgeIcon = badge.icon;
              const isSelected = selectedApp?.id === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex space-x-3 items-center ${
                    isSelected
                      ? 'bg-white border-[#1B4332] shadow-md ring-2 ring-[#1B4332]/10'
                      : 'bg-white border-[#E6DFD5] hover:border-[#D5CEBF] shadow-xs'
                  }`}
                >
                  <img
                    src={app.dogPhoto}
                    alt={app.dogName}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base font-serif-heading text-[#1C241E] truncate">
                        {app.dogName}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-[#8E9991]" />
                    </div>
                    <p className="text-xs text-[#5C675F] truncate">{app.shelterName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-[#8E9991]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Timeline & Application Review */}
          <div className="lg:col-span-7">
            {selectedApp && (
              <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F4EFEA] gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedApp.dogPhoto}
                      alt={selectedApp.dogName}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold font-serif-heading text-[#1B4332]">
                        Application for {selectedApp.dogName}
                      </h2>
                      <p className="text-xs text-[#5C675F]">
                        Submitted {new Date(selectedApp.createdAt).toLocaleDateString()} by{' '}
                        {selectedApp.applicantName}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const badge = getStatusBadge(selectedApp.status);
                    const Icon = badge.icon;
                    return (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto flex items-center space-x-1.5 ${badge.bg}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>

                {/* Shelter Coordinator Notes */}
                {selectedApp.shelterNotes && (
                  <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-4 space-y-1">
                    <span className="text-xs font-bold text-[#1B4332] flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                      <span>Latest Shelter Coordinator Update</span>
                    </span>
                    <p className="text-xs text-[#2D372E] leading-relaxed">
                      {selectedApp.shelterNotes}
                    </p>
                  </div>
                )}

                {/* Status Timeline Stepper */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E9991]">
                    Application Lifecycle Timeline
                  </h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6DFD5]">
                    {selectedApp.timeline.map((event, idx) => {
                      const isLatest = idx === selectedApp.timeline.length - 1;
                      return (
                        <div key={idx} className="relative group">
                          {/* Dot */}
                          <div
                            className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                              isLatest
                                ? 'border-[#1B4332] ring-4 ring-[#D8F3DC]'
                                : 'border-[#8E9991]'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLatest ? 'bg-[#1B4332]' : 'bg-[#8E9991]'
                              }`}
                            />
                          </div>

                          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA] space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1C241E] capitalize">
                                {event.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-[#8E9991]">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[#5C675F] text-xs">
                              {event.note || 'Milestone updated.'}
                            </p>
                            <span className="text-[10px] text-[#8E9991] block italic">
                              Logged by {event.actorName}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submitted Application Details Summary */}
                <div className="bg-white rounded-xl border border-[#E6DFD5] p-4 space-y-3 text-xs">
                  <h4 className="font-bold text-[#1B4332] text-xs uppercase tracking-wider">
                    Application Summary
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#5C675F]">
                    <div>
                      <span className="font-semibold text-[#1C241E]">Applicant:</span>{' '}
                      {selectedApp.applicantName} ({selectedApp.applicantPhone})
                    </div>
                    <div>
                      <span className="font-semibold text-[#1C241E]">Housing:</span>{' '}
                      {selectedApp.housingType.replace('_', ' ')} (
                      {selectedApp.hasYard ? 'Fenced Yard' : 'No Yard'})
                    </div>
                    <div>
                      <span className="font-semibold text-[#1C241E]">Hours Alone:</span>{' '}
                      {selectedApp.hoursAlonePerDay} hrs / day
                    </div>
                    <div>
                      <span className="font-semibold text-[#1C241E]">Vet Reference:</span>{' '}
                      {selectedApp.vetReference?.clinicName || 'None listed'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F4EFEA]">
                    <span className="font-semibold text-[#1C241E] block mb-0.5">
                      Adoption Motivation:
                    </span>
                    <p className="text-[#5C675F] italic">"{selectedApp.reasonForAdopting}"</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F4EFEA]">
                  <span className="text-xs text-[#8E9991]">
                    Application ID: {selectedApp.id}
                  </span>

                  {selectedApp.status !== 'withdrawn' && selectedApp.status !== 'rejected' && (
                    <button
                      onClick={() => handleWithdraw(selectedApp.id)}
                      className="text-xs font-semibold text-[#BA5536] hover:underline"
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
