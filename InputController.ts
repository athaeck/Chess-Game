namespace ChessGame {
    import f = FudgeCore;
    export interface UserTime {
        _usedTime: number;
    }
    export type ManageUserTimer = {
        [key in UserType]: UserTime;
    };
    // class SelectedMovement extends GameObject {
    //     constructor() {
    //         super()
    //         // super("CurrentMovementSelected", 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.GROUP_4, new f.MeshSphere);
    //         // const mesh: f.ComponentMesh = this.getComponent(f.ComponentMesh);
    //         // // mesh.mtxPivot.scale(new f.Vector3(0.3, 1, 0.3));
    //         // // this.mtxLocal.translateY(5);
    //         // // this.mtxLocal.translation.y = currentPosition.y;
    //         // this.mtxLocal.rotateX(90);
    //         // let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("Blue")));
    //         // let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
    //         // this.addComponent(componentMaterial);
    //     }
    // }
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
        private _movements: f.ComponentTransform[];
        private _attacks: f.ComponentTransform[];
        private _isMovement: boolean = true;
        private x: number = 0;
        constructor(places: f.Node[], player: ChessPlayer, cameraController: CameraController, maxTime: number, selectionControl: SelectionControl, user: UserType) {
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._userTimer = {
                player: { _usedTime: maxTime },
                enemy: { _usedTime: maxTime }
            };
            this._maxTime = maxTime;
            this._currentPlayer = user;
            this.GetChessFigureMovements();
        }
        public HandleInput(): void {
            this.HandleSelectionControl();
            this.UpdateTimer();
            this.HandleCameraPosition();
            if (this._currentPlayer === UserType.PLAYER) {
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W])) {
                    if (this._movements.length > 0) {
                        this._movementIndex++;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S])) {
                    if (this._movements.length > 0) {
                        this._movementIndex--;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            } else {
                console.log("");
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ENTER])) {
                this.Move();
                this.SelectTimerReset();
                setTimeout(() => {
                    this.GetChessFigureMovements();
                }, 1001)
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.Q])) {
                this._isMovement = true;
                this.PressTimerReset();
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.E])) {
                this._isMovement = false;
                this.PressTimerReset();
            }
            this.ShowSelection();
        }
        public ResetTimer(): void {
            this._userTimer = {
                player: { _usedTime: this._maxTime },
                enemy: { _usedTime: this._maxTime }
            };
            this._currentUseTime = 0;
        }
        private Move(): void {
            const currentFigure: ChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex] as ChessFigure;
            const currentMove: f.ComponentTransform = this._movements[this._movementIndex];
            currentFigure.addComponent(new MovementController(currentMove, this._places, currentFigure.name));
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
            console.log(this._movements);
            if (this._currentChessFigureIndex > this._player[this._currentPlayer].getChildren().length - 1) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex = this._player[this._currentPlayer].getChildren().length - 1;
            }

            if (this._movementIndex > this._movements.length - 1) {
                this._movementIndex = 0;
            }
            if (this._movementIndex < 0) {
                this._movementIndex = this._movements.length - 1;
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
        private ShowSelection(): void {
            if (this._movementIndex < this._movements.length) {
                // const currentMovementPosition: f.Node = this._movements[this._movementIndex].getContainer();
                // // const position: f.Vector3 = new f.Vector3(0, 30, 0);
                // const select: SelectedMovement = new SelectedMovement();
                // currentMovementPosition.addChild(select);
                // f.Time.game.setTimer(1000, 1, () => currentMovementPosition.removeAllChildren());
            }
        }
        private GetChessFigureMovements(): void {
            // console.log("-------------------------------------------");
            const POSSIBLEMOVEMENTS: f.ComponentTransform[] = [];
            const POSSIBLEATTACKS: f.ComponentTransform[] = [];
            let direction: number = 1;
            switch (this._currentPlayer) {
                case UserType.PLAYER:
                    direction = 1;
                    break;
                default:
                    direction = -1;
                    break;
            }
            const currentChessFigure: ChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex] as ChessFigure;
            const chessPlayerSetting: ChessPlayerSetting = currentChessFigure.GetChessFigureMovement();
            const currentPlaceTransform: f.ComponentTransform = currentChessFigure.GetPlace().getComponent(f.ComponentTransform);
            const currentPlace: f.Vector3 = currentPlaceTransform.mtxLocal.translation;
            if (this._isMovement) {
                // let currentMove: number = 0;
                for (const movement of chessPlayerSetting._movement) {
                    if (!movement._scalable) {
                        if (movement._initScale) {
                            for (let i: number = 1; i < 3; i++) {
                                const targetPosition: f.Vector3 = new f.Vector3(Round(direction * i * movement._fieldsX + currentPlace.x, 10), 0, Round(direction * i * movement._fieldsZ + currentPlace.z, 10));
                                for (const place of this._places) {
                                    const placeTrans: f.ComponentTransform = place.getComponent(f.ComponentTransform);
                                    if (Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController: PlaceController = place.getComponent(PlaceController);
                                        if (placeController.IsChessFigureNull()) {
                                            POSSIBLEMOVEMENTS.push(placeTrans);
                                        }
                                        if (!placeController.IsChessFigureNull()) {
                                            if (placeController.GetChessFigure().GetUser() !== this._currentPlayer) {
                                                POSSIBLEMOVEMENTS.push(placeTrans);
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            const targetPosition: f.Vector3 = new f.Vector3(Round(direction * movement._fieldsX + currentPlace.x, 10), 0, Round(direction * movement._fieldsZ + currentPlace.z, 10));
                            for (const place of this._places) {
                                const placeTrans: f.ComponentTransform = place.getComponent(f.ComponentTransform);
                                if (Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                    const placeController: PlaceController = place.getComponent(PlaceController);
                                    if (!placeController.IsChessFigureNull()) {
                                        if (placeController.GetChessFigure().GetUser() !== this._currentPlayer) {
                                            POSSIBLEMOVEMENTS.push(placeTrans);
                                        }
                                    }
                                    if (placeController.IsChessFigureNull()) {
                                        POSSIBLEMOVEMENTS.push(placeTrans);
                                    }
                                }
                            }

                        }
                    } else {
                        let lastFieldReached: boolean = false;
                        let scale: number = 1;
                        while (!lastFieldReached) {
                            const targetPosition: f.Vector3 = new f.Vector3(Round(direction * scale * movement._fieldsX + currentPlace.x, 10), 0, Round(direction * scale * movement._fieldsZ + currentPlace.z, 10));
                            let hit: boolean = false;
                            for (const place of this._places) {
                                const placeTransform: f.ComponentTransform = place.getComponent(f.ComponentTransform);
                                if (Round(placeTransform.mtxLocal.translation.x, 10) === targetPosition.x && Round(placeTransform.mtxLocal.translation.z, 10) === targetPosition.z) {
                                    hit = true;
                                }
                            }
                            if (!hit) {
                                lastFieldReached = true;
                            } else {
                                for (const place of this._places) {
                                    const placeTransform: f.ComponentTransform = place.getComponent(f.ComponentTransform);
                                    if (Round(placeTransform.mtxLocal.translation.x, 10) === targetPosition.x && Round(placeTransform.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController: PlaceController = place.getComponent(PlaceController);
                                        console.log(placeController);
                                        if (!placeController.IsChessFigureNull()) {
                                            if (placeController.GetChessFigure().GetUser() !== this._currentPlayer) {
                                                POSSIBLEMOVEMENTS.push(placeTransform);
                                            }
                                            lastFieldReached = true;
                                            break;
                                        }
                                        if (placeController.IsChessFigureNull()) {
                                            POSSIBLEMOVEMENTS.push(placeTransform);
                                        }
                                    }
                                }
                            }
                            scale++;
                        }
                    }
                    // currentMove++;
                }
            } else {
                console.log(".....");
            }
            this._movements = POSSIBLEMOVEMENTS;
            this._attacks = POSSIBLEATTACKS;
            this.x++;
        }
        private PressTimerReset(): void {
            this.GetChessFigureMovements();
            this._movementIndex = 0;
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => this._clickable = true);
        }
        private SelectTimerReset(): void {
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => this._clickable = true);
            // this.GetChessFigureMovements();
        }
    }
}