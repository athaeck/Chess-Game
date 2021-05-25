namespace ChessGame {
    import f = FudgeCore;
    export class InputController{
        private _places: f.Node[];
        private _player: ChessPlayer;
        private _cameraController: CameraController;
        constructor(places: f.Node[], player: ChessPlayer, cameraController: CameraController) {
            console.log("");
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
        }
        public HandleInput(): void{
            
        }
    }
}