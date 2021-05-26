"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SoundController extends f.ComponentScript {
        constructor(soundName) {
            super();
            this._volume = 5;
            this._soundFileName = soundName;
            // f.EVENT_AUDIO.
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        // public PlaySound(): void {
        //     // console.log(event);
        //     // const 
        // }
        // // public PlaySound(): void {
        // //     // const audio: ƒ.ComponentAudio = this.getContainer().getComponent(f.ComponentAudio);
        // //     // audio.play(true);
        // // }
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