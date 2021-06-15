namespace ChessGame {
    import f = FudgeCore;
    export class Projectile extends GameObject {
        private _target: f.Vector3;
        private _speed: number = 10;
        constructor(target: f.Vector3) {
            super("Projectile", 1, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CAPSULE, f.PHYSICS_GROUP.DEFAULT, new f.MeshSphere());
            let componentMesh: f.ComponentMesh = this.getComponent(f.ComponentMesh);
            componentMesh.mtxPivot.scale(new f.Vector3(0.4, 0.5, 0.4));
            // this.mtxLocal.lookAt(this._target)
            let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("BLUE")));
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this._target = target;
            this.getComponent(f.ComponentRigidbody).addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, this.HandleCollision.bind(this));
            console.log(this)
        }
        public Move(): void{
            this.mtxLocal.translate(new f.Vector3(this._target.x / this._speed, 1 / this._speed, this._target.z / this._speed));
        }
        private HandleCollision(event: any): void{
            console.log(event);
        }
    }
}