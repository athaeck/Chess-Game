"use strict";
var ChessGame;
(function (ChessGame) {
    class DataController {
        constructor() {
            this._chessFigureSetting = "./data/ChessFigureSetting.json";
        }
        static get Instance() {
            return this._instance || (this._instance = new this());
        }
        async GetMovementData(name) {
            let res = await fetch(this._chessFigureSetting);
            let resBody = await res.json();
            return resBody[name];
        }
    }
    ChessGame.DataController = DataController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=DataController.js.map