import React from 'react';
import { Player, Innings, ShotDirection, Ball } from '../types';

interface ShotMapProps {
    player: Player;
    innings: [Innings, Innings | null];
}

const SHOT_COORDINATES: Record<ShotDirection, { x: number; y: number }> = {
    'Point': { x: 40, y: 100 },
    'Cover': { x: 55, y: 60 },
    'Long Off': { x: 80, y: 35 },
    'Straight': { x: 100, y: 20 },
    'Long On': { x: 120, y: 35 },
    'Mid-Wicket': { x: 145, y: 60 },
    'Square Leg': { x: 160, y: 100 },
    'Fine Leg': { x: 175, y: 150 },
};

const RUN_COLORS: Record<number, string> = {
    1: '#9ca3af', // gray-400
    2: '#6b7280', // gray-500
    3: '#93c5fd', // blue-300
    4: '#3b82f6', // blue-500
    6: '#a855f7', // purple-500
};

const ShotMap: React.FC<ShotMapProps> = ({ player, innings }) => {
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
            <div className="relative w-full max-w-xs md:max-w-sm aspect-[2/3]">
                <svg viewBox="0 0 200 300" className="w-full h-full">
                    {/* Field */}
                    <ellipse cx="100" cy="150" rx="100" ry="150" className="fill-cricket-green-dark" />
                    <ellipse cx="100" cy="150" rx="45" ry="67.5" className="stroke-muted/70 stroke-dasharray-2 fill-none" />
                    {/* Pitch */}
                    <rect x="90" y="100" width="20" height="100" className="fill-pitch-brown" />
                    <rect x="95" y="115" width="10" height="10" className="fill-stump-white/50" />
                    <rect x="95" y="175" width="10" height="10" className="fill-stump-white/50" />

                    {/* Shots */}
                    {allPlayerShots.map((ball, index) => {
                        const { x, y } = SHOT_COORDINATES[ball.shotDirection];
                        const color = RUN_COLORS[ball.runs] || '#d1d5db';
                        const randomOffset = () => (Math.random() - 0.5) * 10;
                        return (
                            <circle
                                key={index}
                                cx={x + randomOffset()}
                                cy={y + randomOffset()}
                                r="3"
                                fill={color}
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

export default ShotMap;
