namespace ChessGame {
    import f = FudgeCore;
    export class ChessPlayer {
        private _chessFigures: f.Node;
        private _type: UserType;
        private _timeController: TimeController;
        private _graveYard: string[] = [];
        private _name: string;
        constructor(chessFigures: f.Node, type: UserType, timeController: TimeController, name: string) {
            this._chessFigures = chessFigures;
            this._type = type;
            this._timeController = timeController;
            this._name = name;
        }
        public get name(): string {
            return this._name;
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
        public RemoveFigure(figure: f.Node): void {
            this._graveYard.push(figure.name);
            const cmps: f.Component[] = figure.getAllComponents();
            for (const cmp of cmps) {
                figure.removeComponent(cmp);
            }
            this._chessFigures.removeChild(figure);
        }
        public AddFigure(figure: ChessFigure): void {
            this._chessFigures.appendChild(figure);
        }
        public WriteGravayardFigures(container: HTMLUListElement): void {
            container.innerHTML = "";
            if (this._graveYard.length > 0)
            for (const cp of this._graveYard) {
                container.innerHTML += `<li id="element">${cp}</li>`;
            }
        }
    }
}