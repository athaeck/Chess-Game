"use strict";
var ChessGame;
(function (ChessGame) {
    var fui = FudgeUserInterface;
    var f = FudgeCore;
    class GameState extends f.Mutable {
        constructor() {
            super(...arguments);
            // public hits: number = 0;
            this.time = 120;
            this.player = "player";
            this.currentTime = 0;
        }
        reduceMutator(_mutator) { }
    }
    ChessGame.gameState = new GameState();
    class Hud {
        static start() {
            let domHud = document.querySelector("div#ui-wrapper");
            Hud.controller = new fui.Controller(ChessGame.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    ChessGame.Hud = Hud;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=UIController.js.map