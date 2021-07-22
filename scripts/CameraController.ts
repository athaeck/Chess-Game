namespace ChessGame {
    import f = FudgeCore;
    export class CameraController extends f.ComponentScript {
        private _transformComponent: f.ComponentTransform;
        private _user: UserType;
        constructor(userType: UserType) {
            super();
            this._user = userType;

            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Created.bind(this));
        }
        public get TransformComponent(): f.ComponentTransform {
            return this._transformComponent;
        }
        public UpdatePosition(currentChessFigure: f.ComponentTransform): void {
            this._transformComponent.mtxLocal.lookAt(currentChessFigure.mtxLocal.translation, new f.Vector3(0, 1, 0));
        }
        public Translate(amount: number): void {
            this._transformComponent.mtxLocal.translateY(amount);
        }
        public UpdatePlayer(currentPlayer: UserType): void {
            let vector3: f.Vector3;
            switch (currentPlayer) {
                case UserType.PLAYER:
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