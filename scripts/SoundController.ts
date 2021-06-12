namespace ChessGame {
    import f = FudgeCore;
    export class SoundController extends f.ComponentScript {
        private _type: SoundType;
        private _setting: SoundData;
        private _soundSettings: SoundSetting;
        private _soundComponent: f.ComponentAudio;
        constructor(type: SoundType) {
            super();
            this._type = type;
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }
        public Delete(): void {
            this.getContainer().removeComponent( this._soundComponent);
            this.getContainer().removeComponent(this);
        }
        private async FetchData(type: SoundType): Promise<void>{
            this._setting = await DataController.Instance.GetSound(type);
            this._soundSettings = await (await DataController.Instance.GetGameSetting()).SoundSetting;
        }
        private async Created(event: Event): Promise<void> {
            await this.FetchData(this._type);
            if (this._soundSettings.withSound) {
                const audio: f.Audio = new f.Audio(`./audio/${this._setting.name}.mp3`);
                this._soundComponent = new f.ComponentAudio(audio, this._setting.loop);
                this.getContainer().addComponent( this._soundComponent);
                this._soundComponent.volume = this._setting.volume;
                this._soundComponent.play(true);
                if (! this._soundComponent.isPlaying) {
                   this.Delete();
                }
            }
        }
    }
}