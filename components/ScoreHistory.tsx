import React from 'react';
import { Innings, Ball } from '../types';

interface ScoreHistoryProps {
  innings: [Innings, Innings | null];
  isOpen: boolean;
  onClose: () => void;
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ innings, isOpen, onClose }) => {
  const [activeInnings, setActiveInnings] = React.useState<1 | 2>(1);

  if (!isOpen) return null;

  const calculateOverSummaries = (timeline: Ball[]) => {
    const summaries: { over: number; runs: number; balls: Ball[] }[] = [];
    if (!timeline.length) return summaries;

    let overMap: { [key: number]: { runs: number, balls: Ball[] } } = {};

    timeline.forEach(ball => {
      if (!overMap[ball.overNumber]) {
        overMap[ball.overNumber] = { runs: 0, balls: [] };
      }
      overMap[ball.overNumber].runs += ball.runs + ball.extraRuns;
      overMap[ball.overNumber].balls.push(ball);
    });
    
    for (const overNum in overMap) {
      summaries.push({ over: parseInt(overNum), runs: overMap[overNum].runs, balls: overMap[overNum].balls });
    }

    return summaries.sort((a,b) => b.over - a.over);
  };

  const renderBall = (ball: Ball, index: number) => {
    let text = `${ball.runs}`;
    let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ";

    if (ball.isWicket) {
      text = 'W';
      classes += 'bg-red-600 text-white';
    } else if (ball.runs === 4) {
      classes += 'bg-blue-500 text-white';
    } else if (ball.runs === 6) {
      classes += 'bg-purple-500 text-white';
    } else if (ball.isWide || ball.isNoBall) {
        text = `${ball.isWide ? 'Wd' : 'Nb'}${ball.extraRuns > 1 ? `+${ball.extraRuns-1}` : ''}`
        classes += 'bg-yellow-500 text-gray-900';
    } else if (ball.runs === 0 && !ball.isWide && !ball.isNoBall) {
        text = '•';
        classes += 'bg-gray-600 text-gray-300';
    } else {
        classes += 'bg-gray-500 text-white';
    }
    return <div key={index} className={classes} title={`Ball: ${ball.ballNumber}, Runs: ${ball.runs}, Extras: ${ball.extraRuns}`}>{text}</div>;
  };

  const renderInningsHistory = (inningsData: Innings | null) => {
    if (!inningsData) {
      return <p className="text-gray-400 text-center p-4">Innings has not started yet.</p>;
    }
    const summaries = calculateOverSummaries(inningsData.timeline);
    
    return (
        <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">{inningsData.battingTeam} - {inningsData.score}/{inningsData.wickets} <span className="text-base text-gray-400">({inningsData.overs.toFixed(1)} Ov)</span></h4>
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto p-2 -mr-2">
            {summaries.map(({ over, runs, balls }, index) => (
                <div key={over} className="p-3 bg-gray-900 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400 w-20">
                            <p>Over {over}</p>
                            <p className="font-bold text-lg text-white">{runs} runs</p>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {balls.map(renderBall)}
                        </div>
                    </div>
                </div>
            ))}
             </div>
        </div>
    )
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg p-6 h-full w-full max-w-2xl relative shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-primary">Score History</h3>
            <div className="flex border-b border-gray-700 mb-4">
                <button
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeInnings === 1 ? 'border-b-2 border-primary text-white' : 'text-gray-400'}`}
                onClick={() => setActiveInnings(1)}
                >
                Innings 1
                </button>
                {innings[1] && (
                <button
                    className={`py-2 px-4 text-sm font-medium transition-colors ${activeInnings === 2 ? 'border-b-2 border-primary text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveInnings(2)}
                >
                    Innings 2
                </button>
                )}
            </div>
            <div>
                {activeInnings === 1 ? renderInningsHistory(innings[0]) : renderInningsHistory(innings[1])}
            </div>
        </div>
    </div>
  );
};

export default ScoreHistory;