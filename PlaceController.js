"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class PlaceController extends f.ComponentScript {
        constructor(chessFigure = null) {
            super();
            this._chessFigure = chessFigure;
        }
        GetChessFigure() {
            return this._chessFigure;
        }
        SetChessFigure(chessFigure = null) {
            this._chessFigure = chessFigure;
        }
    }
    ChessGame.PlaceController = PlaceController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=PlaceController.js.map