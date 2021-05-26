"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class InputController {
        constructor(places, player, cameraController, maxTime, selectionControl) {
            this._currentUseTime = 0;
            this._currentPlayer = ChessGame.UserType.PLAYER;
            this._break = false;
            this._currentChessFigureIndex = 0;
            this._clickable = true;
            console.log("");
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
        HandleInput() {
            this.HandleSelectionControl();
            this.UpdateTimer();
            if (this._currentPlayer === ChessGame.UserType.PLAYER) {
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }
            }
            // if (this._currentChessFigureIndex <= this._player[this._currentPlayer].getChildren().length - 1 && this._currentChessFigureIndex >= 0) {
            //     // this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex].getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.DYNAMIC;
            //     // this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex].getComponent(f.ComponentRigidbody).setVelocity(new f.Vector3(0, 5, 0));
            //     // ƒ.Time.game.setTimer(100, 1, () => this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex].getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.KINEMATIC);
            // }
        }
        ResetTimer() {
            this._userTimer = {
                player: { _usedTime: this._maxTime },
                enemy: { _usedTime: this._maxTime }
            };
            this._currentUseTime = 0;
        }
        // private HandleEvents(): void{
        //     this._currentChessFigureIndex.
        // }
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
            // console.log(this._currentChessFigureIndex);
            if (this._currentChessFigureIndex > this._player[this._currentPlayer].getChildren().length - 1) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex = this._player[this._currentPlayer].getChildren().length - 1;
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
        }
    }
    ChessGame.InputController = InputController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=InputController.js.map