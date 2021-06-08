"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class MovementController extends f.ComponentScript {
        constructor(target, places, name) {
            super();
            this._target = target;
            this._places = places;
            this._name = name;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Start.bind(this));
        }
        Start() {
            this._start = this.getContainer().getComponent(f.ComponentTransform);
            this._body = this.getContainer().getComponent(f.ComponentRigidbody);
            this._parent = this.getContainer();
            this.Move();
        }
        Move() {
            this._body.physicsType = f.PHYSICS_TYPE.DYNAMIC;
            const toTranslate = new f.Vector3(this._target.mtxLocal.translation.x - this._start.mtxLocal.translation.x, 0, this._target.mtxLocal.translation.z - this._start.mtxLocal.translation.z);
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
            setTimeout(() => {
                this._body.physicsType = f.PHYSICS_TYPE.KINEMATIC;
                const newPlaceController = this._target.getContainer().getComponent(ChessGame.PlaceController);
                const currentPlaceController = this._parent.GetPlace().getComponent(ChessGame.PlaceController);
                currentPlaceController.RemoveChessFigure();
                newPlaceController.SetChessFigure(this._parent);
                //  console.log(this._places);
                this.getContainer().removeComponent(this);
            }, 1000);
            // });
        }
        CheckReachedDestination() {
            const current = this.getContainer()?.getComponent(f.ComponentTransform);
            if (ChessGame.Round(current.mtxLocal.translation.x, 10) === ChessGame.Round(this._target.mtxLocal.translation.x, 10) && ChessGame.Round(current.mtxLocal.translation.z, 10) === ChessGame.Round(this._target.mtxLocal.translation.z, 10)) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    ChessGame.MovementController = MovementController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=MovementController.js.map