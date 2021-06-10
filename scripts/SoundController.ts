namespace ChessGame {
    import f = FudgeCore;
    export class SoundController extends f.ComponentScript {
        private _volume: number = 5;
        private _soundFileName: string;
        constructor(soundName: string) {
            super();
            this._soundFileName = soundName;
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }
        private Created(event: Event): void {
            const audio: f.Audio = new f.Audio(`Audio/${this._soundFileName}.mp3`);
            const soundComponent: f.ComponentAudio = new f.ComponentAudio(audio);
            this.getContainer().addComponent(soundComponent);
            soundComponent.volume = this._volume;
            soundComponent.play(true);
            if (!soundComponent.isPlaying) {
                this.getContainer().removeComponent(soundComponent);
                this.getContainer().removeComponent(this);
            }
        }
    }
}