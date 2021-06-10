namespace ChessGame {
    export class DataController {
        private static _instance: DataController;

        private _chessFigureSetting: string = "./data/ChessFigureSetting.json"

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
    }
}