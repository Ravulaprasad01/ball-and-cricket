import React, { useState } from 'react';
import { MatchSettings } from '../types';

interface SetupScreenProps {
  onStartMatch: (settings: MatchSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartMatch }) => {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<MatchSettings>({
    overs: 5,
    playersPerTeam: 2,
    teamOneName: 'Team A',
    teamTwoName: 'Team B',
    teamOnePlayers: [],
    teamTwoPlayers: [],
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const players = Math.max(2, Math.min(11, Number(settings.playersPerTeam)));
      setSettings(prev => ({
        ...prev,
        playersPerTeam: players,
        teamOnePlayers: Array(players).fill(''),
        teamTwoPlayers: Array(players).fill(''),
      }));
    }
    setStep(prev => prev + 1);
  };
  
  const handlePlayerNameChange = (team: 'teamOne' | 'teamTwo', index: number, name: string) => {
    setSettings(prev => {
      const newPlayers = [...(team === 'teamOne' ? prev.teamOnePlayers : prev.teamTwoPlayers)];
      newPlayers[index] = name;
      return { ...prev, [team === 'teamOne' ? 'teamOnePlayers' : 'teamTwoPlayers']: newPlayers };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSettings = {
      ...settings,
      teamOnePlayers: settings.teamOnePlayers.map((name, i) => name || `Player ${i + 1}`),
      teamTwoPlayers: settings.teamTwoPlayers.map((name, i) => name || `Player ${i + 1}`),
    };
    onStartMatch(finalSettings);
  };
  
  const renderStepOne = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="teamOneName" className="block text-sm font-medium text-gray-300">Team One Name</label>
        <input type="text" name="teamOneName" id="teamOneName" value={settings.teamOneName} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200" />
      </div>
      <div>
        <label htmlFor="teamTwoName" className="block text-sm font-medium text-gray-300">Team Two Name</label>
        <input type="text" name="teamTwoName" id="teamTwoName" value={settings.teamTwoName} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="overs" className="block text-sm font-medium text-gray-300">Overs</label>
          <select id="overs" name="overs" value={settings.overs} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200">
            <option value="5">5 Overs</option>
            <option value="10">10 Overs</option>
            <option value="20">20 Overs</option>
            <option value="50">50 Overs</option>
            <option value="0">Test Match (Unlimited)</option>
          </select>
        </div>
        <div>
          <label htmlFor="playersPerTeam" className="block text-sm font-medium text-gray-300">Players per Team</label>
          <input type="number" name="playersPerTeam" id="playersPerTeam" min="2" max="11" value={settings.playersPerTeam} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200" />
        </div>
      </div>
    </div>
  );

  const renderPlayerInputs = (teamName: string, team: 'teamOne' | 'teamTwo') => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">{teamName} Players</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
        {(team === 'teamOne' ? settings.teamOnePlayers : settings.teamTwoPlayers).map((_, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <label htmlFor={`${team}-player-${index}`} className="block text-sm font-medium text-gray-400">Player {index + 1}</label>
            <input
              type="text"
              id={`${team}-player-${index}`}
              placeholder={`Player ${index + 1} Name`}
              value={(team === 'teamOne' ? settings.teamOnePlayers : settings.teamTwoPlayers)[index]}
              onChange={(e) => handlePlayerNameChange(team, index, e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      {renderPlayerInputs(settings.teamOneName, 'teamOne')}
      {renderPlayerInputs(settings.teamTwoName, 'teamTwo')}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-night p-4">
      <div className="w-full max-w-2xl mx-auto bg-surface rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-2">New Match Setup</h2>
        <p className="text-center text-gray-400 mb-8">Configure your cricket match</p>
        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          <div className="mt-8 flex justify-end space-x-4">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border border-gray-500 text-gray-300 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-surface transition-colors duration-200">
                Back
              </button>
            )}
            <button type="submit" className="px-6 py-2 border border-transparent text-white bg-primary rounded-md shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface transition-colors duration-200">
              {step === 1 ? 'Next: Enter Players' : 'Proceed to Toss'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;