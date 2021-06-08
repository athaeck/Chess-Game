//    import * as ChessPlayerSettings from "./data/ChessFigureSetting.json";
namespace ChessGame {
    // import * as ChessPlayerSettings from "./data/ChessFigureSetting.json";
    export class DataController {
        private static _instance: DataController;

        // private _chessFigureSetting: string = "./data/ChessFigureSetting.json"

        private constructor() {
            
        }

        public static get Instance(): DataController {
            return this._instance || (this._instance = new this());
        }

        public GetMovementData(name: string): ChessPlayerSetting {
            // const movement: ChessPlayerSettings = requi
            // console.log(ChessPlayerSettings)
            const setting: ChessPlayerSettings = <ChessPlayerSettings>ChessPlayerSettings;
            console.log(setting);
            return setting[name];
            // return null;
        }
    }
}