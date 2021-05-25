"use strict";
var ChessGame;
(function (ChessGame) {
    class InputController {
        constructor(places, player, cameraController) {
            console.log("");
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
        }
        HandleInput() {
        }
    }
    ChessGame.InputController = InputController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=InputController.js.map