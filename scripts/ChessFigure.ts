///<reference path="./GameObject.ts"/>
namespace ChessGame {
    import f = FudgeCore;
    export class ChessFigure extends GameObject {
        private _place: f.Node;
        private _user: ChessPlayer;
        private _move: ChessPlayerSetting;
        private _timerOn: boolean = false;
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: ChessPlayer) {
            super(name, mass, pysicsType, colliderType, group, new f.MeshSphere);
            this._place = place;
            this._user = user;

            let posY: number = 0;
            let componentMesh: f.ComponentMesh = this.getComponent(f.ComponentMesh);
            if (name === "Bauer") {
                posY = this._place.mtxLocal.translation.y + 0.5;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 1, 0.8));
            } else {
                posY = this._place.mtxLocal.translation.y + 1;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            }
            let materialSolidWhite: f.Material;
            if (name !== "König") {
                materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user.GetPlayerType() === UserType.PLAYER ? "Black" : "White")));
            } else {
                materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
            }
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, posY, this._place.mtxLocal.translation.z));
            this.HandleMoveData(name);
            
        }
        public SetPlace(place: f.Node): void {
            this._place = place;
        }
        public GetPlace(): f.Node {
            return this._place;
        }
        public MoveFigure(movementController: MovementController): void {
            this.addComponent(movementController);
        }
        public GetChessFigureMovement(): ChessPlayerSetting {
            return this._move;
        }
        public UpdateInitScale(): void {
            this._move._movement[0]._initScale = false;
        }
        public GetUser(): ChessPlayer {
            return this._user;
        }
        public SetDeathTimer(): void {
            if (!this._timerOn) {
                setTimeout(() => {
                    this._user.RemoveFigure(this);
                },         1000);
            }   
            this._timerOn = true;
        }
        private async HandleMoveData(name: string): Promise<void> {
            this._move = await DataController.Instance.GetMovementData(name);
        }
    }
}