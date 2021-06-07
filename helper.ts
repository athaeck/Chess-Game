namespace ChessGame {
    export function Round(number: number, place: number): number {
            const zahl: number = (Math.round(number * place) / place);
            return zahl;
        }
}