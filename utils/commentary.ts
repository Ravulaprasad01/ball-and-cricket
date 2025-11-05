import { GameState, Ball } from '../types';

export const generateCommentary = (state: GameState, ball: Ball, event: GameState['lastEvent'], runsBefore: number): string | null => {
    if (event === 'four') {
        return 'Four runs.';
    }
    if (event === 'six') {
        return 'Six runs.';
    }

    // Handle 1, 2, 3 runs which don't set a specific event.
    if (ball.runs > 0 && ball.runs < 4 && !ball.isWicket && !ball.isWide && !ball.isNoBall) {
        return `${ball.runs} ${ball.runs === 1 ? 'run' : 'runs'}.`;
    }

    // No commentary for any other event (wicket, extras, dot balls)
    return null;
};
