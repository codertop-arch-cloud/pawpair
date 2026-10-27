import React, { useEffect, useRef } from 'react';
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
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div
        ref={drawerRef}
        className="w-full max-w-sm sm:max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col border-l border-[#EAE4DC] animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#B85438]" fill="#B85438" />
            <h2 className="text-base sm:text-lg font-bold font-serif-heading text-[#181F1A]">
              Saved Dogs ({savedDogs.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#58625B] hover:bg-[#FAF7F2] transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDogs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-full bg-[#FAF0EC] text-[#B85438] flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-[#181F1A] text-sm mb-1 font-serif-heading">
                No saved dogs yet
              </h3>
              <p className="text-xs text-[#58625B] max-w-xs mx-auto">
                Tap the heart button on any dog card to save them for easy revisiting.
              </p>
            </div>
          ) : (
            savedDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-2xl p-3 border border-[#EAE4DC] shadow-xs hover:border-[#183B2B] transition flex space-x-3 items-center group"
              >
                <img
                  src={dog.photos[0]}
                  alt={dog.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#181F1A] text-sm font-serif-heading truncate">
                      {dog.name}
                    </h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EDF4F0] text-[#183B2B]">
                      {dog.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#58625B] truncate">{dog.breed}</p>
                  <p className="text-[11px] text-[#8B958E]">
                    {dog.ageYears} yrs • {dog.size} • ${dog.adoptionFee}
                  </p>
                  <div className="mt-1.5 flex items-center space-x-3">
                    <button
                      onClick={() => {
                        onSelectDog(dog);
                        onClose();
                      }}
                      className="text-xs font-semibold text-[#183B2B] hover:text-[#24533E] flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveSavedDog(dog.id)}
                      className="text-xs text-[#8B958E] hover:text-[#B85438] flex items-center space-x-1"
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
        <div className="p-3.5 border-t border-[#EAE4DC] bg-white text-[11px] text-[#8B958E] text-center flex-shrink-0">
          Saved in your current browser session.
        </div>
      </div>
    </div>
  );
};
