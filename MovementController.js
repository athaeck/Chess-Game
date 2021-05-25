"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class MovementController extends f.ComponentScript {
        constructor(start, destination, places) {
            super();
            this._start = start;
            this._destination = destination;
            this._places = places;
        }
    }
    ChessGame.MovementController = MovementController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=MovementController.js.map