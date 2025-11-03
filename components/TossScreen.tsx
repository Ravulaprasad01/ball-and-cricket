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
    <div className="min-h-screen flex items-center justify-center bg-night p-4">
      <div className="w-full max-w-md mx-auto bg-surface rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Coin Toss</h2>
        <p className="text-gray-400 mb-8">{settings.teamOneName} vs {settings.teamTwoName}</p>
        
        <div className="h-32 flex items-center justify-center">
          {!winner && (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold transition-transform duration-1000 ${isTossing ? 'animate-coin-flip' : ''}`}
                style={{ background: 'linear-gradient(145deg, #FFC107, #E6A200)'}}>
              <span className="text-gray-900">Toss</span>
            </div>
          )}
          {winner && (
             <div className="text-center">
                <p className="text-lg text-gray-300">{winner} won the toss!</p>
                <p className="text-sm text-gray-500">({tossResult} was the call)</p>
             </div>
          )}
        </div>

        {!winner && (
          <button onClick={handleToss} disabled={isTossing} className="mt-8 w-full px-6 py-3 border border-transparent text-lg text-white bg-primary rounded-md shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface disabled:bg-gray-600">
            {isTossing ? 'Tossing...' : 'Toss Coin'}
          </button>
        )}

        {winner && (
          <div className="mt-8">
            <p className="mb-4 text-lg">{winner}, what would you like to do?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleChoice('Bat')} className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-md text-lg font-semibold">Bat</button>
              <button onClick={() => handleChoice('Bowl')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-semibold">Bowl</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TossScreen;