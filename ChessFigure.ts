namespace ChessGame {
    import f = FudgeCore;
    // const ChessFigures: string[] = [
    //     "Turm", "Springer", "Läufer", "Dame", "König", "Läufer", "Springer", "Turm", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer"
    // ];
    // const Movements: Move
    export class ChessFigure extends GameObject {
        private _place: f.Node;
        private _user: UserType;
        private _move: Movement; 
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: UserType) {
            super(name, mass, pysicsType, colliderType, group);
            this._place = place;
            this._user = user;

            let mesh: f.Mesh = new f.MeshSphere;

            let componentMesh: f.ComponentMesh = new f.ComponentMesh(mesh);
            componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            this.addComponent(componentMesh);

            let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === UserType.PLAYER ? "Black" : "White")));
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);

            // this.mtxLocal.scale(new f.Vector3(0.8, 2, 0.8))
            // this.mtxLocal.scaleX(0.8)
            // this.mtxLocal.scaleZ(0.8)
            console.log(this._place);
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x ,this._place.mtxLocal.translation.y,this._place.mtxLocal.translation.z))

        }
        public SetPlace(place:f.Node):void {
            this._place = place;
        }
        public GetPlace(): f.Node {
            return this._place;
        }
        public MoveFigure(movementController: MovementController):void {

        }
        public DeleteMovementController(): void {
            
        }
    }
}