namespace ChessGame {
    import f = FudgeCore;
    export class DuellController{
        private _surface: f.Node;
        private _cameraController: CameraController;
        private _duell: Duell;
        private _originPosition: f.ComponentTransform;
        private _battleGround: f.Node;
        // private 
        constructor(surface: f.Node, cameraController: CameraController, duell:Duell) {
            const offset: number = 15;
            this._surface = surface;
            this._cameraController = cameraController;
            this._duell = duell;
            this._originPosition = surface.getComponent(f.ComponentTransform);
            this._battleGround = new f.Node("CheckmateBattle");
            for (const component of surface.getAllComponents()) {
                this._battleGround.addComponent(component);
            }
            this._battleGround.getComponent(f.ComponentTransform).mtxLocal.translateY(offset);
            // const transformSurface: f.ComponentTransform = surface.getComponent(f.ComponentTransform);
            // transformSurface.mtxLocal.translateY(offset);
            const transform: f.ComponentTransform = cameraController.TransformComponent;
            transform.mtxLocal.translateY(offset)
        }
        public get BattleGround(): f.Node{
            return this._battleGround;
        }
        public get End(): boolean{
            return false;
        }
        public HandleInput(): void{
            
        }
    }
}