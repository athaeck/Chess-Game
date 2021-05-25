"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SoundController extends f.ComponentScript {
        constructor() {
            super();
            // f.EVENT_AUDIO.
        }
        PlaySound() {
            const audio = this.getContainer().getComponent(f.ComponentAudio);
            audio.play(true);
        }
    }
    ChessGame.SoundController = SoundController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=SoundController.js.map