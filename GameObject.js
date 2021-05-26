"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class GameObject extends f.Node {
        constructor(name, mass, type, collider, groupe, mesh) {
            super(name);
            this.addComponent(new f.ComponentTransform());
            this.addComponent(new f.ComponentRigidbody(mass, type, collider, groupe));
            this.addComponent(new f.ComponentMesh(mesh));
        }
    }
    ChessGame.GameObject = GameObject;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=GameObject.js.map