import React from 'react';
import { CricketBallRealisticIcon } from './icons/CricketBallRealisticIcon';
import { CricketLogoAnimationIcon } from './icons/CricketLogoAnimationIcon';

interface LoadingScreenProps {
  onAnimationComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onAnimationComplete }) => {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-loading-container-fade-out loading-stadium-bg"
      style={{ animationDuration: '3.5s' }}
      onAnimationEnd={onAnimationComplete}
      aria-label="Loading application"
    >
      <div className="ball-container-3d">
        <div className="animate-ball-spin">
          <CricketBallRealisticIcon className="w-full h-full animate-ball-glow" />
        </div>
      </div>
      <div className="mt-8 animate-logo-fade-in">
        <CricketLogoAnimationIcon />
      </div>
    </div>
  );
};

export default LoadingScreen;