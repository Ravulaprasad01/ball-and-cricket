import React from 'react';
import { GameState } from '../types';

type Signal = GameState['lastEvent'];

interface UmpireSignalProps {
  signal: Signal;
}

const UmpireFigure: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <g transform="translate(0, 5)">
        {/* Head */}
        <circle cx="50" cy="20" r="10" fill="hsl(var(--foreground))" opacity="0.8" />
        {/* Body */}
        <path d="M40 30 h 20 v 40 h -20 z" fill="hsl(var(--foreground))" opacity="0.8" />
        {/* Legs */}
        <path d="M42 70 v 25 h -4 v -25 z" fill="hsl(var(--foreground))" opacity="0.8" />
        <path d="M58 70 v 25 h -4 v -25 z" fill="hsl(var(--foreground))" opacity="0.8" />
        {children}
    </g>
);

const SIGNALS: Record<NonNullable<Signal>, React.ReactNode> = {
    'wicket': (
        <>
            <path d="M45 45 l -10 -20" stroke="hsl(var(--foreground))" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
            <path d="M50 45 v -30" stroke="hsl(var(--destructive))" strokeWidth="6" strokeLinecap="round" />
        </>
    ),
    'four': (
        <path d="M40 50 h -30" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
    ),
    'six': (
        <>
            <path d="M45 35 l -15 -15" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
            <path d="M55 35 l 15 -15" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        </>
    ),
    'wide': (
        <>
            <path d="M40 50 h -30" stroke="hsl(var(--secondary))" strokeWidth="6" strokeLinecap="round" />
            <path d="M60 50 h 30" stroke="hsl(var(--secondary))" strokeWidth="6" strokeLinecap="round" />
        </>
    ),
    'noball': (
        <path d="M60 50 h 30" stroke="hsl(var(--secondary))" strokeWidth="6" strokeLinecap="round" />
    ),
    'none': null,
}

export const UmpireSignal: React.FC<UmpireSignalProps> = ({ signal }) => {
    if (!signal || signal === 'none') return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-fade-in-out">
            <div className="bg-card/50 backdrop-blur-sm p-4 rounded-full shadow-lg">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                    <UmpireFigure>
                        {SIGNALS[signal]}
                    </UmpireFigure>
                </svg>
            </div>
        </div>
    );
};
