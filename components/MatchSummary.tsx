import React from 'react';
// FIX: Import GameStatus to use it for type-safe comparisons.
import { GameState, Player, Team, GameStatus } from '../types';

interface MatchSummaryProps {
  state: GameState;
  dispatch: React.Dispatch<any>;
}

const PerformerCard: React.FC<{title: string, player: Player | null, value: string | number, label: string}> = ({ title, player, value, label }) => (
  <div className="bg-gray-900 p-3 rounded-lg text-center flex-1 min-w-[120px]">
    <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
    <p className="font-bold text-lg text-white truncate">{player?.name ?? 'N/A'}</p>
    <p className="font-semibold text-primary text-xl">{value} <span className="text-sm text-gray-500">{label}</span></p>
  </div>
);


const MatchSummary: React.FC<MatchSummaryProps> = ({ state, dispatch }) => {
  if (state.status !== GameStatus.FINISHED || !state.winner) {
    return null;
  }
  
  const { winner, winMargin, teams, innings } = state;

  const findTopPerformer = (team: Team, metric: 'runs' | 'wicketsTaken'): Player | null => {
    if (!team?.players?.length) return null;

    const topPlayer = team.players.reduce((top, player) => {
      // only consider players who have stats for the metric
      if (player[metric] > 0 && player[metric] >= top[metric]) {
        return player;
      }
      return top;
    }, team.players[0]);

    // If no one has a score > 0 for that metric, don't show a top performer.
    return topPlayer[metric] > 0 ? topPlayer : null;
  };

  const teamOneTopBatsman = findTopPerformer(teams[0], 'runs');
  const teamTwoTopBatsman = findTopPerformer(teams[1], 'runs');
  const teamOneTopBowler = findTopPerformer(teams[0], 'wicketsTaken');
  const teamTwoTopBowler = findTopPerformer(teams[1], 'wicketsTaken');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface p-6 md:p-8 rounded-2xl text-center shadow-2xl max-w-2xl w-full">
        <h2 className="text-4xl font-black text-primary mb-2 uppercase tracking-wider">Match Finished</h2>
        <p className="text-2xl font-bold text-white mb-1">{winner} won!</p>
        <p className="text-gray-300 mb-6">{winMargin}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-left">
          {innings.filter(Boolean).map((inn, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-lg">
                <p className="font-bold text-lg text-white">{inn!.battingTeam}</p>
                <p className="text-2xl font-bold">{inn!.score} / {inn!.wickets} <span className="text-base text-gray-400">({inn!.overs.toFixed(1)} Ov)</span></p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-secondary my-4">Top Performers</h3>
        <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
                <PerformerCard title={`${teams[0].name} - Top Batsman`} player={teamOneTopBatsman} value={teamOneTopBatsman?.runs ?? 0} label="runs"/>
                <PerformerCard title={`${teams[1].name} - Top Batsman`} player={teamTwoTopBatsman} value={teamTwoTopBatsman?.runs ?? 0} label="runs"/>
            </div>
             <div className="flex flex-wrap justify-center gap-3">
                <PerformerCard title={`${teams[0].name} - Top Bowler`} player={teamOneTopBowler} value={teamOneTopBowler?.wicketsTaken ?? 0} label="wkts"/>
                <PerformerCard title={`${teams[1].name} - Top Bowler`} player={teamTwoTopBowler} value={teamTwoTopBowler?.wicketsTaken ?? 0} label="wkts"/>
            </div>
        </div>
        
        <button onClick={() => dispatch({type: 'NEW_GAME'})} className="bg-primary hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg mt-8 text-lg">
          Start New Game
        </button>
      </div>
    </div>
  )
}

export default MatchSummary;