namespace ChessGame {
    import f = FudgeCore;
    export class MovementController extends f.ComponentScript{
        private _start: f.Node;
        private _destination: f.Node;
        private _places: f.Node[];
        constructor(start:f.Node, destination:f.Node,places:f.Node[]) {
            super();
            this._start = start;
            this._destination = destination;
            this._places = places;
        }
    }
}