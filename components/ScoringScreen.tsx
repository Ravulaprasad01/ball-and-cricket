import React, { useState, useEffect } from 'react';
import { GameState, Player, Team, GameStatus, ShotDirection } from '../types';
import { CricketBatIcon } from './icons/CricketBatIcon';
import { CricketBallIcon } from './icons/CricketBallIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import ShotPlacementModal from './ShotPlacementModal';

interface ScoringScreenProps {
  state: GameState;
  dispatch: React.Dispatch<any>;
  canUndo: boolean;
  canRedo: boolean;
}

type ExtraType = 'wd' | 'nb';

const BowlerSelectionModal: React.FC<{
    bowlingTeam: Team;
    onSelect: (id: number) => void;
    lastBowlerId: number | null;
}> = ({ bowlingTeam, onSelect, lastBowlerId }) => {
    
    const formatOvers = (balls: number) => {
        const overs = Math.floor(balls / 6);
        const remainingBalls = balls % 6;
        return `${overs}.${remainingBalls}`;
    };
    
    const lastBowler = bowlingTeam.players.find(p => p.id === lastBowlerId);

    return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-card/70 backdrop-blur-lg border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full animate-pop-in">
            <h3 className="text-xl font-bold text-primary mb-4">Select Bowler for Next Over</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {bowlingTeam.players
                    .filter(p => p.id !== lastBowlerId)
                    .map(bowler => (
                    <button
                        key={bowler.id}
                        onClick={() => onSelect(bowler.id)}
                        className="w-full text-left p-3 bg-muted hover:bg-accent rounded-lg transition-colors border border-border"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{bowler.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatOvers(bowler.ballsBowled)} O, {bowler.runsConceded} R, {bowler.wicketsTaken} W
                            </span>
                        </div>
                    </button>
                ))}
            </div>
             {lastBowler && (
                 <div className="w-full text-left p-3 bg-muted/50 rounded-lg mt-2 opacity-60 cursor-not-allowed border border-border/50">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{lastBowler.name}</span>
                        <span className="text-xs text-muted-foreground">Cannot bowl consecutive over</span>
                    </div>
                </div>
            )}
        </div>
    </div>
)};


const ScoringScreen: React.FC<ScoringScreenProps> = ({ state, dispatch, canUndo, canRedo }) => {
  const [extraRunFor, setExtraRunFor] = useState<ExtraType | null>(null);
  const [eventMessage, setEventMessage] = useState<{ text: string } | null>(null);
  const [showBowlerSelection, setShowBowlerSelection] = useState(false);
  const [pendingScore, setPendingScore] = useState<{runs: number} | null>(null);

  const {
    settings,
    teams,
    currentInnings,
    innings,
    battingTeamIndex,
    bowlingTeamIndex,
    strikerId,
    nonStrikerId,
    currentBowlerId,
    isFreeHit,
    target,
    status,
    winner,
    winMargin,
    lastEvent,
  } = state;
  
  const currentInningsData = innings[currentInnings - 1];

  useEffect(() => {
    if (!lastEvent || lastEvent === 'none') return;
    
    const messages = {
        four: { text: 'FOUR!'},
        six: { text: 'SIX!'},
        wicket: { text: 'WICKET!'},
        wide: { text: 'WIDE'},
        noball: { text: 'NO BALL'},
    };
    
    if (messages[lastEvent]) {
      setEventMessage(messages[lastEvent]);
    }
    
    const timer = setTimeout(() => {
        setEventMessage(null);
        dispatch({ type: 'CLEAR_LAST_EVENT' });
    }, 2000);
    
    return () => clearTimeout(timer);

  }, [lastEvent, dispatch]);

  useEffect(() => {
    const isStartOfNewOver = status === GameStatus.IN_PROGRESS && currentInningsData && currentInningsData.ballsInOver === 0 && currentInningsData.timeline.length > 0;
    
    if (isStartOfNewOver) {
        setShowBowlerSelection(true);
    }
  }, [currentInningsData?.overs, status, currentInningsData]);
  
  useEffect(() => {
    if(status === GameStatus.IN_PROGRESS && currentInningsData && currentInningsData.timeline.length === 0){
        setShowBowlerSelection(true);
    }
  }, [status, currentInnings, currentInningsData]);


  if (!settings || !currentInningsData) return null;

  const battingTeam = teams[battingTeamIndex];
  const bowlingTeam = teams[bowlingTeamIndex];
  const striker = battingTeam.players.find(p => p.id === strikerId);
  const nonStriker = battingTeam.players.find(p => p.id === nonStrikerId);
  const bowler = bowlingTeam.players.find(p => p.id === currentBowlerId);
  const overs = settings.overs === 0 ? "Test" : settings.overs;

  const handleSelectBowler = (bowlerId: number) => {
    dispatch({ type: 'SET_BOWLER', payload: { bowlerId } });
    setShowBowlerSelection(false);
  }
  
  const handleScore = (runs: number, shotDirection?: ShotDirection) => {
    if (extraRunFor) {
      dispatch({ type: 'ADD_EXTRA', payload: { type: extraRunFor, runs } });
      setExtraRunFor(null);
    } else {
      if (runs > 0) {
          if (shotDirection) {
              dispatch({ type: 'ADD_RUNS', payload: { runs, shotDirection } });
              setPendingScore(null);
          } else {
              setPendingScore({runs});
          }
      } else {
           dispatch({ type: 'ADD_RUNS', payload: { runs } });
      }
    }
  };

  const handleWicket = () => dispatch({ type: 'ADD_WICKET' });
  
  const renderScoreboard = () => {
    const glowEffect = {
        four: 'animate-boundary-4-glow',
        six: 'animate-boundary-6-glow',
        wicket: 'animate-wicket-glow',
        none: '',
        wide: '',
        noball: ''
    }[lastEvent || 'none'];
    
    const strikerSR = striker && striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(2) : '0.00';

    return (
        <div className={`bg-card/70 backdrop-blur-md border border-border border-t-4 border-t-primary p-4 rounded-xl shadow-lg relative overflow-hidden transition-shadow duration-500 ${glowEffect}`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full"></div>
            <div className="flex justify-between items-center">
                <div>
                <p className="text-lg font-bold text-foreground">{battingTeam.name}</p>
                <p className="text-6xl font-black tracking-tighter animate-subtle-pulse">
                    <span key={`score-${currentInningsData.score}`}>{currentInningsData.score}</span>
                    <span key={`wickets-${currentInningsData.wickets}`} className="text-5xl text-muted-foreground">/{currentInningsData.wickets}</span>
                </p>
                <p className="text-lg text-muted-foreground">
                    ({currentInningsData.overs.toFixed(1)} / {overs} Ov)
                </p>
                </div>
                <div className="text-right z-10">
                <p className="text-2xl font-semibold">
                    CRR: {currentInningsData.overs > 0 ? (currentInningsData.score / currentInningsData.overs).toFixed(2) : '0.00'}
                </p>
                {target && <p className="text-sm text-secondary font-semibold">Target: {target}</p>}
                <p className="text-sm text-muted-foreground font-semibold">S/R: {strikerSR}</p>
                </div>
            </div>
        </div>
    );
  };
  
  const renderPlayers = () => (
    <div className="bg-card/70 backdrop-blur-md border border-border border-t-4 border-t-primary/50 p-4 rounded-xl shadow-lg text-sm">
        <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
            <div className="flex items-center">
                <CricketBatIcon className="w-5 h-5 mr-3 text-primary" />
                <span className="font-bold text-base w-32 truncate">{striker?.name}*</span>
            </div>
            <div className="text-right">
                <span key={`striker-runs-${striker?.runs}`} className="font-bold text-xl inline-block animate-subtle-pop">{striker?.runs}</span>
                <span className="text-muted-foreground ml-2">({striker?.balls})</span>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                 <CricketBatIcon className="w-5 h-5 mr-3 text-muted-foreground/50" />
                <span className="w-32 truncate text-muted-foreground">{nonStriker?.name}</span>
            </div>
            <div className="text-right">
                <span key={`nonstriker-runs-${nonStriker?.runs}`} className="font-bold text-xl inline-block animate-subtle-pop">{nonStriker?.runs}</span>
                <span className="text-muted-foreground ml-2">({nonStriker?.balls})</span>
            </div>
        </div>
        <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
            <div className="flex items-center">
                <CricketBallIcon className="w-5 h-5 mr-3 text-ball-red" />
                <span className="w-32 truncate text-muted-foreground">{bowler?.name ?? 'Select Bowler'}</span>
            </div>
             <div className="text-right">
                <span className="font-bold text-lg">{bowler?.wicketsTaken}/{bowler?.runsConceded}</span>
            </div>
        </div>
    </div>
  );

  const renderOverTimeline = () => {
    const { overs, ballsInOver, timeline } = currentInningsData;
    let overNumberToShow;

    if (ballsInOver === 0 && overs > 0) {
      overNumberToShow = Math.floor(overs);
    } else {
      overNumberToShow = Math.floor(overs) + 1;
    }
    const currentOverBalls = timeline.filter(b => b.overNumber === overNumberToShow);
    
    return (
      <div className="bg-card/70 backdrop-blur-md border border-border border-t-4 border-t-primary/50 p-4 rounded-xl shadow-lg">
        <p className="text-sm text-muted-foreground mb-2">This Over</p>
        <div className="flex flex-wrap gap-2">
          {currentOverBalls.map((ball, i) => {
            let text = `${ball.runs}`;
            let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ";
             if (ball.isWicket) { text = 'W'; classes += 'bg-red-600 text-white'; }
             else if (ball.runs === 4) { classes += 'bg-blue-500 text-white'; }
             else if (ball.runs === 6) { classes += 'bg-purple-500 text-white'; }
             else if (ball.isWide || ball.isNoBall) { text = `${ball.isWide ? 'Wd' : 'Nb'}${ball.extraRuns > 1 ? `+${ball.extraRuns-1}` : ''}`; classes += 'bg-yellow-500 text-gray-900'; }
             else if (ball.runs === 0 && !ball.isWide && !ball.isNoBall) { text = '•'; classes += 'bg-muted text-muted-foreground'; }
             else { classes += 'bg-gray-500 text-white'; }
            return <div key={ball.ballNumber} className={`${classes} animate-ball-pop`} style={{ animationDelay: `${i * 75}ms`, opacity: 0 }}>{text}</div>
          })}
        </div>
      </div>
    );
  };
  
  const renderControls = () => {
    const runButtons = [1, 2, 3, 4, 6];
    const buttonBaseClasses = "font-bold py-3 px-4 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:saturate-50";

    if (extraRunFor) {
      return (
        <div className="bg-card p-4 rounded-xl shadow-lg mt-4 flex-grow flex flex-col animate-fade-in border border-border border-t-4 border-t-secondary">
           <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg text-secondary">Runs for {extraRunFor.toUpperCase()}?</p>
              <button onClick={() => setExtraRunFor(null)} className="text-sm text-red-400 hover:text-red-300">Cancel</button>
           </div>
           <div className="grid grid-cols-3 gap-3 flex-grow">
              {[0, 1, 2, 3, 4, 6].map(run => (
                <button key={run} onClick={() => handleScore(run)} className={`${buttonBaseClasses} bg-gradient-to-br from-muted via-card to-muted hover:from-secondary/90 hover:to-secondary text-foreground hover:text-secondary-foreground border-border`}>
                  +{run}
                </button>
              ))}
           </div>
        </div>
      )
    }

    return (
      <div className="bg-card p-4 rounded-xl shadow-lg mt-4 flex-grow flex flex-col border border-border border-t-4 border-t-primary">
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-lg text-primary">Record Delivery</p>
          {isFreeHit && (
            <p className="px-3 py-1 bg-yellow-500 text-gray-900 font-bold rounded-full text-sm animate-pulse">
              FREE HIT
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 flex-grow">
          <button onClick={() => handleScore(0)} className={`${buttonBaseClasses} bg-gradient-to-br from-muted via-card to-muted hover:from-primary/80 hover:to-primary/90 text-foreground hover:text-primary-foreground border-border`} disabled={!bowler}>
            Dot
          </button>
          {runButtons.map(run => (
            <button key={run} onClick={() => handleScore(run)} className={`${buttonBaseClasses} bg-gradient-to-br from-muted via-card to-muted hover:from-primary/80 hover:to-primary/90 text-foreground hover:text-primary-foreground border-border`} disabled={!bowler}>
              {run}
            </button>
          ))}
          <button onClick={() => setExtraRunFor('wd')} className={`${buttonBaseClasses} text-lg bg-gradient-to-br from-yellow-600/80 to-yellow-700/80 hover:from-yellow-500 hover:to-yellow-600 text-white border-yellow-700`} disabled={!bowler}>WD</button>
          <button onClick={() => setExtraRunFor('nb')} className={`${buttonBaseClasses} text-lg bg-gradient-to-br from-yellow-600/80 to-yellow-700/80 hover:from-yellow-500 hover:to-yellow-600 text-white border-yellow-700`} disabled={!bowler}>NB</button>
          <button onClick={handleWicket} className={`${buttonBaseClasses} text-lg bg-gradient-to-br from-red-700/80 to-red-800/80 hover:from-red-600 hover:to-red-700 text-white border-red-800`} disabled={!bowler}>WICKET</button>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-center space-x-4">
            <button 
                onClick={() => dispatch({ type: 'UNDO' })} 
                disabled={!canUndo}
                className="px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                aria-label="Undo last action"
            >
                <UndoIcon className="w-5 h-5" />
                <span>Undo</span>
            </button>
            <button 
                onClick={() => dispatch({ type: 'REDO' })} 
                disabled={!canRedo}
                className="px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                aria-label="Redo last action"
            >
                <span>Redo</span>
                <RedoIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    );
  };
  
  const renderInningsBreak = () => (
     <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-card/80 backdrop-blur-lg border border-border p-8 rounded-xl text-center shadow-2xl max-w-sm w-full animate-pop-in">
        <h2 className="text-3xl font-bold text-primary mb-4">Innings Break</h2>
        <p className="text-lg mb-2">{bowlingTeam.name} need</p>
        <p className="text-5xl font-bold text-secondary my-4">{target}</p>
        <p className="text-lg mb-6">runs to win.</p>
        <button onClick={() => dispatch({type: 'START_SECOND_INNINGS'})} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg mt-4 transition-transform transform hover:scale-105">
          Start 2nd Innings
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-2 md:p-4 max-w-4xl mx-auto font-sans relative">
      {showBowlerSelection && <BowlerSelectionModal bowlingTeam={bowlingTeam} onSelect={handleSelectBowler} lastBowlerId={currentBowlerId} />}
      {pendingScore && <ShotPlacementModal runs={pendingScore.runs} onSelect={(direction) => handleScore(pendingScore.runs, direction)} onCancel={() => setPendingScore(null)} />}
      {eventMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none -top-16">
            <p className={`text-6xl md:text-8xl font-black text-foreground/80 animate-event-burst uppercase tracking-wider`} style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>
                {eventMessage.text}
            </p>
        </div>
      )}
      {(status === GameStatus.INNINGS_BREAK) && renderInningsBreak()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-in-up">
        <div className="space-y-4">
            {renderScoreboard()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPlayers()}
              {renderOverTimeline()}
            </div>
            {renderControls()}
        </div>
        <div className="hidden lg:block">
           
        </div>
      </div>
    </div>
  );
};

export default ScoringScreen;