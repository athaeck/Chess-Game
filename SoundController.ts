namespace ChessGame {
    import f = FudgeCore;
    export class SoundController extends f.ComponentScript {
        private _volume: number = 5;
        private _soundFileName: string;
        constructor(soundName: string) {
            super();
            this._soundFileName = soundName;
            // f.EVENT_AUDIO.
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }
        // public PlaySound(): void {
        //     // console.log(event);
        //     // const 
        // }
        // // public PlaySound(): void {
        // //     // const audio: ƒ.ComponentAudio = this.getContainer().getComponent(f.ComponentAudio);
        // //     // audio.play(true);
        // // }
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