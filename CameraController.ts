namespace ChessGame {
    import f = FudgeCore;
    export class CameraController extends f.ComponentScript {
        private _transformComponent: f.ComponentTransform;
        private x: number = 0;
        private _user: UserType;
        constructor(userType: UserType) {
            super();
            this._user = userType;

            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }
        public UpdatePosition(currentChessFigure: f.ComponentTransform): void {
            this._transformComponent.mtxLocal.lookAt(currentChessFigure.mtxLocal.translation, new f.Vector3(0, 1, 0));
            if (this.x === 0) {
                console.log(currentChessFigure);
                console.log(this._transformComponent);
                this.x++;
            }
        }
        public UpdatePlayer(currentPlayer: UserType): void {
            let vector3: f.Vector3;
            switch (currentPlayer) {
                case UserType.PLAYER:
                    // this._transformComponent.mtxLocal.translation
                    vector3 = new f.Vector3(-7, 10, 0);
                    break;
                default:
                    vector3 = new f.Vector3(7, 10, 0);
                    break;
            }
            this._transformComponent.mtxLocal.translation = vector3;
        }
        private Created(): void {
            this._transformComponent = this.getContainer().getComponent(f.ComponentTransform);
            this.UpdatePlayer(this._user);
        }
    }
}