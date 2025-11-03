import React, { useState, useEffect } from 'react';
// FIX: Add GameStatus to imports to use it for type-safe comparisons.
import { GameState, Player, Team, GameStatus } from '../types';
import { CricketBatIcon } from './icons/CricketBatIcon';
import { CricketBallIcon } from './icons/CricketBallIcon';

interface ScoringScreenProps {
  state: GameState;
  dispatch: React.Dispatch<any>;
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-surface p-6 rounded-lg shadow-2xl max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold text-primary mb-4">Select Bowler for Next Over</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {bowlingTeam.players
                    .filter(p => p.id !== lastBowlerId)
                    .map(bowler => (
                    <button
                        key={bowler.id}
                        onClick={() => onSelect(bowler.id)}
                        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{bowler.name}</span>
                            <span className="text-xs text-gray-400">
                                {formatOvers(bowler.ballsBowled)} O, {bowler.runsConceded} R, {bowler.wicketsTaken} W
                            </span>
                        </div>
                    </button>
                ))}
            </div>
             {lastBowler && (
                 <div className="w-full text-left p-3 bg-gray-900 rounded-md mt-2 opacity-60 cursor-not-allowed">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{lastBowler.name}</span>
                        <span className="text-xs text-gray-400">Cannot bowl consecutive over</span>
                    </div>
                </div>
            )}
        </div>
    </div>
)};


const ScoringScreen: React.FC<ScoringScreenProps> = ({ state, dispatch }) => {
  const [extraRunFor, setExtraRunFor] = useState<ExtraType | null>(null);
  const [eventMessage, setEventMessage] = useState<{ text: string } | null>(null);
  const [showBowlerSelection, setShowBowlerSelection] = useState(false);

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
    };
    
    setEventMessage(messages[lastEvent]);
    
    const timer = setTimeout(() => {
        setEventMessage(null);
        dispatch({ type: 'CLEAR_LAST_EVENT' });
    }, 1500);
    
    return () => clearTimeout(timer);

  }, [lastEvent, dispatch]);

  useEffect(() => {
    // This effect handles the logic for requiring a new bowler at the start of an over.
    // FIX: Compare game status with GameStatus enum member instead of a string.
    const isStartOfNewOver = status === GameStatus.IN_PROGRESS && currentInningsData && currentInningsData.ballsInOver === 0 && currentInningsData.timeline.length > 0;
    
    if (isStartOfNewOver) {
        setShowBowlerSelection(true);
    }
  }, [currentInningsData?.overs, status, currentInningsData]);
  
  useEffect(() => {
    // This handles the very first over of an innings.
    // FIX: Compare game status with GameStatus enum member instead of a string.
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
  
  const handleScore = (runs: number) => {
    if (extraRunFor) {
      dispatch({ type: 'ADD_EXTRA', payload: { type: extraRunFor, runs } });
      setExtraRunFor(null);
    } else {
      dispatch({ type: 'ADD_RUNS', payload: { runs } });
    }
  };

  const handleWicket = () => dispatch({ type: 'ADD_WICKET' });
  
  const renderScoreboard = () => {
    const glowEffect = {
        four: 'animate-boundary-4-glow',
        six: 'animate-boundary-6-glow',
        wicket: 'animate-wicket-glow',
        none: '',
    }[lastEvent || 'none'];

    return (
        <div className={`bg-surface p-4 rounded-lg shadow-lg relative overflow-hidden ${glowEffect}`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full"></div>
            <div className="flex justify-between items-center">
                <div>
                <p className="text-lg font-bold text-gray-200">{battingTeam.name}</p>
                <p className="text-5xl font-bold tracking-tighter">
                    <span key={`score-${currentInningsData.score}`} className="inline-block animate-pop-in">{currentInningsData.score}</span>
                    <span key={`wickets-${currentInningsData.wickets}`} className="inline-block animate-pop-in text-4xl text-gray-400">/{currentInningsData.wickets}</span>
                </p>
                <p className="text-lg text-gray-300">
                    ({currentInningsData.overs.toFixed(1)} / {overs} Ov)
                </p>
                </div>
                <div className="text-right z-10">
                <p className="text-2xl font-semibold">
                    CRR: {currentInningsData.overs > 0 ? (currentInningsData.score / currentInningsData.overs).toFixed(2) : '0.00'}
                </p>
                {target && <p className="text-sm text-secondary font-semibold">Target: {target}</p>}
                </div>
            </div>
        </div>
    );
  };
  
  const renderPlayers = () => (
    <div className="bg-surface p-4 rounded-lg shadow-lg text-sm">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
            <div className="flex items-center">
                <CricketBatIcon className="w-5 h-5 mr-3 text-primary" />
                <span className="font-bold text-base w-32 truncate">{striker?.name}*</span>
            </div>
            <div className="text-right">
                <span key={`striker-runs-${striker?.runs}`} className="font-bold text-xl inline-block animate-pop-in">{striker?.runs}</span>
                <span className="text-gray-400 ml-2">({striker?.balls})</span>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                 <CricketBatIcon className="w-5 h-5 mr-3 text-gray-600" />
                <span className="w-32 truncate text-gray-300">{nonStriker?.name}</span>
            </div>
            <div className="text-right">
                <span key={`nonstriker-runs-${nonStriker?.runs}`} className="font-bold text-xl inline-block animate-pop-in">{nonStriker?.runs}</span>
                <span className="text-gray-400 ml-2">({nonStriker?.balls})</span>
            </div>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2 flex items-center justify-between">
            <div className="flex items-center">
                <CricketBallIcon className="w-5 h-5 mr-3 text-ball-red" />
                <span className="w-32 truncate text-gray-300">{bowler?.name ?? 'Select Bowler'}</span>
            </div>
             <div className="text-right">
                <span className="font-bold text-lg">{bowler?.wicketsTaken}/{bowler?.runsConceded}</span>
            </div>
        </div>
    </div>
  );

  const renderOverTimeline = () => {
    const ballsInOver = currentInningsData.ballsInOver === 6 ? 6 : currentInningsData.ballsInOver;
    const lastOverBalls = currentInningsData.timeline.slice(-ballsInOver);

    return (
      <div className="bg-surface p-4 rounded-lg shadow-lg">
        <p className="text-sm text-gray-400 mb-2">This Over</p>
        <div className="flex flex-wrap gap-2">
          {lastOverBalls.map((ball, i) => {
            let text = `${ball.runs}`;
            let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ";
             if (ball.isWicket) { text = 'W'; classes += 'bg-red-600 text-white'; }
             else if (ball.runs === 4) { classes += 'bg-blue-500 text-white'; }
             else if (ball.runs === 6) { classes += 'bg-purple-500 text-white'; }
             else if (ball.isWide || ball.isNoBall) { text = `${ball.isWide ? 'Wd' : 'Nb'}${ball.extraRuns > 1 ? `+${ball.extraRuns-1}` : ''}`; classes += 'bg-yellow-500 text-gray-900'; }
             else if (ball.runs === 0 && !ball.isWide && !ball.isNoBall) { text = '•'; classes += 'bg-gray-600 text-gray-300'; }
             else { classes += 'bg-gray-500 text-white'; }
            return <div key={i} className={`${classes} animate-pop-in`}>{text}</div>
          })}
        </div>
      </div>
    );
  };
  
  const renderControls = () => {
    const runButtons = [1, 2, 3, 4, 6];
    
    if (extraRunFor) {
      return (
        <div className="bg-surface p-4 rounded-lg shadow-lg mt-4 flex-grow flex flex-col animate-fade-in">
           <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg text-secondary">Runs for {extraRunFor.toUpperCase()}?</p>
              <button onClick={() => setExtraRunFor(null)} className="text-sm text-red-400 hover:text-red-300">Cancel</button>
           </div>
           <div className="grid grid-cols-3 gap-3 flex-grow">
              {[0, 1, 2, 3, 4, 6].map(run => (
                <button key={run} onClick={() => handleScore(run)} className="bg-gray-700 hover:bg-secondary hover:text-black text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors duration-200">
                  +{run}
                </button>
              ))}
           </div>
        </div>
      )
    }

    return (
      <div className="bg-surface p-4 rounded-lg shadow-lg mt-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-lg text-primary">Record Delivery</p>
          {isFreeHit && (
            <p className="px-3 py-1 bg-yellow-500 text-gray-900 font-bold rounded-full text-sm animate-pulse">
              FREE HIT
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 flex-grow">
          <button onClick={() => handleScore(0)} className="bg-gray-700 hover:bg-primary text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-200" disabled={!bowler}>
            Dot Ball
          </button>
          {runButtons.map(run => (
            <button key={run} onClick={() => handleScore(run)} className="bg-gray-700 hover:bg-primary text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors duration-200" disabled={!bowler}>
              {run}
            </button>
          ))}
          <button onClick={() => setExtraRunFor('wd')} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-200" disabled={!bowler}>WD</button>
          <button onClick={() => setExtraRunFor('nb')} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-200" disabled={!bowler}>NB</button>
          <button onClick={handleWicket} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-200" disabled={!bowler}>WICKET</button>
        </div>
      </div>
    );
  };
  
  const renderInningsBreak = () => (
     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-lg text-center shadow-2xl max-w-sm w-full animate-fade-in">
        <h2 className="text-3xl font-bold text-primary mb-4">Innings Break</h2>
        <p className="text-lg mb-2">{bowlingTeam.name} need</p>
        <p className="text-5xl font-bold text-secondary my-4">{target}</p>
        <p className="text-lg mb-6">runs to win.</p>
        <button onClick={() => dispatch({type: 'START_SECOND_INNINGS'})} className="bg-primary hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg mt-4">
          Start 2nd Innings
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-2 md:p-4 max-w-lg mx-auto font-sans relative">
      {showBowlerSelection && <BowlerSelectionModal bowlingTeam={bowlingTeam} onSelect={handleSelectBowler} lastBowlerId={currentBowlerId} />}
      {eventMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none -top-16">
            <p className={`text-6xl md:text-8xl font-black text-white/80 animate-event-burst uppercase tracking-wider`} style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>
                {eventMessage.text}
            </p>
        </div>
      )}
      {/* FIX: Compare game status with GameStatus enum member instead of a string. */}
      {(status === GameStatus.INNINGS_BREAK) && renderInningsBreak()}
      <div className="space-y-4 animate-fade-in">
          {renderScoreboard()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPlayers()}
            {renderOverTimeline()}
          </div>
          {renderControls()}
      </div>
    </div>
  );
};

export default ScoringScreen;