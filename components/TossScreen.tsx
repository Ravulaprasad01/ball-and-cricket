import React, { useState, useEffect } from 'react';
import { MatchSettings } from '../types';

interface TossScreenProps {
  settings: MatchSettings;
  dispatch: React.Dispatch<any>;
}

const TossScreen: React.FC<TossScreenProps> = ({ settings, dispatch }) => {
  const [isTossing, setIsTossing] = useState(false);
  const [tossResult, setTossResult] = useState<'Heads' | 'Tails' | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const handleToss = () => {
    setIsTossing(true);
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const tossWinner = Math.random() < 0.5 ? settings.teamOneName : settings.teamTwoName;
      setTossResult(result);
      setWinner(tossWinner);
      setIsTossing(false);
    }, 1000);
  };
  
  const handleChoice = (choseTo: 'Bat' | 'Bowl') => {
    dispatch({ type: 'START_INNINGS_AFTER_TOSS', payload: { tossWinner: winner, choseTo } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 animate-slide-in-up">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-2xl p-8 text-center border border-border border-t-4 border-t-primary">
        <h2 className="text-3xl font-bold text-foreground mb-2">Coin Toss</h2>
        <p className="text-muted-foreground mb-8">{settings.teamOneName} vs {settings.teamTwoName}</p>
        
        <div className="h-32 flex items-center justify-center">
          {!winner && (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold transition-transform duration-1000 ${isTossing ? 'animate-coin-flip' : ''}`}
                style={{ background: 'linear-gradient(145deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.8))'}}>
              <span className="text-secondary-foreground">Toss</span>
            </div>
          )}
          {winner && (
             <div className="animate-fade-in text-center">
                <p className="text-xl text-muted-foreground"><span className="font-bold text-primary">{winner}</span> won the toss!</p>
                <p className="text-sm text-muted-foreground/70">({tossResult} was the result)</p>
             </div>
          )}
        </div>

        {!winner && (
          <button onClick={handleToss} disabled={isTossing} className="mt-8 w-full px-6 py-3 border border-transparent text-lg font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-card disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
            {isTossing ? 'Tossing...' : 'Toss Coin'}
          </button>
        )}

        {winner && (
          <div className="mt-8 animate-fade-in">
            <p className="mb-4 text-lg">{winner}, what is your choice?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleChoice('Bat')} className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 text-white">Bat</button>
              <button onClick={() => handleChoice('Bowl')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 text-white">Bowl</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TossScreen;