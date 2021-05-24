"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class GameObject extends f.Node {
        constructor(name) {
            super(name);
        }
    }
    ChessGame.GameObject = GameObject;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=GameObject.js.map