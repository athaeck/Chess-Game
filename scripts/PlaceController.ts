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
            chessFigure.SetPlace(this?.getContainer());
            this._chessFigure = chessFigure;
        }
        public IsChessFigureNull(): boolean {
            return this._chessFigure === null ? true : false;
        }
        public RemoveChessFigure(): void {
            this._chessFigure.SetPlace(null);
            this._chessFigure = null;
        }
    }
}