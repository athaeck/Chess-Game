"use strict";
var ChessGame;
(function (ChessGame) {
    class ChessFigure extends ChessGame.GameObject {
        constructor(name) {
            super(name);
        }
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessFigure.js.map