import React, { useState } from 'react';
import { Player, Innings, Team } from '../types';
import { BALLS_PER_OVER } from '../constants';
import WagonWheel from './WagonWheel';
import ShotMap from './ShotMap';
import { WagonWheelIcon } from './icons/WagonWheelIcon';
import { ShotMapIcon } from './icons/ShotMapIcon';

interface PlayerDetailViewProps {
  player: Player;
  team: Team;
  innings: [Innings, Innings | null];
  onBack: () => void;
}

const getBattingBreakdownByOver = (player: Player, innings: [Innings, Innings | null]) => {
  const breakdown = new Map<number, { runs: number; balls: number }>();
  const timeline = innings.flatMap(inn => inn?.timeline || []);
  
  timeline
    .filter(ball => ball && ball.batsmanId === player.id && !ball.isWide)
    .forEach(ball => {
      const over = breakdown.get(ball.overNumber) || { runs: 0, balls: 0 };
      over.runs += ball.runs;
      if (!ball.isNoBall) { // Balls faced are legal deliveries
        over.balls += 1;
      }
      breakdown.set(ball.overNumber, over);
    });

  return Array.from(breakdown.entries())
    .map(([overNumber, stats]) => ({ overNumber, ...stats }))
    .sort((a, b) => a.overNumber - b.overNumber);
};

const getBowlingBreakdownByOver = (player: Player, innings: [Innings, Innings | null]) => {
  const breakdown = new Map<number, { runs: number; wickets: number }>();
  const timeline = innings.flatMap(inn => inn?.timeline || []);

  timeline
    .filter(ball => ball && ball.bowlerId === player.id)
    .forEach(ball => {
      const over = breakdown.get(ball.overNumber) || { runs: 0, wickets: 0 };
      over.runs += ball.runs + ball.extraRuns;
      if (ball.isWicket) {
        over.wickets += 1;
      }
      breakdown.set(ball.overNumber, over);
    });
  
  return Array.from(breakdown.entries())
    .map(([overNumber, stats]) => ({ overNumber, ...stats }))
    .sort((a, b) => a.overNumber - b.overNumber);
};

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-muted p-2 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
);

const PlayerDetailView: React.FC<PlayerDetailViewProps> = ({ player, team, innings, onBack }) => {
  const [activeView, setActiveView] = useState<'wagon' | 'shotMap'>('wagon');
  const battingBreakdown = getBattingBreakdownByOver(player, innings);
  const bowlingBreakdown = getBowlingBreakdownByOver(player, innings);

  const calculateSR = (runs: number, balls: number) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00');
  const calculateEcon = (runs: number, balls: number) => (balls > 0 ? ((runs / (balls / BALLS_PER_OVER))).toFixed(2) : '0.00');
  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / BALLS_PER_OVER);
    const remainingBalls = balls % BALLS_PER_OVER;
    return `${overs}.${remainingBalls}`;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
        <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
            <button onClick={onBack} className="px-4 py-2 bg-muted hover:bg-accent rounded-md text-sm font-semibold">&larr; Back to Scorecard</button>
            <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">{player.name}</h3>
                <p className="text-sm text-muted-foreground">{team.name}</p>
            </div>
            <div className="w-40"></div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
            <div className="flex flex-col items-center justify-start">
                <div className="w-full flex justify-center border-b border-border mb-4">
                    <button onClick={() => setActiveView('wagon')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'wagon' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
                        <WagonWheelIcon className="w-5 h-5" />
                        <span>Wagon Wheel</span>
                    </button>
                     <button onClick={() => setActiveView('shotMap')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'shotMap' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
                        <ShotMapIcon className="w-5 h-5" />
                        <span>Shot Map</span>
                    </button>
                </div>
                {activeView === 'wagon' ? (
                    <WagonWheel player={player} innings={innings} />
                ) : (
                    <ShotMap player={player} innings={innings} />
                )}
            </div>

            <div className="space-y-6">
                {/* Batting Stats */}
                {player.balls > 0 && (
                    <div className="bg-card p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-secondary mb-3">Batting Summary</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <StatCard label="Runs" value={player.runs} />
                            <StatCard label="Balls" value={player.balls} />
                            <StatCard label="SR" value={calculateSR(player.runs, player.balls)} />
                            <StatCard label="4s/6s" value={`${player.fours}/${player.sixes}`} />
                        </div>
                        <h5 className="text-md font-semibold text-muted-foreground mb-2">Over Breakdown</h5>
                        <div className="overflow-auto max-h-32">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                    <tr>
                                        <th className="px-2 py-1">Over</th>
                                        <th className="px-2 py-1 text-right">Runs</th>
                                        <th className="px-2 py-1 text-right">Balls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {battingBreakdown.map(({ overNumber, runs, balls }) => (
                                        <tr key={overNumber} className="border-b border-border">
                                            <td className="px-2 py-1">{overNumber}</td>
                                            <td className="px-2 py-1 text-right">{runs}</td>
                                            <td className="px-2 py-1 text-right">{balls}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Bowling Stats */}
                {player.ballsBowled > 0 && (
                    <div className="bg-card p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-secondary mb-3">Bowling Summary</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <StatCard label="Overs" value={formatOvers(player.ballsBowled)} />
                            <StatCard label="Runs" value={player.runsConceded} />
                            <StatCard label="Wickets" value={player.wicketsTaken} />
                            <StatCard label="Econ" value={calculateEcon(player.runsConceded, player.ballsBowled)} />
                        </div>
                        <h5 className="text-md font-semibold text-muted-foreground mb-2">Over Breakdown</h5>
                        <div className="overflow-auto max-h-32">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                    <tr>
                                        <th className="px-2 py-1">Over</th>
                                        <th className="px-2 py-1 text-right">Runs</th>
                                        <th className="px-2 py-1 text-right">Wickets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bowlingBreakdown.map(({ overNumber, runs, wickets }) => (
                                        <tr key={overNumber} className="border-b border-border">
                                            <td className="px-2 py-1">{overNumber}</td>
                                            <td className="px-2 py-1 text-right">{runs}</td>
                                            <td className="px-2 py-1 text-right">{wickets}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PlayerDetailView;