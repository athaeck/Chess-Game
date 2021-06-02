"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    const CHESSFIGUREMOVEMENTS = {
        "Turm": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Springer": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 3,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 3,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Läufer": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Dame": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "König": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                }
            ]
        },
        "Bauer": {
            _attack: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: false,
                    _scalable: true
                }
            ],
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: false,
                    _initScale: true,
                    _scalable: false
                }
            ]
        }
    };
    class ChessFigure extends ChessGame.GameObject {
        constructor(name, mass, pysicsType, colliderType, group, place, user) {
            super(name, mass, pysicsType, colliderType, group, new f.MeshSphere);
            this._place = place;
            this._user = user;
            this._move = CHESSFIGUREMOVEMENTS[name];
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
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessFigure.js.map