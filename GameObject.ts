namespace ChessGame {
     import f = FudgeCore;
     export class GameObject extends f.Node {
         constructor(name: string, mass: number, type: f.PHYSICS_TYPE, collider: f.COLLIDER_TYPE, groupe: f.PHYSICS_GROUP) {
            super(name);
            this.addComponent(new f.ComponentTransform());
            this.addComponent(new f.ComponentRigidbody(mass, type, collider, groupe));
        }
    }
}