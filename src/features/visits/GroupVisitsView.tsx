import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ShelterVisit, UserProfile, VisitParticipant } from '../../types';
import { dataStore } from '../../services/dataService';

interface GroupVisitsViewProps {
  visits: ShelterVisit[];
  currentUser: UserProfile;
  onRefreshVisits: () => void;
}

export const GroupVisitsView: React.FC<GroupVisitsViewProps> = ({
  visits,
  currentUser,
  onRefreshVisits,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [reservationNotes, setReservationNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activeVisits = visits.filter((v) => v.status === 'upcoming');

  const handleJoinVisit = (visitId: string) => {
    setErrorMessage(null);
    try {
      const res = dataStore.joinVisit(visitId, currentUser, reservationNotes);
      setSelectedVisitId(null);
      setReservationNotes('');
      setSuccessToast('Successfully registered for shelter visit!');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefreshVisits();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reserve spot.');
    }
  };

  const handleLeaveVisit = (visitId: string) => {
    if (window.confirm('Are you sure you wish to cancel your shelter visit reservation?')) {
      try {
        dataStore.leaveVisit(visitId, currentUser.id);
        setSuccessToast('Reservation cancelled. Capacity has been freed.');
        setTimeout(() => setSuccessToast(null), 3500);
        onRefreshVisits();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel reservation.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Safety Notice */}
      <div className="pb-4 border-b border-[#E6DFD5] space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Staff-Supervised Shelter Gatherings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-[#1B4332] tracking-tight">
          Coordinated Group Shelter Visits
        </h1>
        <p className="text-sm text-[#5C675F] max-w-3xl">
          Visit rescue facilities alongside other prospective adopters. Meet resident dogs in quiet outdoor yards, talk with behavioral trainers, and learn about adoption transitions together in a safe, structured setting.
        </p>

        {/* Welfare & Safety Assurance Box */}
        <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-4 rounded-2xl flex items-start space-x-3 text-xs text-[#5C675F]">
          <ShieldCheck className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Safety & Privacy First:</strong> All group visits are hosted on-site by certified shelter personnel. Individual contact details are protected and never shared with other participants.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="bg-[#EBF7EE] border border-[#D8F3DC] text-[#1B4332] p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-[#FFF3F0] border border-[#FCE8E2] text-[#BA5536] p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#BA5536]" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-[#BA5536] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Visits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeVisits.map((visit) => {
          const participants = dataStore.getVisitParticipants(visit.id);
          const isUserRegistered = participants.some((p) => p.userId === currentUser.id);
          const isFull = visit.participantCount >= visit.capacity;
          const spotsRemaining = Math.max(0, visit.capacity - visit.participantCount);
          const percentFilled = Math.min(100, Math.round((visit.participantCount / visit.capacity) * 100));

          return (
            <div
              key={visit.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                isUserRegistered
                  ? 'border-[#1B4332] ring-2 ring-[#1B4332]/10'
                  : 'border-[#E6DFD5] hover:border-[#D5CEBF]'
              }`}
            >
              <div className="space-y-3">
                {/* Shelter Badge & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B4332] bg-[#EBF7EE] px-2.5 py-1 rounded-full border border-[#D8F3DC] flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-[#2D6A4F]" />
                    <span>{visit.shelterName}</span>
                  </span>

                  {isUserRegistered ? (
                    <span className="text-xs font-bold text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>You're Going</span>
                    </span>
                  ) : isFull ? (
                    <span className="text-xs font-bold text-[#BA5536] bg-[#FFF3F0] px-2 py-0.5 rounded-full">
                      Fully Booked
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#2D6A4F]">
                      {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} left
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-lg font-serif-heading text-[#1C241E]">
                    {visit.title}
                  </h3>
                  <p className="text-xs text-[#5C675F] mt-1 leading-relaxed line-clamp-3">
                    {visit.description}
                  </p>
                </div>

                {/* Logistics */}
                <div className="space-y-1.5 text-xs text-[#2D372E] bg-[#FAF8F5] p-3 rounded-xl border border-[#F4EFEA]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span className="font-semibold">
                      {new Date(visit.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>
                      {visit.startTime} - {visit.endTime} PST
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span className="truncate">{visit.shelterAddress}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5C675F] font-medium flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity</span>
                    </span>
                    <span className="font-bold text-[#1C241E]">
                      {visit.participantCount} / {visit.capacity} attendees
                    </span>
                  </div>
                  <div className="w-full bg-[#E6DFD5] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-[#BA5536]' : 'bg-[#2D6A4F]'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Participant Avatars (Names only, no private emails for privacy) */}
                {participants.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#8E9991] uppercase tracking-wider block mb-1">
                      Joining this visit ({participants.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {participants.map((p) => (
                        <span
                          key={p.id}
                          className="text-[11px] bg-[#FAF8F5] border border-[#E6DFD5] text-[#1C241E] px-2 py-0.5 rounded-full"
                        >
                          {p.userName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#F4EFEA]">
                {isUserRegistered ? (
                  <button
                    onClick={() => handleLeaveVisit(visit.id)}
                    className="w-full py-2.5 rounded-xl border border-[#BA5536] text-[#BA5536] hover:bg-[#FFF3F0] text-xs font-bold transition"
                  >
                    Cancel My Reservation
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed"
                  >
                    Visit Full (Join Waitlist at Shelter)
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedVisitId(visit.id)}
                    className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Join Group Shelter Visit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION / NOTES MODAL */}
      {selectedVisitId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E6DFD5] space-y-4">
            <h3 className="text-xl font-bold font-serif-heading text-[#1B4332]">
              Confirm Your Shelter Visit Spot
            </h3>
            <p className="text-xs text-[#5C675F]">
              You will be registered under <strong>{currentUser.fullName}</strong> (
              {currentUser.email}).
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-[#1C241E] block">
                Any specific questions or dog interests for shelter staff? (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Interested in learning about gentle dogs like Barnaby or senior dog care."
                value={reservationNotes}
                onChange={(e) => setReservationNotes(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-2.5 text-xs text-[#1C241E]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedVisitId(null);
                  setReservationNotes('');
                }}
                className="px-4 py-2 border rounded-xl text-xs text-[#5C675F]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleJoinVisit(selectedVisitId)}
                className="px-5 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F]"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
