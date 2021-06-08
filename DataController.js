"use strict";
//    import * as ChessPlayerSettings from "./data/ChessFigureSetting.json";
var ChessGame;
(function (ChessGame) {
    // import * as ChessPlayerSettings from "./data/ChessFigureSetting.json";
    class DataController {
        // private _chessFigureSetting: string = "./data/ChessFigureSetting.json"
        constructor() {
        }
        static get Instance() {
            return this._instance || (this._instance = new this());
        }
        GetMovementData(name) {
            // const movement: ChessPlayerSettings = requi
            // console.log(ChessPlayerSettings)
            const setting = ChessPlayerSettings;
            console.log(setting);
            return setting[name];
            // return null;
        }
    }
    ChessGame.DataController = DataController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=DataController.js.map