namespace ChessGame {
    import f = FudgeCore;
    export class MovementController extends f.ComponentScript {
        private _start: f.ComponentTransform;
        private _target: f.ComponentTransform;
        private _places: f.Node[];
        private _name: string;
        private _body: f.ComponentRigidbody;
        private _parent: ChessFigure;
        constructor(target: f.ComponentTransform, places: f.Node[], name: string) {
            super();
            this._target = target;
            this._places = places;
            this._name = name;
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Start.bind(this));
        }
        private Start(): void {
            this._start = this.getContainer().getComponent(f.ComponentTransform);
            this._body = this.getContainer().getComponent(f.ComponentRigidbody);
            this._parent = this.getContainer() as ChessFigure;
            this.Move();
        }
        private Move(): void {
            this._body.physicsType = f.PHYSICS_TYPE.DYNAMIC;
            const toTranslate: f.Vector3 = new f.Vector3(this._target.mtxLocal.translation.x - this._start.mtxLocal.translation.x, 0, this._target.mtxLocal.translation.z - this._start.mtxLocal.translation.z);
            // if (this._name) {

            // }
            switch (this._name) {
                case "Springer":
                    // this._body.applyLinearImpulse(new f.Vector3(0, 5, 0));
                    break;
                default:
                    break;
            }
            this._body.translateBody(toTranslate);
            // this._body.
            // this._body.applyLinearImpulse(toTranslate);
            // this._body.
            // this.CheckReachedDestination();
            // let bool: boolean = true;
            // while (bool) {
            //     // console.log("moving");
            //     bool = this.CheckReachedDestination();
            // }
            // this._body.physicsType = f.PHYSICS_TYPE.KINEMATIC;
            // const newPlaceController: PlaceController = this._target.getContainer().getComponent(PlaceController);
            // const currentPlaceController: PlaceController = this._parent.GetPlace().getComponent(PlaceController);
            // currentPlaceController.RemoveChessFigure();
            // newPlaceController.SetChessFigure(this._parent);
            // console.log(this._places);

            // this.getContainer().removeComponent(this);
            // f.Time.game.s(2000, 0, () => {
            // let self: any = this;
            setTimeout(() => {
                 this._body.physicsType = f.PHYSICS_TYPE.KINEMATIC;
                 const newPlaceController: PlaceController = this._target.getContainer().getComponent(PlaceController);
                 const currentPlaceController: PlaceController = this._parent.GetPlace().getComponent(PlaceController);
                 currentPlaceController.RemoveChessFigure();
                 newPlaceController.SetChessFigure(this._parent);
                //  console.log(this._places);

                 this.getContainer().removeComponent(this);
            },         1000);
               
            // });
        }
        private CheckReachedDestination(): boolean {
            const current: f.ComponentTransform = this.getContainer()?.getComponent(f.ComponentTransform);
            if (Round(current.mtxLocal.translation.x, 10) === Round(this._target.mtxLocal.translation.x, 10) && Round(current.mtxLocal.translation.z, 10) === Round(this._target.mtxLocal.translation.z, 10)) {
                return false;
            } else {
                return true;
            }
        }
    }
}