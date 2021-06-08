"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class InputController {
        constructor(places, player, cameraController, maxTime, selectionControl, user) {
            this._currentUseTime = 0;
            this._currentPlayer = ChessGame.UserType.PLAYER;
            this._break = false;
            this._currentChessFigureIndex = 0;
            this._clickable = true;
            this._movementIndex = 0;
            this._isMovement = true;
            this.x = 0;
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
        HandleInput() {
            this.HandleSelectionControl();
            this.UpdateTimer();
            this.HandleCameraPosition();
            if (this._currentPlayer === ChessGame.UserType.PLAYER) {
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W])) {
                    if (this._movements.length > 0) {
                        this._movementIndex++;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S])) {
                    if (this._movements.length > 0) {
                        this._movementIndex--;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            }
            else {
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_RIGHT])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_LEFT])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_UP])) {
                    if (this._movements.length > 0) {
                        this._movementIndex++;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_DOWN])) {
                    if (this._movements.length > 0) {
                        this._movementIndex--;
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ENTER])) {
                this.Move();
                this.SelectTimerReset();
                setTimeout(() => {
                    this.GetChessFigureMovements();
                }, 1001);
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
        ResetTimer() {
            this._userTimer = {
                player: { _usedTime: this._maxTime },
                enemy: { _usedTime: this._maxTime }
            };
            this._currentUseTime = 0;
        }
        Move() {
            const currentFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
            const currentMove = this._movements[this._movementIndex];
            currentFigure.addComponent(new ChessGame.MovementController(currentMove, this._places, currentFigure.name));
        }
        HandleSoundController(soundType) {
            const index = this._currentChessFigureIndex;
            let soundFile = "";
            switch (soundType) {
                case ChessGame.SoundType.SELECT_CHESSFIGURE:
                    soundFile = "Beat";
                    break;
                default:
                    soundFile = "Ufo";
                    break;
            }
            const soundController = new ChessGame.SoundController(soundFile);
            this._player[this._currentPlayer].getChildren()[index].addComponent(soundController);
        }
        HandleSelectionControl() {
            if (this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex]) {
                const _currentFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
                const _currentPlace = _currentFigure.GetPlace();
                const v3 = new f.Vector3(_currentPlace.mtxLocal.translation.x, 3, _currentPlace.mtxLocal.translation.z);
                this._selectionControl.mtxLocal.translation = v3;
            }
        }
        CheckIfValidIndex() {
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
        UpdateTimer() {
            if (!this._break) {
                this._currentUseTime++;
                ChessGame.gameState.currentTime = this._currentUseTime;
            }
            // this._userTimer[this._currentPlayer]._usedTime++:
            // this._currentUseTime++;
            // console.log(this._timer)
            // gameState.time = this._timer;
        }
        SwitchPlayerTimer() {
            const t = this._currentUseTime;
            const r = this._userTimer[this._currentPlayer]._usedTime;
            this._userTimer[this._currentPlayer]._usedTime = r - t;
            this._currentUseTime = 0;
            this._currentChessFigureIndex = 0;
            this._cameraController.UpdatePlayer(this._currentPlayer);
        }
        HandleCameraPosition() {
            const _currentFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
            const _transform = _currentFigure.getComponent(f.ComponentTransform);
            this._cameraController.UpdatePosition(_transform);
        }
        ShowSelection() {
            if (this._movementIndex < this._movements.length) {
                const currentMovementPosition = this._movements[this._movementIndex].getContainer();
                // // const position: f.Vector3 = new f.Vector3(0, 30, 0);
                // const select: SelectedMovement = new SelectedMovement();
                currentMovementPosition.addChild(new ChessGame.MovementSelection());
                // f.Time.game.setTimer(1000, 1, () => currentMovementPosition.removeAllChildren());
            }
        }
        GetChessFigureMovements() {
            // console.log("-------------------------------------------");
            const POSSIBLEMOVEMENTS = [];
            const POSSIBLEATTACKS = [];
            let direction = 1;
            switch (this._currentPlayer) {
                case ChessGame.UserType.PLAYER:
                    direction = 1;
                    break;
                default:
                    direction = -1;
                    break;
            }
            const currentChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
            const chessPlayerSetting = currentChessFigure.GetChessFigureMovement();
            const currentPlaceTransform = currentChessFigure.GetPlace().getComponent(f.ComponentTransform);
            const currentPlace = currentPlaceTransform.mtxLocal.translation;
            if (this._isMovement) {
                // let currentMove: number = 0;
                for (const movement of chessPlayerSetting._movement) {
                    if (!movement._scalable) {
                        if (movement._initScale) {
                            for (let i = 1; i < 3; i++) {
                                const targetPosition = new f.Vector3(ChessGame.Round(direction * i * movement._fieldsX + currentPlace.x, 10), 0, ChessGame.Round(direction * i * movement._fieldsZ + currentPlace.z, 10));
                                for (const place of this._places) {
                                    const placeTrans = place.getComponent(f.ComponentTransform);
                                    if (ChessGame.Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController = place.getComponent(ChessGame.PlaceController);
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
                        }
                        else {
                            const targetPosition = new f.Vector3(ChessGame.Round(direction * movement._fieldsX + currentPlace.x, 10), 0, ChessGame.Round(direction * movement._fieldsZ + currentPlace.z, 10));
                            for (const place of this._places) {
                                const placeTrans = place.getComponent(f.ComponentTransform);
                                if (ChessGame.Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                    const placeController = place.getComponent(ChessGame.PlaceController);
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
                    }
                    else {
                        let lastFieldReached = false;
                        let scale = 1;
                        while (!lastFieldReached) {
                            const targetPosition = new f.Vector3(ChessGame.Round(direction * scale * movement._fieldsX + currentPlace.x, 10), 0, ChessGame.Round(direction * scale * movement._fieldsZ + currentPlace.z, 10));
                            let hit = false;
                            for (const place of this._places) {
                                const placeTransform = place.getComponent(f.ComponentTransform);
                                if (ChessGame.Round(placeTransform.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTransform.mtxLocal.translation.z, 10) === targetPosition.z) {
                                    hit = true;
                                }
                            }
                            if (!hit) {
                                lastFieldReached = true;
                            }
                            else {
                                for (const place of this._places) {
                                    const placeTransform = place.getComponent(f.ComponentTransform);
                                    if (ChessGame.Round(placeTransform.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTransform.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController = place.getComponent(ChessGame.PlaceController);
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
            }
            else {
                console.log(".....");
            }
            this._movements = POSSIBLEMOVEMENTS;
            this._attacks = POSSIBLEATTACKS;
            this.x++;
        }
        PressTimerReset() {
            this.GetChessFigureMovements();
            this._movementIndex = 0;
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => this._clickable = true);
        }
        SelectTimerReset() {
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => this._clickable = true);
            // this.GetChessFigureMovements();
        }
    }
    ChessGame.InputController = InputController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=InputController.js.map