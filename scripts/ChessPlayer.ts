namespace ChessGame {
    import f = FudgeCore;
    export class ChessPlayer {
        private _chessFigures: f.Node;
        private _type: UserType;
        private _graveYard: string[] = [];
        private _name: string;
        constructor(chessFigures: f.Node, type: UserType,  name: string) {
            this._chessFigures = chessFigures;
            this._type = type;
            this._name = name;
        }
        public get name(): string {
            return this._name;
        }
        public get graveYard(): string[] {
            return this._graveYard;
        }
        public GetFigures(): ChessFigure[] {
            return this._chessFigures.getChildren() as ChessFigure[];
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