"use strict";
var ChessGame;
(function (ChessGame) {
    // import ChessPlayerSettings from "./data/ChessFigureSetting.json"
    class StaticDataTransformator {
        // private _chessFigureSetting: string = "./data/ChessFigureSetting.json"
        constructor() {
        }
        static get Instance() {
            return this._instance || (this._instance = new this());
        }
        GetMovementData(name) {
            // const movement: ChessPlayerSettings = requi
            // return ChessPlayerSettings[name];
        }
    }
    ChessGame.StaticDataTransformator = StaticDataTransformator;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=StaticDataTransformator.js.map