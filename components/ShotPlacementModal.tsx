import React from 'react';
import { ShotDirection } from '../types';

interface ShotPlacementModalProps {
    runs: number;
    onSelect: (direction: ShotDirection) => void;
    onCancel: () => void;
}

const SHOT_AREAS: { name: ShotDirection; d: string }[] = [
    { name: 'Point', d: 'M100 100 L25.88 75 A100 100 0 0 1 75 25.88 Z' },
    { name: 'Cover', d: 'M100 100 L75 25.88 A100 100 0 0 1 125 25.88 Z' },
    { name: 'Long Off', d: 'M100 100 L125 25.88 A100 100 0 0 1 174.12 75 Z' },
    { name: 'Straight', d: 'M100 100 L174.12 75 A100 100 0 0 1 174.12 125 Z' },
    { name: 'Long On', d: 'M100 100 L174.12 125 A100 100 0 0 1 125 174.12 Z' },
    { name: 'Mid-Wicket', d: 'M100 100 L125 174.12 A100 100 0 0 1 75 174.12 Z' },
    { name: 'Square Leg', d: 'M100 100 L75 174.12 A100 100 0 0 1 25.88 125 Z' },
    { name: 'Fine Leg', d: 'M100 100 L25.88 125 A100 100 0 0 1 25.88 75 Z' },
];

const ShotPlacementModal: React.FC<ShotPlacementModalProps> = ({ runs, onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border p-6 rounded-lg shadow-2xl max-w-sm w-full animate-pop-in text-center">
        <h3 className="text-xl font-bold text-primary mb-2">Select Shot Direction</h3>
        <p className="text-muted-foreground mb-4">Where did the {runs} runs go?</p>
        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] mx-auto">
          <g transform="rotate(-22.5 100 100)">
            {SHOT_AREAS.map(({ name, d }) => (
              <path
                key={name}
                d={d}
                className="fill-muted stroke-border stroke-2 cursor-pointer transition-all duration-200 hover:fill-primary"
                onClick={() => onSelect(name)}
              />
            ))}
          </g>
          <circle cx="100" cy="100" r="15" className="fill-pitch-brown" />
        </svg>
        <button
          onClick={onCancel}
          className="mt-4 w-full px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShotPlacementModal;