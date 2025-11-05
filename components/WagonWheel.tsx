import React from 'react';
import { Player, Innings, ShotDirection, Ball } from '../types';

interface WagonWheelProps {
    player: Player;
    innings: [Innings, Innings | null];
}

const SHOT_COORDINATES: Record<ShotDirection, { x: number; y: number }> = {
    'Point': { x: 50, y: 50 },
    'Cover': { x: 100, y: 25 },
    'Long Off': { x: 150, y: 50 },
    'Straight': { x: 175, y: 100 },
    'Long On': { x: 150, y: 150 },
    'Mid-Wicket': { x: 100, y: 175 },
    'Square Leg': { x: 50, y: 150 },
    'Fine Leg': { x: 25, y: 100 },
};

const RUN_COLORS: Record<number, string> = {
    1: '#9ca3af', // gray-400
    2: '#6b7280', // gray-500
    3: '#93c5fd', // blue-300
    4: '#3b82f6', // blue-500
    6: '#a855f7', // purple-500
};

const WagonWheel: React.FC<WagonWheelProps> = ({ player, innings }) => {
    const allPlayerShots = innings
        .flatMap(inn => inn?.timeline || [])
        .filter((ball): ball is Ball & { shotDirection: ShotDirection } => {
            if (!ball || ball.runs <= 0 || !ball.shotDirection) {
                return false;
            }
            if (ball.batsmanId !== player.id) {
                return false;
            }
            return Object.keys(SHOT_COORDINATES).includes(ball.shotDirection);
        });

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="relative w-full max-w-xs md:max-w-sm aspect-square">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Field */}
                    <circle cx="100" cy="100" r="98" className="fill-cricket-green-dark stroke-muted" />
                    <circle cx="100" cy="100" r="40" className="stroke-muted/70 stroke-dasharray-2 fill-none" />
                    {/* Pitch */}
                    <rect x="90" y="50" width="20" height="100" className="fill-pitch-brown" />
                    <rect x="95" y="65" width="10" height="10" className="fill-stump-white/50" />
                    <rect x="95" y="125" width="10" height="10" className="fill-stump-white/50" />

                    {/* Shots */}
                    {allPlayerShots.map((ball, index) => {
                        const { x, y } = SHOT_COORDINATES[ball.shotDirection];
                        const color = RUN_COLORS[ball.runs] || '#d1d5db'; // default color
                        return (
                            <line
                                key={index}
                                x1="100"
                                y1="100"
                                x2={x}
                                y2={y}
                                stroke={color}
                                strokeWidth="1.5"
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 20}ms`, opacity: 0 }}
                            />
                        );
                    })}
                </svg>
            </div>
             <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {Object.entries(RUN_COLORS).map(([runs, color]) => (
                    <div key={runs} className="flex items-center space-x-2 text-sm">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                        <span>{runs} Run{runs !== '1' ? 's' : ''}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default WagonWheel;