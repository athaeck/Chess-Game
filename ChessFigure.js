"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    // const ChessFigures: string[] = [
    //     "Turm", "Springer", "Läufer", "Dame", "König", "Läufer", "Springer", "Turm", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer"
    // ];
    // const Movements: Move
    class ChessFigure extends ChessGame.GameObject {
        constructor(name, mass, pysicsType, colliderType, group, place, user) {
            super(name, mass, pysicsType, colliderType, group);
            this._place = place;
            this._user = user;
            let mesh = new f.MeshSphere;
            let componentMesh = new f.ComponentMesh(mesh);
            componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            this.addComponent(componentMesh);
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === ChessGame.UserType.PLAYER ? "Black" : "White")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            // this.mtxLocal.scale(new f.Vector3(0.8, 2, 0.8))
            // this.mtxLocal.scaleX(0.8)
            // this.mtxLocal.scaleZ(0.8)
            console.log(this._place);
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, this._place.mtxLocal.translation.y, this._place.mtxLocal.translation.z));
        }
        SetPlace(place) {
            this._place = place;
        }
        GetPlace() {
            return this._place;
        }
        MoveFigure(movementController) {
        }
        DeleteMovementController() {
        }
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessFigure.js.map