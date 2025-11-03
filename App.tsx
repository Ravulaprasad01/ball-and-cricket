import React, { useReducer, useState } from 'react';
import { GameStatus, GameState, MatchSettings, Player, Team, Innings, Ball } from './types';
import { BALLS_PER_OVER } from './constants';
import SetupScreen from './components/SetupScreen';
import ScoringScreen from './components/ScoringScreen';
import TossScreen from './components/TossScreen';
import ScoreHistory from './components/ScoreHistory';
import PlayerStats from './components/PlayerStats';
import MatchSummary from './components/MatchSummary';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { StatsIcon } from './components/icons/StatsIcon';
import { CricketBallIcon } from './components/icons/CricketBallIcon';

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
        };
    }
    
    case 'SET_BOWLER': {
        return { ...state, currentBowlerId: action.payload.bowlerId };
    }
    
    case 'CLEAR_LAST_EVENT': {
        return { ...state, lastEvent: 'none' };
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
      // FIX: Explicitly type nextStatus as GameStatus to prevent incorrect type inference within this block.
      // This resolves errors when assigning different GameStatus members later on.
      let nextStatus: GameStatus = status;
      let nextWinner = state.winner;
      let nextWinMargin = state.winMargin;
      let nextTarget = target;
      let nextIsFreeHit = isFreeHit;
      let nextLastEvent: GameState['lastEvent'] = 'none';

      // --- Update teams and player stats ---
      const battingTeam = newTeams[battingTeamIndex];
      const bowlingTeam = newTeams[bowlingTeamIndex];
      const striker = battingTeam.players.find(p => p.id === strikerId)!;
      const bowler = bowlingTeam.players.find(p => p.id === currentBowlerId)!;

      // 1. Update scores and basic stats
      currentInningsUpdate.score += delivery.runs + delivery.extraRuns;
      bowler.runsConceded += delivery.runs + delivery.extraRuns;
      if(isLegalDelivery) bowler.ballsBowled++;
      
      striker.runs += delivery.runs;
      if (isLegalDelivery) striker.balls++;
      if (delivery.runs === 4) { striker.fours++; nextLastEvent = 'four'; }
      if (delivery.runs === 6) { striker.sixes++; nextLastEvent = 'six'; }

      // 2. Handle wicket
      if (delivery.isWicket) {
        nextLastEvent = 'wicket';
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
      
      // 3. Update timeline
      const ballForTimeline: Ball = { ...delivery, ballNumber: currentInningsUpdate.timeline.length + 1, overNumber: Math.floor(currentInningsUpdate.overs) + 1 };
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

      // 6. Check for end of innings / end of match
      const allOut = currentInningsUpdate.wickets >= settings.playersPerTeam - 1;
      const oversFinished = settings.overs > 0 && Math.floor(currentInningsUpdate.overs) >= settings.overs;

      if (currentInnings === 1 && (allOut || oversFinished)) {
          nextStatus = GameStatus.INNINGS_BREAK;
          nextTarget = currentInningsUpdate.score + 1;
      } else if (currentInnings === 2) {
          const targetReached = nextTarget && currentInningsUpdate.score >= nextTarget;
          if (targetReached) {
              nextStatus = GameStatus.FINISHED;
              nextWinner = newTeams[battingTeamIndex].name;
              nextWinMargin = `by ${settings.playersPerTeam - 1 - currentInningsUpdate.wickets} wickets`;
          } else if (allOut || oversFinished) {
              nextStatus = GameStatus.FINISHED;
              if (nextTarget && currentInningsUpdate.score === nextTarget - 1) {
                  nextWinner = "Match Tied";
                  nextWinMargin = "";
              } else {
                  nextWinner = newTeams[bowlingTeamIndex].name;
                  nextWinMargin = `by ${nextTarget! - currentInningsUpdate.score} runs`;
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
      };
    }

    case 'NEW_GAME':
      return initialState;

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const renderContent = () => {
    switch (state.status) {
        case GameStatus.SETUP:
            return <SetupScreen onStartMatch={(settings) => dispatch({ type: 'START_MATCH', payload: settings })} />;
        case GameStatus.TOSS:
            return <TossScreen settings={state.settings!} dispatch={dispatch} />;
        case GameStatus.IN_PROGRESS:
        case GameStatus.INNINGS_BREAK:
        case GameStatus.FINISHED:
            return <ScoringScreen state={state} dispatch={dispatch} />;
        default:
            return null;
    }
  }

  return (
    <div className="bg-night text-stump-white min-h-screen font-sans" style={{backgroundImage: 'radial-gradient(circle at top, rgba(30, 66, 33, 0.5), transparent 40%)'}}>
      <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-20 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
              <CricketBallIcon className="w-8 h-8 text-primary"/>
              <h1 className="text-xl md:text-2xl font-bold">Cricket Scorer</h1>
          </div>
          {state.status !== GameStatus.SETUP && state.status !== GameStatus.TOSS && (
            <div className="flex items-center space-x-2">
                <button onClick={() => setShowStats(true)} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <StatsIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">Stats</span>
                </button>
                <button onClick={() => setShowHistory(true)} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <HistoryIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">History</span>
                </button>
            </div>
          )}
        </div>
      </header>
      <main>
        {renderContent()}
        {state.status === GameStatus.FINISHED && <MatchSummary state={state} dispatch={dispatch} />}
        {state.innings[0] && <ScoreHistory innings={state.innings} isOpen={showHistory} onClose={() => setShowHistory(false)}/>}
        {state.teams.length > 0 && <PlayerStats teams={state.teams} isOpen={showStats} onClose={() => setShowStats(false)} />}
      </main>
    </div>
  );
}

export default App;