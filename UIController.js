"use strict";
var ChessGame;
(function (ChessGame) {
    class GameState extends ƒ.Mutable {
        // public hits: number = 0;
        reduceMutator(_mutator) { }
    }
    ChessGame.gameState = new GameState();
    class Hud {
        static start() {
            //   let domHud: HTMLDivElement = document.querySelector("div");
            //   Hud.controller = new ƒui.Controller(gameState, domHud);
            //   Hud.controller.updateUserInterface();
        }
    }
    ChessGame.Hud = Hud;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=UIController.js.map