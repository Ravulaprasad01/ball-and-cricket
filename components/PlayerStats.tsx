import React, { useState, useMemo } from 'react';
import { Team, Player, Innings } from '../types';
import { BALLS_PER_OVER } from '../constants';
import { TrophyIcon } from './icons/TrophyIcon';
import PlayerDetailView from './PlayerDetailView';

interface PlayerStatsProps {
  teams: Team[];
  innings: [Innings, Innings | null];
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  player: Player | null;
  stats: { label: string; value: string | number }[];
}> = ({ icon, title, player, stats }) => {
  if (!player) {
    return (
      <div className="bg-muted/50 p-4 rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[160px] animate-fade-in border border-border">
        <div className="w-10 h-10 text-muted-foreground mb-2">{icon}</div>
        <h6 className="font-semibold text-sm text-foreground">{title}</h6>
        <p className="text-muted-foreground text-sm mt-2">Not enough data</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card to-muted/50 p-4 rounded-xl shadow-lg border border-border h-full transform hover:scale-105 transition-transform duration-300 animate-fade-in">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 mr-3 text-secondary">{icon}</div>
        <h6 className="font-semibold text-md text-foreground truncate">{title}</h6>
      </div>
      <p className="font-bold text-xl text-primary truncate">{player.name}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground text-lg">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


const PlayerStats: React.FC<PlayerStatsProps> = ({ teams, innings, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const calculateSR = (runs: number, balls: number) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00');
  const calculateEcon = (runs: number, balls: number) => (balls > 0 ? ((runs / (balls / BALLS_PER_OVER))).toFixed(2) : '0.00');
  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / BALLS_PER_OVER);
    const remainingBalls = balls % BALLS_PER_OVER;
    return `${overs}.${remainingBalls}`;
  };

  const topPerformers = useMemo(() => {
    const findTopPerformer = (team: Team, metric: 'runs' | 'wicketsTaken'): Player | null => {
      if (!team?.players?.length) return null;
      
      const eligiblePlayers = team.players.filter(p => {
          if (metric === 'runs') return p.balls > 0 || p.runs > 0;
          if (metric === 'wicketsTaken') return p.ballsBowled > 0;
          return false;
      });

      if (eligiblePlayers.length === 0) return null;

      return eligiblePlayers.reduce((top, current) => {
          if (!top) return current;
          
          const topStat = top[metric];
          const currentStat = current[metric];

          if (currentStat > topStat) return current;
          if (currentStat === topStat && currentStat > 0) {
              if (metric === 'runs') {
                  const topSR = parseFloat(calculateSR(top.runs, top.balls));
                  const currentSR = parseFloat(calculateSR(current.runs, current.balls));
                  if (currentSR > topSR) return current;
              } else if (metric === 'wicketsTaken') {
                  const topEcon = top.ballsBowled > 0 ? parseFloat(calculateEcon(top.runsConceded, top.ballsBowled)) : Infinity;
                  const currentEcon = current.ballsBowled > 0 ? parseFloat(calculateEcon(current.runsConceded, current.ballsBowled)) : Infinity;
                  if (currentEcon < topEcon) return current;
              }
          }
          return top;
      }, null as Player | null);
    };
    
    return teams.map(team => ({
        teamName: team.name,
        topBatsman: findTopPerformer(team, 'runs'),
        topBowler: findTopPerformer(team, 'wicketsTaken')
    }));
  }, [teams]);
  
  const handleSelectPlayer = (playerId: number) => {
      setSelectedPlayerId(playerId);
  };
  
  const handleBackToScorecard = () => {
      setSelectedPlayerId(null);
  };

  const renderTeamAnalytics = (team: Team, performers: any) => {
    const batsmen = team.players.filter(p => p.balls > 0 || p.isOut || p.runs > 0).sort((a,b) => b.runs - a.runs);
    const bowlers = team.players.filter(p => p.ballsBowled > 0).sort((a,b) => b.wicketsTaken - a.wicketsTaken);

    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Top Performers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PerformanceCard
                        icon={<TrophyIcon className="w-full h-full" />}
                        title="Top Batsman"
                        player={performers.topBatsman}
                        stats={performers.topBatsman ? [
                          { label: 'Runs', value: performers.topBatsman.runs },
                          { label: 'SR', value: calculateSR(performers.topBatsman.runs, performers.topBatsman.balls) }
                        ] : []}
                    />
                    <PerformanceCard
                        icon={<TrophyIcon className="w-full h-full" />}
                        title="Top Bowler"
                        player={performers.topBowler}
                        stats={performers.topBowler ? [
                          { label: 'Wickets', value: performers.topBowler.wicketsTaken },
                          { label: 'Econ', value: calculateEcon(performers.topBowler.runsConceded, performers.topBowler.ballsBowled) },
                        ] : []}
                    />
                </div>
            </div>

            {batsmen.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Batting Scorecard</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Player</th>
                                    <th scope="col" className="px-4 py-2 text-right">Runs</th>
                                    <th scope="col" className="px-4 py-2 text-right">Balls</th>
                                    <th scope="col" className="px-4 py-2 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batsmen.map(p => (
                                    <tr key={p.id} onClick={() => handleSelectPlayer(p.id)} className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors duration-200">
                                        <td className="px-4 py-2 font-medium text-foreground truncate max-w-[150px]">{p.name}</td>
                                        <td className="px-4 py-2 text-right font-bold text-foreground">{p.runs}</td>
                                        <td className="px-4 py-2 text-right">{p.balls}</td>
                                        <td className="px-4 py-2 text-right">{calculateSR(p.runs, p.balls)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {bowlers.length > 0 && (
                 <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Bowling Scorecard</h4>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Player</th>
                                    <th scope="col" className="px-4 py-2 text-right">Overs</th>
                                    <th scope="col" className="px-4 py-2 text-right">Runs</th>
                                    <th scope="col" className="px-4 py-2 text-right">Wickets</th>
                                    <th scope="col" className="px-4 py-2 text-right">Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bowlers.map(p => (
                                  <tr key={p.id} onClick={() => handleSelectPlayer(p.id)} className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors duration-200">
                                    <td className="px-4 py-2 font-medium text-foreground truncate max-w-[150px]">{p.name}</td>
                                    <td className="px-4 py-2 text-right">{formatOvers(p.ballsBowled)}</td>
                                    <td className="px-4 py-2 text-right">{p.runsConceded}</td>
                                    <td className="px-4 py-2 text-right font-bold text-foreground">{p.wicketsTaken}</td>
                                    <td className="px-4 py-2 text-right">{calculateEcon(p.runsConceded, p.ballsBowled)}</td>
                                  </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  const selectedPlayer = teams.flatMap(t => t.players).find(p => p.id === selectedPlayerId);
  const selectedPlayerTeam = teams.find(t => t.players.some(p => p.id === selectedPlayerId));
  const activeTeam = teams[activeTab];
  const activeTeamPerformers = topPerformers[activeTab];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card/70 backdrop-blur-lg border border-border border-t-4 border-t-primary rounded-xl p-6 h-full w-full max-w-4xl relative shadow-2xl flex flex-col animate-pop-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-3xl leading-none z-10">&times;</button>
        
        {selectedPlayer && selectedPlayerTeam ? (
            <PlayerDetailView 
                player={selectedPlayer}
                team={selectedPlayerTeam}
                innings={innings}
                onBack={handleBackToScorecard}
            />
        ) : (
            <>
                <h3 className="text-2xl font-bold mb-4 text-primary">Analytics</h3>
                <div className="flex border-b border-border mb-4">
                {teams.map((team, index) => (
                    <button
                    key={team.name}
                    className={`py-2 px-4 font-medium transition-colors ${activeTab === index ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab(index)}
                    >
                    {team.name}
                    </button>
                ))}
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                {activeTeam && renderTeamAnalytics(activeTeam, activeTeamPerformers)}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;