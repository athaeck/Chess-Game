namespace ChessGame {
    // import ChessPlayerSettings from "./data/ChessFigureSetting.json"
    export class StaticDataTransformator {
        private static _instance: StaticDataTransformator;

        // private _chessFigureSetting: string = "./data/ChessFigureSetting.json"

        private constructor() {
            
        }

        public static get Instance(): StaticDataTransformator {
            return this._instance || (this._instance = new this());
        }

        public GetMovementData(name: string): ChessPlayerSetting{
            // const movement: ChessPlayerSettings = requi
            // return ChessPlayerSettings[name];
        }
    }
}