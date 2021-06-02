"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class CameraController extends f.ComponentScript {
        constructor(userType) {
            super();
            this.x = 0;
            this._user = userType;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        UpdatePosition(currentChessFigure) {
            this._transformComponent.mtxLocal.lookAt(currentChessFigure.mtxLocal.translation, new f.Vector3(0, 1, 0));
            if (this.x === 0) {
                console.log(currentChessFigure);
                console.log(this._transformComponent);
                this.x++;
            }
        }
        UpdatePlayer(currentPlayer) {
            let vector3;
            switch (currentPlayer) {
                case ChessGame.UserType.PLAYER:
                    // this._transformComponent.mtxLocal.translation
                    vector3 = new f.Vector3(-7, 10, 0);
                    break;
                default:
                    vector3 = new f.Vector3(7, 10, 0);
                    break;
            }
            this._transformComponent.mtxLocal.translation = vector3;
        }
        Created() {
            this._transformComponent = this.getContainer().getComponent(f.ComponentTransform);
            this.UpdatePlayer(this._user);
        }
    }
    ChessGame.CameraController = CameraController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=CameraController.js.map