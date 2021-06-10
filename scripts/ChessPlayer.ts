namespace ChessGame {
    import f = FudgeCore;
    export class ChessPlayer {
        private _chessFigures: f.Node;
        private _type: UserType;
        private _timeController: TimeController;
        constructor(chessFigures: f.Node, type: UserType, timeController: TimeController) {
            this._chessFigures = chessFigures;
            this._type = type;
            this._timeController = timeController;
        }
        public GetFigures(): ChessFigure[] {
            return this._chessFigures.getChildren() as ChessFigure[];
        }
        public GetTimeController(): TimeController {
            return this._timeController;
        }
        public GetPlayerType(): UserType {
            return this._type;
        }
        public RemoveFigure(figure: f.Node): void{
            this._chessFigures.removeChild(figure);
        }
        public AddFigure(figure: ChessFigure): void{
            this._chessFigures.appendChild(figure);
        }
    }
}