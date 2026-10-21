import React from 'react';
import { X, Heart, ExternalLink, Trash2 } from 'lucide-react';
import { Dog } from '../types';

interface SavedDogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDogs: Dog[];
  onSelectDog: (dog: Dog) => void;
  onRemoveSavedDog: (dogId: string) => void;
}

export const SavedDogsDrawer: React.FC<SavedDogsDrawerProps> = ({
  isOpen,
  onClose,
  savedDogs,
  onSelectDog,
  onRemoveSavedDog,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-[#E6DFD5] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E6DFD5] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-[#BA5536]" fill="#BA5536" />
            <h2 className="text-lg font-bold font-serif-heading text-[#1B4332]">
              Saved Rescue Dogs ({savedDogs.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5C675F] hover:bg-[#F4EFEA] transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDogs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#FCE8E2] text-[#BA5536] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-[#1C241E] text-base mb-1 font-serif-heading">
                No saved dogs yet
              </h3>
              <p className="text-sm text-[#5C675F] max-w-xs mx-auto">
                As you browse the discovery feed or card stack, tap the heart button to save dogs you wish to revisit.
              </p>
            </div>
          ) : (
            savedDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-xl p-3 border border-[#E6DFD5] shadow-xs hover:border-[#1B4332] transition flex space-x-3 items-center group"
              >
                <img
                  src={dog.photos[0]}
                  alt={dog.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#1C241E] text-base font-serif-heading">
                      {dog.name}
                    </h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#1B4332]">
                      {dog.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C675F] truncate">{dog.breed}</p>
                  <p className="text-xs text-[#8E9991]">
                    {dog.ageYears} yrs • {dog.size} • {dog.location}
                  </p>
                  <div className="mt-2 flex items-center space-x-3">
                    <button
                      onClick={() => {
                        onSelectDog(dog);
                        onClose();
                      }}
                      className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveSavedDog(dog.id)}
                      className="text-xs text-[#8E9991] hover:text-[#BA5536] flex items-center space-x-1"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6DFD5] bg-white text-xs text-[#5C675F] text-center">
          Saved dogs are preserved in your local session.
        </div>
      </div>
    </div>
  );
};
