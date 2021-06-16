namespace ChessGame {
    import f = FudgeCore;
    export class CollisionController extends f.ComponentScript {
        // private _parent: ChessFigure;
        // private _target: f.Vector3;
        constructor() {
            super();
            this.singleton = true;
            // this._target = target;
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }

        public Remove(): void {
            this.getContainer().removeComponent(this);
        }
        private Created(event: any): void {
            this.getContainer().getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.HandleCollision.bind(this));
        }

        private HandleCollision(event: any): void {
            // console.log(State.Instance.User)
            // const parent: ChessFigure = event.cmpRigidbody.container as ChessFigure;
            // // console.log(parent)
            // const target: ChessFigure = event.target.container as ChessFigure;
            // // console.log(target)

            // if (parent && target) {
            //     if (State.Instance.User === parent.GetUser().GetPlayerType()) {
            //         if (parent.GetUser().GetPlayerType() !== target.GetUser().GetPlayerType()) {
            //             target.SetDeathTimer();
            //         }
            //     }
            // }
        }
    }
}