import React, { useState } from 'react';
import { Team, Player } from '../types';
import { BALLS_PER_OVER } from '../constants';

interface PlayerStatsProps {
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ teams, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / BALLS_PER_OVER);
    const remainingBalls = balls % BALLS_PER_OVER;
    return `${overs}.${remainingBalls}`;
  };

  const calculateSR = (runs: number, balls: number) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00');
  const calculateEcon = (runs: number, balls: number) => (balls > 0 ? ((runs / (balls / BALLS_PER_OVER))).toFixed(2) : '0.00');

  const renderTeamStats = (team: Team) => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-primary mb-2">Batting</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-2">Player</th>
                <th scope="col" className="px-4 py-2 text-right">R</th>
                <th scope="col" className="px-4 py-2 text-right">B</th>
                <th scope="col" className="px-4 py-2 text-right">4s</th>
                <th scope="col" className="px-4 py-2 text-right">6s</th>
                <th scope="col" className="px-4 py-2 text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map(p => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150">
                  <td className="px-4 py-2 font-medium text-white truncate max-w-[120px]">{p.name} {p.isOut ? '' : p.isBatting ? '*' : ''}</td>
                  <td className="px-4 py-2 text-right font-bold text-white">{p.runs}</td>
                  <td className="px-4 py-2 text-right">{p.balls}</td>
                  <td className="px-4 py-2 text-right">{p.fours}</td>
                  <td className="px-4 py-2 text-right">{p.sixes}</td>
                  <td className="px-4 py-2 text-right">{calculateSR(p.runs, p.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-primary mb-2">Bowling</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-2">Player</th>
                <th scope="col" className="px-4 py-2 text-right">O</th>
                <th scope="col" className="px-4 py-2 text-right">R</th>
                <th scope="col" className="px-4 py-2 text-right">W</th>
                <th scope="col" className="px-4 py-2 text-right">Econ</th>
              </tr>
            </thead>
            <tbody>
              {team.players.filter(p => p.ballsBowled > 0).map(p => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150">
                  <td className="px-4 py-2 font-medium text-white truncate max-w-[120px]">{p.name}</td>
                  <td className="px-4 py-2 text-right">{formatOvers(p.ballsBowled)}</td>
                  <td className="px-4 py-2 text-right">{p.runsConceded}</td>
                  <td className="px-4 py-2 text-right font-bold text-white">{p.wicketsTaken}</td>
                  <td className="px-4 py-2 text-right">{calculateEcon(p.runsConceded, p.ballsBowled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-lg p-6 h-full w-full max-w-3xl relative shadow-2xl flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        <h3 className="text-2xl font-bold mb-4 text-primary">Player Statistics</h3>
        <div className="flex border-b border-gray-700 mb-4">
          {teams.map((team, index) => (
            <button
              key={team.name}
              className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === index ? 'border-b-2 border-primary text-white' : 'text-gray-400'}`}
              onClick={() => setActiveTab(index)}
            >
              {team.name}
            </button>
          ))}
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          {renderTeamStats(teams[activeTab])}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;