namespace ChessGame {
    import f = FudgeCore;
    export class MovementSelection extends GameObject {
        constructor() {
            super("MovementSelection", 1, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.SPHERE, f.PHYSICS_GROUP.GROUP_4, new f.MeshSphere);
            const body: f.ComponentRigidbody = this.getComponent(f.ComponentRigidbody);
            this.removeComponent(body);
            const mesh: f.ComponentMesh = this.getComponent(f.ComponentMesh);
            mesh.mtxPivot.scale(new f.Vector3(0.3, 0.3, 0.3));
            let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.addEventListener(f.EVENT.CHILD_APPEND, this.HandleRemove.bind(this));
        }
        private HandleRemove(event: Event): void {
            setTimeout(() => {
                this.getParent().removeChild(this);
            },         50);
        }
    }
}