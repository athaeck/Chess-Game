namespace ChessGame {
    export class DataController {
        private static _instance: DataController;

        private _chessFigureSetting: string = "./data/ChessFigureSetting.json";

        private _chessFigures: string = "./data/ChessFigures.json";

        private _gameSetting: string = "./data/GameSetting.json";

        private constructor() {
            
        }

        public static get Instance(): DataController {
            return this._instance || (this._instance = new this());
        }

        public async GetMovementData(name: string): Promise<ChessPlayerSetting> {
            let res: Response = await fetch(this._chessFigureSetting);
            let resBody: ChessPlayerSettings =  await res.json();

            return resBody[name];
        }
        public async GetSound(type: SoundType): Promise<SoundData> {
            const setting: Sound = await (await this.GetGameSetting()).Sound;
            return setting[type];
        }
        public async GetGameSetting(): Promise<Setting> {
            const setting: Setting = await (await fetch(this._gameSetting)).json();
            return setting;
        }
    }
}