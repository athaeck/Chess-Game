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
            chessFigure.SetPlace(this?.getContainer());
            this._chessFigure = chessFigure;
        }
        IsChessFigureNull() {
            return this._chessFigure === null ? true : false;
        }
        RemoveChessFigure() {
            this._chessFigure.SetPlace(null);
            this._chessFigure = null;
        }
    }
    ChessGame.PlaceController = PlaceController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=PlaceController.js.map