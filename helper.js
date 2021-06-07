"use strict";
var ChessGame;
(function (ChessGame) {
    function Round(number, place) {
        const zahl = (Math.round(number * place) / place);
        return zahl;
    }
    ChessGame.Round = Round;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=helper.js.map