namespace ChessGame {
    import f = FudgeCore;
    export class PlaceController extends f.ComponentScript {
        private _chessFigure: ChessFigure;
        constructor(chessFigure: ChessFigure = null) {
            super();
            this._chessFigure = chessFigure;
        }
        public GetChessFigure(): ChessFigure {
            return this._chessFigure;
        }
        public SetChessFigure(chessFigure: ChessFigure = null): void {
            this._chessFigure = chessFigure;
        }
    }
}