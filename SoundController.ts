namespace ChessGame {
    import f = FudgeCore;
    export class SoundController extends f.ComponentScript {
        constructor() {
            super();
            // f.EVENT_AUDIO.
        }
        public PlaySound(): void {
            const audio: ƒ.ComponentAudio = this.getContainer().getComponent(f.ComponentAudio);
            audio.play(true);
        }
    }
}