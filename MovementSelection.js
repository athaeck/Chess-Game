"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class MovementSelection extends ChessGame.GameObject {
        constructor() {
            super("MovementSelection", 1, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.SPHERE, f.PHYSICS_GROUP.GROUP_4, new f.MeshSphere);
            const body = this.getComponent(f.ComponentRigidbody);
            this.removeComponent(body);
            const mesh = this.getComponent(f.ComponentMesh);
            mesh.mtxPivot.scale(new f.Vector3(0.3, 0.3, 0.3));
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.addEventListener("childAppend" /* CHILD_APPEND */, this.HandleRemove.bind(this));
        }
        HandleRemove(event) {
            setTimeout(() => {
                this.getParent().removeChild(this);
            }, 50);
        }
    }
    ChessGame.MovementSelection = MovementSelection;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=MovementSelection.js.map