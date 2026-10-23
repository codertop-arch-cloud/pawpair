import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { ShelterVisit, UserProfile } from '../../types';
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
      dataStore.joinVisit(visitId, currentUser, reservationNotes);
      setSelectedVisitId(null);
      setReservationNotes('');
      setSuccessToast('Spot confirmed! You are registered for the shelter visit.');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header & Safety Notice */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#EAE4DC]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B] text-[11px] font-semibold mb-1.5">
            <ShieldCheck className="w-3 h-3 text-[#357457]" />
            <span>Shelter-Supervised Group Orientations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#181F1A] tracking-tight">
            Group Shelter Visits
          </h1>
          <p className="text-xs sm:text-sm text-[#58625B] max-w-xl mt-0.5">
            Visit rescue facilities alongside fellow prospective adopters. Meet dogs in quiet yards with certified behavioral staff.
          </p>
        </div>

        {/* Privacy & Safety Note */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-[#58625B] bg-white px-3 py-2 rounded-xl border border-[#EAE4DC] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#357457] flex-shrink-0" />
          <span>Hosted directly by shelter staff • Contact details kept private</span>
        </div>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="bg-[#EDF4F0] border border-[#D8F3DC] text-[#183B2B] p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#357457]" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FAF0EC] border border-[#FCE8E2] text-[#B85438] p-3 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#B85438]" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-[#B85438] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Visits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeVisits.map((visit) => {
          const participants = dataStore.getVisitParticipants(visit.id);
          const isUserRegistered = participants.some((p) => p.userId === currentUser.id);
          const isFull = visit.participantCount >= visit.capacity;
          const spotsRemaining = Math.max(0, visit.capacity - visit.participantCount);
          const percentFilled = Math.min(100, Math.round((visit.participantCount / visit.capacity) * 100));

          const visitDateObj = new Date(visit.date);
          const monthStr = visitDateObj.toLocaleString('default', { month: 'short' });
          const dayNum = visitDateObj.getDate();
          const weekdayStr = visitDateObj.toLocaleString('default', { weekday: 'short' });

          return (
            <div
              key={visit.id}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                isUserRegistered
                  ? 'border-[#183B2B] ring-2 ring-[#183B2B]/10'
                  : 'border-[#EAE4DC] hover:border-[#D5CEBF] hover:shadow-sm'
              }`}
            >
              <div className="space-y-3.5">
                {/* Date Badge & Shelter Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] uppercase font-bold text-[#B85438] tracking-wider leading-none">
                        {monthStr}
                      </span>
                      <span className="text-base font-bold font-serif-heading text-[#181F1A] leading-tight">
                        {dayNum}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#183B2B] block">
                        {visit.shelterName}
                      </span>
                      <span className="text-[10px] text-[#8B958E]">
                        {weekdayStr} • {visit.startTime} - {visit.endTime}
                      </span>
                    </div>
                  </div>

                  {isUserRegistered ? (
                    <span className="text-[10px] font-bold text-[#183B2B] bg-[#EDF4F0] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-[#D8F3DC]">
                      <UserCheck className="w-3 h-3 text-[#357457]" />
                      <span>Going</span>
                    </span>
                  ) : isFull ? (
                    <span className="text-[10px] font-bold text-[#B85438] bg-[#FAF0EC] px-2 py-0.5 rounded-full">
                      Full
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#357457] bg-[#EDF4F0] px-2 py-0.5 rounded-full">
                      {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} left
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base font-serif-heading text-[#181F1A]">
                    {visit.title}
                  </h3>
                  <p className="text-xs text-[#58625B] mt-1 line-clamp-3 leading-relaxed">
                    {visit.description}
                  </p>
                </div>

                {/* Location */}
                <div className="text-[11px] text-[#58625B] flex items-center space-x-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8B958E] flex-shrink-0" />
                  <span className="truncate">{visit.shelterAddress}</span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-1 border-t border-[#F2ECE4]">
                  <div className="flex justify-between text-[11px] text-[#58625B]">
                    <span>Registered Attendees</span>
                    <span className="font-bold text-[#181F1A]">
                      {visit.participantCount} / {visit.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE4DC] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-[#B85438]' : 'bg-[#183B2B]'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Attendees (Names Only) */}
                {participants.length > 0 && (
                  <div className="pt-1">
                    <div className="flex flex-wrap gap-1">
                      {participants.map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] bg-[#FAF7F2] border border-[#EAE4DC] text-[#181F1A] px-2 py-0.5 rounded-md"
                        >
                          {p.userName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#F2ECE4]">
                {isUserRegistered ? (
                  <button
                    onClick={() => handleLeaveVisit(visit.id)}
                    className="w-full py-2 rounded-xl border border-[#B85438] text-[#B85438] hover:bg-[#FAF0EC] text-xs font-bold transition"
                  >
                    Cancel Reservation
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed"
                  >
                    Fully Booked
                  </button>
                ) : (
                  <button
                    id={`btn-join-visit-${visit.id}`}
                    onClick={() => setSelectedVisitId(visit.id)}
                    className="w-full py-2 bg-[#183B2B] hover:bg-[#24533E] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Join Group Visit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {selectedVisitId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#EAE4DC] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#F2ECE4]">
              <h3 className="text-lg font-bold font-serif-heading text-[#181F1A]">
                Confirm Visit Reservation
              </h3>
              <button
                onClick={() => setSelectedVisitId(null)}
                className="p-1 rounded-lg text-[#58625B] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#58625B] leading-relaxed">
              You will be registered under <strong className="text-[#181F1A]">{currentUser.fullName}</strong>. To protect privacy, only your first name will appear on the group roster.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#181F1A] block">
                Any specific dogs you'd like to meet during this visit? (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Interested in learning about gentle dogs like Barnaby or senior dog care."
                value={reservationNotes}
                onChange={(e) => setReservationNotes(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-2.5 text-xs text-[#181F1A] focus:outline-none focus:border-[#183B2B]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedVisitId(null);
                  setReservationNotes('');
                }}
                className="px-4 py-2 border border-[#EAE4DC] rounded-xl text-xs font-semibold text-[#58625B] hover:bg-[#FAF7F2]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleJoinVisit(selectedVisitId)}
                className="px-5 py-2 bg-[#183B2B] text-white rounded-xl text-xs font-bold hover:bg-[#24533E] transition shadow-xs"
              >
                Confirm Spot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
