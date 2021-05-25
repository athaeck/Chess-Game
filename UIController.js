"use strict";
var ChessGame;
(function (ChessGame) {
    var ƒui = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
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
            Hud.controller = new ƒui.Controller(ChessGame.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    ChessGame.Hud = Hud;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=UIController.js.map