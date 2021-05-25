namespace ChessGame {
    import f = FudgeCore;
    const CHESSFIGUREMOVEMENTS: ChessPlayerSettings = {
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
    export class ChessFigure extends GameObject {
        private _place: f.Node;
        private _user: UserType;
        private _move: ChessPlayerSetting;
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: UserType) {
            super(name, mass, pysicsType, colliderType, group);
            this._place = place;
            this._user = user;
            this._move = CHESSFIGUREMOVEMENTS[name];

            // console.log(this);

            let posY: number = 0;
            let mesh: f.Mesh = new f.MeshSphere;
            let componentMesh: f.ComponentMesh = new f.ComponentMesh(mesh);
            if (name === "Bauer") {
                posY = this._place.mtxLocal.translation.y + 0.5;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 1, 0.8));
            } else {
                posY = this._place.mtxLocal.translation.y + 1;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            }
            this.addComponent(componentMesh);

            let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === UserType.PLAYER ? "Black" : "White")));
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);

            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, posY, this._place.mtxLocal.translation.z));

        }
        public SetPlace(place: f.Node): void {
            this._place = place;
        }
        public GetPlace(): f.Node {
            return this._place;
        }
        public MoveFigure(movementController: MovementController): void {

        }
        public DeleteMovementController(): void {

        }
    }
}