namespace ChessGame {
    import f = FudgeCore;
    export class DuellController {
        // private _surface: f.Node;
        private _cameraController: CameraController;
        private _duell: Duell;
        private _originPosition: f.ComponentTransform;
        private _battleGround: f.Node;
        private _endStatus: boolean = false;
        // private 
        constructor(cameraController: CameraController, duell: Duell) {
            const offset: number = 15;
            // this._surface = surface;
            this._cameraController = cameraController;
            this._duell = duell;
            // this._originPosition = surface.getComponent(f.ComponentTransform);
            this._battleGround = new f.Node("CheckmateBattle");
            const mesh: f.Mesh = new f.MeshCube("Ground");
            const mComp: f.ComponentMesh = new f.ComponentMesh(mesh);
            this._battleGround.addComponent(mComp);
            mComp.mtxPivot.scale(new f.Vector3(15, 1, 15));
            this._battleGround.addComponent(new f.ComponentTransform());
            this._battleGround.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
            // this._battleGround.getComponent(f.ComponentTransform).mtxLocal.translation.y = offset;
            // this._battleGround.mtxLocal.translation.z = 15;
            this._cameraController.Translate(offset);
            // this._cameraController
            // this._cameraController.TransformComponent.mtxLocal.translation.z = this._cameraController.TransformComponent.mtxLocal.translation.z + 15;
            
          
            // this._battleGround.mtxLocal.translation.z = offset;
            const materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("DarkGreen")));
            const componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this._battleGround.addComponent(componentMaterial);
            this._battleGround.mtxLocal.translateY(offset);
        }
        public get BattleGround(): f.Node {
            return this._battleGround;
        }
        public get End(): boolean {
            return false;
        }
        public HandleInput(): void {
            // this.WatchEnd();
        }
        public WatchEnd(): void {

        }
    }
}