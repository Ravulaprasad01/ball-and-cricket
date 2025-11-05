import React, { useReducer, useState, useEffect } from 'react';
import { GameStatus, GameState, MatchSettings, Player, Team, Innings, Ball } from './types';
import { BALLS_PER_OVER } from './constants';
import { generateCommentary } from './utils/commentary';
import SetupScreen from './components/SetupScreen';
import ScoringScreen from './components/ScoringScreen';
import TossScreen from './components/TossScreen';
import ScoreHistory from './components/ScoreHistory';
import PlayerStats from './components/PlayerStats';
import MatchSummary from './components/MatchSummary';
import LoadingScreen from './components/LoadingScreen';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { StatsIcon } from './components/icons/StatsIcon';
import { Logo } from './components/icons/Logo';
import { SoundOnIcon } from './components/icons/SoundOnIcon';
import { SoundOffIcon } from './components/icons/SoundOffIcon';
import { ThemeIcon } from './components/icons/ThemeIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';

type Theme = 'light' | 'dark' | 'sunset';

const initialInnings = (battingTeam: string, bowlingTeam: string): Innings => ({
  score: 0,
  wickets: 0,
  overs: 0.0,
  ballsInOver: 0,
  timeline: [],
  battingTeam,
  bowlingTeam,
});

const initialState: GameState = {
  status: GameStatus.SETUP,
  settings: null,
  teams: [],
  currentInnings: 1,
  innings: [initialInnings('', ''), null],
  battingTeamIndex: 0,
  bowlingTeamIndex: 1,
  strikerId: 0,
  nonStrikerId: 1,
  currentBowlerId: null,
  isFreeHit: false,
  target: null,
  winner: null,
  winMargin: null,
  tossWinner: null,
  choseTo: null,
  lastEvent: 'none',
  commentary: null,
};

function gameReducer(state: GameState, action: any): GameState {
  switch (action.type) {
    case 'START_MATCH': {
      const settings: MatchSettings = action.payload;
      const createPlayers = (count: number, offset = 0, names: string[]): Player[] =>
        Array.from({ length: count }, (_, i) => ({
          id: i + offset,
          name: names[i] || `Player ${i + 1}`,
          runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, isBatting: false,
          wicketsTaken: 0, runsConceded: 0, ballsBowled: 0,
        }));
      
      const teamOnePlayers = createPlayers(settings.playersPerTeam, 0, settings.teamOnePlayers);
      const teamTwoPlayers = createPlayers(settings.playersPerTeam, settings.playersPerTeam, settings.teamTwoPlayers);

      const teams: Team[] = [
        { name: settings.teamOneName, players: teamOnePlayers },
        { name: settings.teamTwoName, players: teamTwoPlayers }
      ];

      return {
        ...initialState,
        status: GameStatus.TOSS,
        settings,
        teams,
      };
    }
      
    case 'START_INNINGS_AFTER_TOSS': {
        const { tossWinner, choseTo } = action.payload;
        const { settings, teams } = state;
        if(!settings) return state;

        const tossWinnerIsTeamOne = tossWinner === settings.teamOneName;
        const winnerChoseToBat = choseTo === 'Bat';

        const teamOneIsBatting = (tossWinnerIsTeamOne && winnerChoseToBat) || (!tossWinnerIsTeamOne && !winnerChoseToBat);

        const battingTeamIndex = teamOneIsBatting ? 0 : 1;
        const bowlingTeamIndex = teamOneIsBatting ? 1 : 0;
        
        const newTeams = JSON.parse(JSON.stringify(teams));
        const battingTeam = newTeams[battingTeamIndex];
        battingTeam.players[0].isBatting = true;
        battingTeam.players[1].isBatting = true;

        const commentary = `Welcome to the match between ${settings.teamOneName} and ${settings.teamTwoName}. ${tossWinner} won the toss and chose to ${choseTo}. Let's get started!`;

        return {
            ...state,
            teams: newTeams,
            status: GameStatus.IN_PROGRESS,
            battingTeamIndex,
            bowlingTeamIndex,
            innings: [initialInnings(teams[battingTeamIndex].name, teams[bowlingTeamIndex].name), null],
            strikerId: battingTeam.players[0].id,
            nonStrikerId: battingTeam.players[1].id,
            tossWinner,
            choseTo,
            commentary,
        };
    }
    
    case 'SET_BOWLER': {
        const bowler = state.teams[state.bowlingTeamIndex].players.find(p => p.id === action.payload.bowlerId);
        return { 
            ...state, 
            currentBowlerId: action.payload.bowlerId,
            commentary: `The new bowler is ${bowler?.name}.`,
        };
    }

    case 'CLEAR_LAST_EVENT': {
        return { ...state, lastEvent: 'none' };
    }

    case 'CLEAR_COMMENTARY': {
        return { ...state, commentary: null };
    }

    case 'ADD_RUNS':
    case 'ADD_EXTRA':
    case 'ADD_WICKET': {
      const { settings, status, currentInnings, currentBowlerId, teams, battingTeamIndex, bowlingTeamIndex, strikerId, nonStrikerId, isFreeHit, target } = state;

      // --- Guard clauses for invalid states ---
      if (status !== GameStatus.IN_PROGRESS || currentBowlerId === null || !settings) {
        return state;
      }
      const inningsData = state.innings[currentInnings - 1];
      if (!inningsData || inningsData.wickets >= settings.playersPerTeam - 1) {
        return state; // Innings already over
      }

      // --- Create deep copies to ensure immutability ---
      const newTeams: Team[] = JSON.parse(JSON.stringify(teams));
      const newInnings: [Innings, Innings | null] = JSON.parse(JSON.stringify(state.innings));
      const currentInningsUpdate = newInnings[currentInnings - 1]!;

      // --- Define the delivery event ---
      const delivery = {
        runs: action.type === 'ADD_WICKET' ? 0 : action.payload.runs || 0,
        isWicket: action.type === 'ADD_WICKET',
        isWide: action.type === 'ADD_EXTRA' && action.payload.type === 'wd',
        isNoBall: action.type === 'ADD_EXTRA' && action.payload.type === 'nb',
        extraRuns: action.type === 'ADD_EXTRA' ? 1 + (action.payload.runs || 0) : 0,
      };
      const isLegalDelivery = !delivery.isWide && !delivery.isNoBall;

      // --- Initialize next state variables ---
      let nextStrikerId = strikerId;
      let nextNonStrikerId = nonStrikerId;
      let nextStatus: GameStatus = status;
      let nextWinner = state.winner;
      let nextWinMargin = state.winMargin;
      let nextTarget = target;
      let nextIsFreeHit = isFreeHit;
      let nextLastEvent: GameState['lastEvent'] = 'none';
      let nextCommentary: string | null = null;

      // --- Update teams and player stats ---
      const battingTeam = newTeams[battingTeamIndex];
      const bowlingTeam = newTeams[bowlingTeamIndex];
      const striker = battingTeam.players.find(p => p.id === strikerId)!;
      const bowler = bowlingTeam.players.find(p => p.id === currentBowlerId)!;

      // 1. Update scores and basic stats
      const runsBefore = striker.runs;
      currentInningsUpdate.score += delivery.runs + delivery.extraRuns;
      bowler.runsConceded += delivery.runs + delivery.extraRuns;
      if(isLegalDelivery) bowler.ballsBowled++;
      
      striker.runs += delivery.runs;
      if (isLegalDelivery) striker.balls++;
      if (delivery.runs === 4) { striker.fours++; }
      if (delivery.runs === 6) { striker.sixes++; }

      // 2. Handle wicket
      if (delivery.isWicket) {
        if (!isFreeHit) {
            currentInningsUpdate.wickets++;
            bowler.wicketsTaken++;
            striker.isOut = true;
            striker.isBatting = false;

            const nextBatsman = battingTeam.players.find(p => !p.isOut && !p.isBatting);
            if (nextBatsman) {
                nextBatsman.isBatting = true;
                nextStrikerId = nextBatsman.id;
            }
        }
      }

      // Determine the primary event for UI feedback with priority
      if (delivery.isWicket && !isFreeHit) {
        nextLastEvent = 'wicket';
      } else if (delivery.runs === 6) {
        nextLastEvent = 'six';
      } else if (delivery.runs === 4) {
        nextLastEvent = 'four';
      } else if (delivery.isNoBall) {
        nextLastEvent = 'noball';
      } else if (delivery.isWide) {
        nextLastEvent = 'wide';
      }
      
      // 3. Update timeline
      const ballForTimeline: Ball = { 
          ...delivery, 
          ballNumber: currentInningsUpdate.timeline.length + 1, 
          overNumber: Math.floor(currentInningsUpdate.overs) + 1,
          shotDirection: action.payload?.shotDirection,
          batsmanId: strikerId,
          bowlerId: currentBowlerId,
      };
      currentInningsUpdate.timeline.push(ballForTimeline);

      // 4. Update over progression and free hit status
      let isOverFinished = false;
      if (isLegalDelivery) {
        currentInningsUpdate.ballsInOver++;
        nextIsFreeHit = false; // Consume free hit on a legal ball
        if (currentInningsUpdate.ballsInOver === BALLS_PER_OVER) {
          isOverFinished = true;
          currentInningsUpdate.overs = Math.floor(currentInningsUpdate.overs) + 1;
          currentInningsUpdate.ballsInOver = 0;
        } else {
          currentInningsUpdate.overs = Math.floor(currentInningsUpdate.overs) + currentInningsUpdate.ballsInOver / 10;
        }
      }
      
      if(delivery.isNoBall) {
        nextIsFreeHit = true;
      }
      
      // 5. Handle strike rotation (in correct order)
      if (delivery.runs % 2 !== 0) { // Rotation from runs
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }
      if (isOverFinished) { // End of over rotation
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }
      
      // --- Generate Commentary ---
      const tempNextState = { ...state, teams: newTeams, innings: newInnings, strikerId: nextStrikerId, nonStrikerId: nextNonStrikerId };
      nextCommentary = generateCommentary(tempNextState, ballForTimeline, nextLastEvent, runsBefore);

      // 6. Check for end of innings / end of match
      const allOut = currentInningsUpdate.wickets >= settings.playersPerTeam - 1;
      const oversFinished = settings.overs > 0 && Math.floor(currentInningsUpdate.overs) >= settings.overs;

      if (currentInnings === 1 && (allOut || oversFinished)) {
          nextStatus = GameStatus.INNINGS_BREAK;
          nextTarget = currentInningsUpdate.score + 1;
          nextCommentary = `That's the end of the first innings. ${battingTeam.name} are all out for ${currentInningsUpdate.score}. ${bowlingTeam.name} need ${nextTarget} to win.`;
      } else if (currentInnings === 2) {
          const targetReached = nextTarget && currentInningsUpdate.score >= nextTarget;
          if (targetReached) {
              nextStatus = GameStatus.FINISHED;
              nextWinner = newTeams[battingTeamIndex].name;
              nextWinMargin = `by ${settings.playersPerTeam - 1 - currentInningsUpdate.wickets} wickets`;
              nextCommentary = `And that's the match! ${nextWinner} have won the game ${nextWinMargin}!`;
          } else if (allOut || oversFinished) {
              nextStatus = GameStatus.FINISHED;
              if (nextTarget && currentInningsUpdate.score === nextTarget - 1) {
                  nextWinner = "Match Tied";
                  nextWinMargin = "";
                  nextCommentary = `Incredible scenes! The match is tied!`;
              } else {
                  nextWinner = newTeams[bowlingTeamIndex].name;
                  nextWinMargin = `by ${nextTarget! - currentInningsUpdate.score} runs`;
                  nextCommentary = `And that's the match! ${nextWinner} have won the game ${nextWinMargin}!`;
              }
          }
      }
      
      // --- Return the new state object ---
      return {
        ...state,
        status: nextStatus,
        teams: newTeams,
        innings: newInnings,
        strikerId: nextStrikerId,
        nonStrikerId: nextNonStrikerId,
        isFreeHit: nextIsFreeHit,
        target: nextTarget,
        winner: nextWinner,
        winMargin: nextWinMargin,
        lastEvent: nextLastEvent,
        commentary: nextCommentary,
      };
    }
    
    case 'START_SECOND_INNINGS': {
      const newBattingTeamIndex = state.bowlingTeamIndex;
      const newBowlingTeamIndex = state.battingTeamIndex;
      
      const newTeams = JSON.parse(JSON.stringify(state.teams));
      const secondInningsBattingTeam = newTeams[newBattingTeamIndex];
      secondInningsBattingTeam.players[0].isBatting = true;
      secondInningsBattingTeam.players[1].isBatting = true;
      
      return {
        ...state,
        teams: newTeams,
        status: GameStatus.IN_PROGRESS,
        currentInnings: 2,
        innings: [state.innings[0], initialInnings(secondInningsBattingTeam.name, state.teams[newBowlingTeamIndex].name)],
        battingTeamIndex: newBattingTeamIndex,
        bowlingTeamIndex: newBowlingTeamIndex,
        strikerId: secondInningsBattingTeam.players[0].id,
        nonStrikerId: secondInningsBattingTeam.players[1].id,
        currentBowlerId: null,
        isFreeHit: false,
        commentary: `Welcome back for the second innings. ${secondInningsBattingTeam.name} are ready to chase down the target of ${state.target}.`,
      };
    }

    case 'NEW_GAME':
      return initialState;

    default:
      return state;
  }
}

const UNDOABLE_ACTIONS = ['ADD_RUNS', 'ADD_EXTRA', 'ADD_WICKET'];
const MAX_HISTORY_LENGTH = 20;

interface HistoryState {
  past: GameState[];
  present: GameState;
  future: GameState[];
}

function undoableGameReducer(state: HistoryState, action: any): HistoryState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return state;
      const previousState = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previousState,
        future: [present, ...future],
      };

    case 'REDO':
      if (future.length === 0) return state;
      const nextState = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: nextState,
        future: newFuture,
      };
    
    case 'NEW_GAME':
      const newInitialState = gameReducer(present, action);
      return {
          past: [],
          present: newInitialState,
          future: [],
      };

    default:
      const newPresent = gameReducer(present, action);

      if (present === newPresent) {
        return state;
      }
      
      if (UNDOABLE_ACTIONS.includes(action.type)) {
        const newPastWithCurrent = [...past, present];
        const cappedPast = newPastWithCurrent.length > MAX_HISTORY_LENGTH 
            ? newPastWithCurrent.slice(newPastWithCurrent.length - MAX_HISTORY_LENGTH) 
            : newPastWithCurrent;
        
        return {
          past: cappedPast,
          present: newPresent,
          future: [],
        };
      }
      
      return {
        ...state,
        present: newPresent,
      };
  }
}

function App() {
  const [historyState, dispatch] = useReducer(undoableGameReducer, {
    past: [],
    present: initialState,
    future: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const state = historyState.present;
  
  useEffect(() => {
    // Handle initial theme setup from localStorage
    const savedTheme = localStorage.getItem('stumped-theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.className = `theme-${initialTheme}`;

    // Pre-load voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('stumped-theme', newTheme);
    document.documentElement.className = `theme-${newTheme}`;
    setShowThemeMenu(false);
  };
  
  useEffect(() => {
    if (state.commentary && !isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(state.commentary);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      
      // Prioritize a male voice from GB or AU for a more authentic cricket feel.
      let selectedVoice = voices.find(voice => 
        (voice.lang.includes('en-GB') || voice.lang.includes('en-AU')) && 
        (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Daniel') || voice.name.includes('Russell'))
      );

      // Fallback: any male English voice.
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en-') && 
          (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Google US English'))
        );
      }
      
      // Fallback: original logic if no specific male voice found
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('en-GB') || voice.lang.includes('en-AU'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
      
      dispatch({ type: 'CLEAR_COMMENTARY' });
    }
  }, [state.commentary, isMuted]);

  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onAnimationComplete={handleAnimationComplete} />;
  }

  const renderContent = () => {
    switch (state.status) {
        case GameStatus.SETUP:
            return <SetupScreen onStartMatch={(settings) => dispatch({ type: 'START_MATCH', payload: settings })} />;
        case GameStatus.TOSS:
            return <TossScreen settings={state.settings!} dispatch={dispatch} />;
        case GameStatus.IN_PROGRESS:
        case GameStatus.INNINGS_BREAK:
        case GameStatus.FINISHED:
            return (
              <ScoringScreen 
                state={state} 
                dispatch={dispatch} 
                canUndo={historyState.past.length > 0} 
                canRedo={historyState.future.length > 0} 
              />
            );
        default:
            return null;
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen font-sans app-background">
      <header className="bg-card/70 backdrop-blur-sm sticky top-0 z-20 p-4 shadow-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
              <Logo className="w-8 h-8 text-primary"/>
              <h1 className="text-xl md:text-2xl font-bold">Stumped!</h1>
          </div>
          {state.status !== GameStatus.SETUP && state.status !== GameStatus.TOSS && (
            <div className="flex items-center space-x-2">
                <button onClick={() => setIsMuted(m => !m)} className="flex items-center justify-center w-10 h-10 bg-muted hover:bg-accent rounded-lg transition-colors" aria-label={isMuted ? 'Unmute commentary' : 'Mute commentary'}>
                    {isMuted ? <SoundOffIcon className="w-5 h-5"/> : <SoundOnIcon className="w-5 h-5"/>}
                </button>
                 <div className="relative">
                    <button onClick={() => setShowThemeMenu(s => !s)} className="flex items-center justify-center w-10 h-10 bg-muted hover:bg-accent rounded-lg transition-colors" aria-label="Change theme">
                        <ThemeIcon className="w-5 h-5"/>
                    </button>
                    {showThemeMenu && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-popover border border-border rounded-md shadow-lg z-10 animate-fade-in">
                           <button onClick={() => handleSetTheme('light')} className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent">
                                <SunIcon className="w-4 h-4" />
                                <span>Light</span>
                           </button>
                           <button onClick={() => handleSetTheme('dark')} className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent">
                                <MoonIcon className="w-4 h-4" />
                                <span>Dark</span>
                           </button>
                           <button onClick={() => handleSetTheme('sunset')} className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent">
                                <ThemeIcon className="w-4 h-4" />
                                <span>Sunset</span>
                           </button>
                        </div>
                    )}
                </div>
                <button onClick={() => setShowStats(true)} className="flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-accent rounded-lg transition-colors">
                    <StatsIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline font-semibold">Scorecard</span>
                </button>
                <button onClick={() => setShowHistory(true)} className="flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-accent rounded-lg transition-colors">
                    <HistoryIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline font-semibold">History</span>
                </button>
            </div>
          )}
        </div>
      </header>
      <main>
        {renderContent()}
        {state.status === GameStatus.FINISHED && <MatchSummary state={state} dispatch={dispatch} />}
        {state.innings[0] && <ScoreHistory innings={state.innings} isOpen={showHistory} onClose={() => setShowHistory(false)}/>}
        {state.teams.length > 0 && <PlayerStats teams={state.teams} innings={state.innings} isOpen={showStats} onClose={() => setShowStats(false)} />}
      </main>
    </div>
  );
}

export default App;