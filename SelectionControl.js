"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SelectionControl extends ChessGame.GameObject {
        constructor() {
            super("Selection", 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.PYRAMID, f.PHYSICS_GROUP.DEFAULT, new f.MeshPyramid);
            const mesh = this.getComponent(f.ComponentMesh);
            mesh.mtxPivot.scale(new f.Vector3(0.7, 0.5, 0.7));
            this.mtxLocal.translateY(3);
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("Grey")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
        }
    }
    ChessGame.SelectionControl = SelectionControl;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=SelectionControl.js.map