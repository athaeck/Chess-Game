namespace ChessGame {
    import f = FudgeCore;
    export interface UserTime {
        _usedTime: number;
    }
    export type ManageUserTimer = {
        [key in UserType]: UserTime;
    };
    export interface Movement {
        transform: f.ComponentTransform;
    }
    export class InputController {
        private _places: f.Node[];
        private _player: ChessPlayer;
        private _cameraController: CameraController;
        private _currentUseTime: number = 0;
        private _currentPlayer: UserType = UserType.PLAYER;
        private _userTimer: ManageUserTimer;
        private _maxTime: number;
        private _break: boolean = false;
        private _currentChessFigureIndex: number = 0;
        private _clickable: boolean = true;
        private _selectionControl: SelectionControl;
        private _movementIndex: number = 0;
        private _movements: Movement[];
        private x: number = 0;
        constructor(places: f.Node[], player: ChessPlayer, cameraController: CameraController, maxTime: number, selectionControl: SelectionControl) {
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._userTimer = {
                player: { _usedTime: maxTime },
                enemy: { _usedTime: maxTime }
            };
            this._maxTime = maxTime;
            // this._currentChessFigureIndex.
            // this.HandleEvents();
        }
        public HandleInput(): void {
            this.HandleSelectionControl();
            this.UpdateTimer();
            this.HandleCameraPosition();
            if (this._currentPlayer === UserType.PLAYER) {
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }


            } else {
                console.log()
            }
            this.GetChessFigureMovements();

        }
        public ResetTimer(): void {
            this._userTimer = {
                player: { _usedTime: this._maxTime },
                enemy: { _usedTime: this._maxTime }
            };
            this._currentUseTime = 0;
        }
        private HandleSoundController(soundType: SoundType): void {
            const index: number = this._currentChessFigureIndex;
            let soundFile: string = "";
            switch (soundType) {
                case SoundType.SELECT_CHESSFIGURE:
                    soundFile = "Beat";
                    break;
                default:
                    soundFile = "Ufo";
                    break;
            }
            const soundController: SoundController = new SoundController(soundFile);
            this._player[this._currentPlayer].getChildren()[index].addComponent(soundController);
        }
        private HandleSelectionControl(): void {
            if (this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex]) {
                const _currentFigure: ChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex] as ChessFigure;
                const _currentPlace: f.Node = _currentFigure.GetPlace();
                const v3: f.Vector3 = new f.Vector3(_currentPlace.mtxLocal.translation.x, 3, _currentPlace.mtxLocal.translation.z);
                this._selectionControl.mtxLocal.translation = v3;

            }
        }
        private CheckIfValidIndex(): void {
            if (this._currentChessFigureIndex > this._player[this._currentPlayer].getChildren().length - 1) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex = this._player[this._currentPlayer].getChildren().length - 1;
            }
        }
        private UpdateTimer(): void {
            if (!this._break) {
                this._currentUseTime++;
                gameState.currentTime = this._currentUseTime;
            }
            // this._userTimer[this._currentPlayer]._usedTime++:
            // this._currentUseTime++;
            // console.log(this._timer)
            // gameState.time = this._timer;
        }
        private SwitchPlayerTimer(): void {
            const t: number = this._currentUseTime;
            const r: number = this._userTimer[this._currentPlayer]._usedTime;
            this._userTimer[this._currentPlayer]._usedTime = r - t;
            this._currentUseTime = 0;
            this._currentChessFigureIndex = 0;
            this._cameraController.UpdatePlayer(this._currentPlayer);
        }
        private HandleCameraPosition(): void {
            const _currentFigure: ChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex] as ChessFigure;
            const _transform: f.ComponentTransform = _currentFigure.getComponent(f.ComponentTransform);
            this._cameraController.UpdatePosition(_transform);
        }
        private GetChessFigureMovements(): void {
            const currentChessFigure: ChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex] as ChessFigure;
            const chessPlayerSetting: ChessPlayerSetting = currentChessFigure.GetChessFigureMovement();
            if (this.x === 0) {
                console.log(chessPlayerSetting);
                this.x++;
            }
        }

    }
}