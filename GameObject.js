"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class GameObject extends f.Node {
        constructor(name, mass, type, collider, groupe) {
            super(name);
            this.addComponent(new f.ComponentTransform());
            this.addComponent(new f.ComponentRigidbody(mass, type, collider, groupe));
        }
    }
    ChessGame.GameObject = GameObject;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=GameObject.js.map