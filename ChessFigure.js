"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    // const CHESSFIGUREMOVEMENTS: ChessPlayerSettings = {
    //     "Turm": {
    //         _attack: null,
    //         _movement: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: true
    //             }, {
    //                 _fieldsX: 0,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: 0,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: true
    //             }
    //         ]
    //     },
    //     "Springer": {
    //         _attack: null,
    //         _movement: [
    //             {
    //                 _fieldsX: 2,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: 2,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: -2,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: -2,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: false
    //             }
    //         ]
    //     },
    //     "Läufer": {
    //         _attack: null,
    //         _movement: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             }
    //         ]
    //     },
    //     "Dame": {
    //         _attack: null,
    //         _movement: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: true
    //             }, {
    //                 _fieldsX: 0,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: true
    //             },
    //             {
    //                 _fieldsX: 0,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: true
    //             }
    //         ]
    //     },
    //     "König": {
    //         _attack: null,
    //         _movement: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: false
    //             }, {
    //                 _fieldsX: 0,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 1,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: -1,
    //                 _fieldsZ: 0,
    //                 _initScale: false,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: 0,
    //                 _fieldsZ: -1,
    //                 _initScale: false,
    //                 _scalable: false
    //             }
    //         ]
    //     },
    //     "Bauer": {
    //         _attack: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 1,
    //                 _scalable: false
    //             },
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: -1,
    //                 _scalable: false
    //             }
    //         ],
    //         _movement: [
    //             {
    //                 _fieldsX: 1,
    //                 _fieldsZ: 0,
    //                 _initScale: true,
    //                 _scalable: false
    //             }
    //         ]
    //     }
    // };
    class ChessFigure extends ChessGame.GameObject {
        constructor(name, mass, pysicsType, colliderType, group, place, user) {
            super(name, mass, pysicsType, colliderType, group, new f.MeshSphere);
            this._place = place;
            this._user = user;
            // [name];
            this._move = ChessGame.DataController.Instance.GetMovementData(name);
            let posY = 0;
            let componentMesh = this.getComponent(f.ComponentMesh);
            if (name === "Bauer") {
                posY = this._place.mtxLocal.translation.y + 0.5;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 1, 0.8));
            }
            else {
                posY = this._place.mtxLocal.translation.y + 1;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            }
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === ChessGame.UserType.PLAYER ? "Black" : "White")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, posY, this._place.mtxLocal.translation.z));
        }
        SetPlace(place) {
            this._place = place;
        }
        GetPlace() {
            return this._place;
        }
        MoveFigure(movementController) {
            this.addComponent(movementController);
        }
        DeleteMovementController() {
            console.log();
        }
        GetChessFigureMovement() {
            return this._move;
        }
        UpdateInitScale() {
            this._move._movement[0]._initScale = false;
        }
        GetUser() {
            return this._user;
        }
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessFigure.js.map