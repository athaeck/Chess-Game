"use strict";
var ChessGame;
(function (ChessGame) {
    let UserType;
    (function (UserType) {
        UserType["PLAYER"] = "player";
        UserType["ENEMY"] = "enemy";
    })(UserType = ChessGame.UserType || (ChessGame.UserType = {}));
    let SoundType;
    (function (SoundType) {
        SoundType["SELECT_CHESSFIGURE"] = "select-chessfigure";
        SoundType["SELECT_FIELD"] = "select-field";
        SoundType["COLLISION"] = "collision";
    })(SoundType = ChessGame.SoundType || (ChessGame.SoundType = {}));
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=enum.js.map