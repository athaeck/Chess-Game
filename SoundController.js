"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SoundController extends f.ComponentScript {
        constructor(soundName) {
            super();
            this._volume = 5;
            this._soundFileName = soundName;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        Created(event) {
            const audio = new f.Audio(`Audio/${this._soundFileName}.mp3`);
            const soundComponent = new f.ComponentAudio(audio);
            this.getContainer().addComponent(soundComponent);
            soundComponent.volume = this._volume;
            soundComponent.play(true);
            if (!soundComponent.isPlaying) {
                this.getContainer().removeComponent(soundComponent);
                this.getContainer().removeComponent(this);
            }
        }
    }
    ChessGame.SoundController = SoundController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=SoundController.js.map