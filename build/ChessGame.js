"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class CameraController extends f.ComponentScript {
        constructor(userType) {
            super();
            this.x = 0;
            this._user = userType;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        UpdatePosition(currentChessFigure) {
            this._transformComponent.mtxLocal.lookAt(currentChessFigure.mtxLocal.translation, new f.Vector3(0, 1, 0));
            if (this.x === 0) {
                this.x++;
            }
        }
        UpdatePlayer(currentPlayer) {
            let vector3;
            switch (currentPlayer) {
                case ChessGame.UserType.PLAYER:
                    // this._transformComponent.mtxLocal.translation
                    vector3 = new f.Vector3(-7, 10, 0);
                    break;
                default:
                    vector3 = new f.Vector3(7, 10, 0);
                    break;
            }
            this._transformComponent.mtxLocal.translation = vector3;
        }
        Created() {
            this._transformComponent = this.getContainer().getComponent(f.ComponentTransform);
            this.UpdatePlayer(this._user);
        }
    }
    ChessGame.CameraController = CameraController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class GameObject extends f.Node {
        constructor(name, mass, type, collider, groupe, mesh) {
            super(name);
            this.addComponent(new f.ComponentTransform());
            this.addComponent(new f.ComponentMesh(mesh));
            this.addComponent(new f.ComponentRigidbody(mass, type, collider, groupe));
        }
    }
    ChessGame.GameObject = GameObject;
})(ChessGame || (ChessGame = {}));
///<reference path="./GameObject.ts"/>
var ChessGame;
///<reference path="./GameObject.ts"/>
(function (ChessGame) {
    var f = FudgeCore;
    class ChessFigure extends ChessGame.GameObject {
        constructor(name, mass, pysicsType, colliderType, group, place, user) {
            super(name, mass, pysicsType, colliderType, group, new f.MeshSphere);
            this._timerOn = false;
            this._place = place;
            this._user = user;
            let posY = 0;
            let componentMesh = this.getComponent(f.ComponentMesh);
            if (name === "Bauer") {
                posY = this._place.mtxLocal.translation.y + 0.5;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 1, 0.8));
            }
            else {
                posY = this._place.mtxLocal.translation.y + 1;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            }
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user.GetPlayerType() === ChessGame.UserType.PLAYER ? "Black" : "White")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            // this.addComponent(new CollisionController())
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, posY, this._place.mtxLocal.translation.z));
            this.HandleMoveData(name);
        }
        SetPlace(place) {
            this._place = place;
        }
        GetPlace() {
            return this._place;
        }
        MoveFigure(movementController) {
            this.addComponent(movementController);
        }
        DeleteMovementController() {
            console.log();
        }
        GetChessFigureMovement() {
            return this._move;
        }
        UpdateInitScale() {
            this._move._movement[0]._initScale = false;
        }
        GetUser() {
            return this._user;
        }
        SetDeathTimer() {
            if (!this._timerOn) {
                setTimeout(() => {
                    this._user.RemoveFigure(this);
                }, 1000);
            }
            this._timerOn = true;
        }
        async HandleMoveData(name) {
            this._move = await ChessGame.DataController.Instance.GetMovementData(name);
        }
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    class ChessPlayer {
        constructor(chessFigures, type, timeController) {
            this._graveYard = [];
            this._chessFigures = chessFigures;
            this._type = type;
            this._timeController = timeController;
        }
        GetFigures() {
            return this._chessFigures.getChildren();
        }
        GetTimeController() {
            return this._timeController;
        }
        GetPlayerType() {
            return this._type;
        }
        RemoveFigure(figure) {
            this._graveYard.push(figure.name);
            const cmps = figure.getAllComponents();
            for (const cmp of cmps) {
                figure.removeComponent(cmp);
            }
            this._chessFigures.removeChild(figure);
        }
        AddFigure(figure) {
            this._chessFigures.appendChild(figure);
        }
    }
    ChessGame.ChessPlayer = ChessPlayer;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class CollisionController extends f.ComponentScript {
        // private _parent: ChessFigure;
        // private _target: f.Vector3;
        constructor() {
            super();
            this.singleton = true;
            // this._target = target;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        Remove() {
            this.getContainer().removeComponent(this);
        }
        Created(event) {
            this.getContainer().getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.HandleCollision.bind(this));
        }
        HandleCollision(event) {
            console.log(ChessGame.State.Instance.User);
            const parent = event.cmpRigidbody.container;
            console.log(parent);
            const target = event.target.container;
            console.log(target);
            if (parent && target) {
                if (ChessGame.State.Instance.User === parent.GetUser().GetPlayerType()) {
                    if (parent.GetUser().GetPlayerType() !== target.GetUser().GetPlayerType()) {
                        target.SetDeathTimer();
                    }
                }
            }
        }
    }
    ChessGame.CollisionController = CollisionController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    class DataController {
        constructor() {
            this._chessFigureSetting = "./data/ChessFigureSetting.json";
            this._chessFigures = "./data/ChessFigures.json";
            this._gameSetting = "./data/GameSetting.json";
        }
        static get Instance() {
            return this._instance || (this._instance = new this());
        }
        async GetMovementData(name) {
            let res = await fetch(this._chessFigureSetting);
            let resBody = await res.json();
            return resBody[name];
        }
        async GetSound(type) {
            const setting = await (await this.GetGameSetting()).Sound;
            return setting[type];
        }
        async GetGameSetting() {
            const setting = await (await fetch(this._gameSetting)).json();
            return setting;
        }
    }
    ChessGame.DataController = DataController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    let UserType;
    (function (UserType) {
        UserType["PLAYER"] = "player";
        UserType["ENEMY"] = "enemy";
    })(UserType = ChessGame.UserType || (ChessGame.UserType = {}));
    let SoundType;
    (function (SoundType) {
        SoundType["SELECT_FIGURE"] = "SELECT_FIGURE";
        SoundType["SELECT_FIELD"] = "SELECT_FIELD";
        SoundType["HIT"] = "HIT";
        SoundType["ATMO"] = "ATMO";
        SoundType["TIME"] = "TIME";
        SoundType["MOVE"] = "MOVE";
    })(SoundType = ChessGame.SoundType || (ChessGame.SoundType = {}));
    let SettingType;
    (function (SettingType) {
        SettingType["Sound"] = "Sound";
        SettingType["Time"] = "Time";
        SettingType["SoundSetting"] = "SoundSetting";
        SettingType["Input"] = "Input";
    })(SettingType = ChessGame.SettingType || (ChessGame.SettingType = {}));
})(ChessGame || (ChessGame = {}));
///<reference path="./enum.ts"/>
var ChessGame;
///<reference path="./enum.ts"/>
(function (ChessGame) {
    var f = FudgeCore;
    const CHESSFIGURES = [
        "Turm", "Springer", "Läufer", "Dame", "König", "Läufer", "Springer", "Turm", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer"
    ];
    let _root;
    let _player;
    let _viewport;
    let _canvas;
    let _camera;
    let _gameController;
    let _cameraController;
    let _places = [];
    let _surface;
    let _chessPlayer;
    let _selectionControl;
    let _startUserPlayer = ChessGame.UserType.PLAYER;
    let _inputSetting;
    window.addEventListener("load", Start);
    class GameController {
        constructor(chessPlayer, places, cameraController, selctionController, root) {
            this._enemyOnTheWay = false;
            const random = new f.Random().getRange(0, 11);
            this._chessPlayer = chessPlayer;
            this._currentUser = random > 5 ? ChessGame.UserType.PLAYER : ChessGame.UserType.ENEMY;
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController = new ChessGame.InputController(places, chessPlayer, cameraController, selctionController, this._currentUser);
            this._root = root;
            this._soundController = new ChessGame.SoundController(ChessGame.SoundType.TIME);
            this._root.addComponent(this._soundController);
        }
        HandleGame() {
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController.UpdateCurrentUser(this._currentUser);
            this._inputController.HandleInput();
            this.WatchMovementController();
            this.DeSpawnEnemy();
            this.HandleFinishMove();
        }
        WatchMovementController() {
            for (const figure of this._chessPlayer[this._currentUser].GetFigures()) {
                const movementController = figure.getComponent(ChessGame.MovementController);
                if (movementController) {
                    this._enemyOnTheWay = movementController.EnemyOnTheWay;
                    this._collidingEnemy = movementController.CollidingEnemy;
                }
            }
        }
        DeSpawnEnemy() {
            let enemy;
            switch (this._currentUser) {
                case ChessGame.UserType.ENEMY:
                    enemy = ChessGame.UserType.PLAYER;
                    break;
                default:
                    enemy = ChessGame.UserType.ENEMY;
                    break;
            }
            if (this._enemyOnTheWay) {
                for (const figure of this._chessPlayer[enemy].GetFigures()) {
                    if (this._enemyOnTheWay) {
                        if (figure !== this._collidingEnemy) {
                            figure.getAllComponents().forEach((item) => {
                                item.activate(false);
                            });
                            figure.activate(false);
                        }
                    }
                }
            }
        }
        HandleFinishMove() {
            if (this._inputController.GetSelectionState()) {
                this._playerTimeController.StoppTimer();
                this._soundController.Delete();
                this._enemyOnTheWay = false;
                switch (this._currentUser) {
                    case ChessGame.UserType.PLAYER:
                        this._currentUser = ChessGame.UserType.ENEMY;
                        break;
                    default:
                        this._currentUser = ChessGame.UserType.PLAYER;
                        break;
                }
                for (const figure of this._chessPlayer[this._currentUser].GetFigures()) {
                    figure.activate(true);
                    figure.getAllComponents().forEach((item) => {
                        item.activate(true);
                    });
                }
                ChessGame.State.Instance.SetUser = this._currentUser;
                this._playerTimeController.StartTimer();
                this._root.addComponent(this._soundController);
            }
        }
        HandleMovements() {
            const projectiles = [];
            for (const figure of this._chessPlayer[this._currentUser].GetFigures()) {
                // for(const proj)
                if (figure.getChildren().length > 0) {
                    for (const prj of figure.getChildren()) {
                        projectiles.push(prj);
                    }
                }
            }
            for (const projectile of projectiles) {
                projectile.Move();
            }
        }
    }
    ChessGame.GameController = GameController;
    async function Start(event) {
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        _root = FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];
        _inputSetting = await (await ChessGame.DataController.Instance.GetGameSetting()).Input;
        StartChessMatch();
    }
    function StartChessMatch() {
        InitWorld();
        InitCamera();
        InitAvatar();
        InitController();
        f.Physics.adjustTransforms(_root, true);
        _canvas = document.querySelector("canvas");
        _viewport = new f.Viewport();
        _viewport.initialize("Viewport", _root, _camera._componentCamera, _canvas);
        ChessGame.Hud.start();
        if (_inputSetting.mouseLock) {
            _canvas.addEventListener("click", _canvas.requestPointerLock);
        }
        console.log(_root);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, HandleGame);
        f.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
    }
    function InitCamera() {
        _cameraController = new ChessGame.CameraController(_startUserPlayer);
        const camera = {
            _node: new f.Node("Camera"),
            _componentCamera: new f.ComponentCamera()
        };
        camera._node.addComponent(camera._componentCamera);
        camera._node.addComponent(new f.ComponentTransform(new f.Matrix4x4));
        camera._node.addComponent(_cameraController);
        _camera = camera;
    }
    function InitAvatar() {
        const player = {
            _rigidbody: null,
            _avatar: new f.Node("Player")
        };
        player._rigidbody = new f.ComponentRigidbody(0.1, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CAPSULE, f.PHYSICS_GROUP.DEFAULT);
        player._rigidbody.restitution = 0.5;
        player._rigidbody.rotationInfluenceFactor = f.Vector3.ZERO();
        player._rigidbody.friction = 2;
        player._avatar.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0, 0))));
        player._avatar.addComponent(new f.ComponentAudioListener());
        player._avatar.appendChild(_camera._node);
        ƒ.AudioManager.default.listenTo(_root);
        _player = player;
        _root.appendChild(_player._avatar);
    }
    function InitWorld() {
        const surface = _root.getChildrenByName("Surface")[0];
        surface.addComponent(new ƒ.ComponentRigidbody(0, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT));
        _surface = surface;
        const figures = _root.getChildrenByName("Figures")[0];
        const playerF = figures.getChildrenByName("Player")[0];
        const enemyF = figures.getChildrenByName("Enemy")[0];
        const places = _root.getChildrenByName("Places")[0];
        const player = new ChessGame.ChessPlayer(playerF, ChessGame.UserType.PLAYER, new ChessGame.TimeController());
        const enemy = new ChessGame.ChessPlayer(enemyF, ChessGame.UserType.ENEMY, new ChessGame.TimeController());
        _places = places.getChildren();
        for (let place of _places) {
            const rigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
            rigidbody.mtxPivot.scaleZ(0.1);
            place.addComponent(rigidbody);
            place.addComponent(new ChessGame.PlaceController());
        }
        for (let i = 0; i < 16; i++) {
            const place = _places[i];
            const placeController = place.getComponent(ChessGame.PlaceController);
            const chessFigure = new ChessGame.ChessFigure(CHESSFIGURES[i], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, player);
            placeController.SetChessFigure(chessFigure);
            playerF.addChild(chessFigure);
        }
        let index = 0;
        for (let i = _places.length - 1; i > _places.length - 17; i--) {
            const place = _places[i];
            const placeController = place.getComponent(ChessGame.PlaceController);
            const chessFigure = new ChessGame.ChessFigure(CHESSFIGURES[index], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, enemy);
            placeController.SetChessFigure(chessFigure);
            enemyF.addChild(chessFigure);
            index++;
        }
        const CHESSPLAYER = {
            player,
            enemy
        };
        _chessPlayer = CHESSPLAYER;
    }
    function InitController() {
        _selectionControl = new ChessGame.SelectionControl();
        _gameController = new GameController(_chessPlayer, _places, _cameraController, _selectionControl, _root);
        _root.appendChild(_selectionControl);
        _root.addComponent(new ChessGame.SoundController(ChessGame.SoundType.ATMO));
    }
    function HandleGame(event) {
        _gameController.HandleGame();
        ƒ.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
        _viewport.draw();
    }
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class InputController {
        constructor(places, player, cameraController, selectionControl, user) {
            this._currentChessFigureIndex = 0;
            this._clickable = true;
            this._movementIndex = 0;
            this._attackIndex = 0;
            this._isMovement = true;
            // private x: number = 0;
            this._selectionFinished = false;
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._currentPlayer = user;
            this._cameraController.UpdatePlayer(this._currentPlayer);
            this.GetChessFigureMovements();
            console.log("InputController", this);
        }
        UpdateCurrentUser(user) {
            if (user !== this._currentPlayer) {
                this._cameraController.UpdatePlayer(user);
                this._selectionFinished = false;
            }
            this._currentPlayer = user;
            this.GetChessFigureMovements();
        }
        GetCurrentUser() {
            return this._currentPlayer;
        }
        GetSelectionState() {
            return this._selectionFinished;
        }
        HandleInput() {
            this.HandleSelectionControl();
            this.HandleCameraPosition();
            if (this._currentPlayer === ChessGame.UserType.PLAYER) {
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W])) {
                    if (this._isMovement) {
                        if (this._movements.length > 0) {
                            this._movementIndex++;
                        }
                    }
                    else {
                        if (this._attacks.length > 0) {
                            this._attackIndex++;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S])) {
                    if (this._isMovement) {
                        if (this._movements.length > 0) {
                            this._movementIndex--;
                        }
                    }
                    else {
                        if (this._attacks.length > 0) {
                            this._attackIndex--;
                        }
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
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_LEFT])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_UP])) {
                    if (this._isMovement) {
                        if (this._movements.length > 0) {
                            this._movementIndex++;
                        }
                    }
                    else {
                        if (this._attacks.length > 0) {
                            this._attackIndex++;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_DOWN])) {
                    if (this._isMovement) {
                        if (this._movements.length > 0) {
                            this._movementIndex--;
                        }
                    }
                    else {
                        if (this._attacks.length > 0) {
                            this._attackIndex--;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(ChessGame.SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.Q])) {
                this._isMovement = !this._isMovement;
                this.PressTimerReset();
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.E])) {
                this._isMovement = !this._isMovement;
                this.PressTimerReset();
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ENTER])) {
                this.Move();
                this.SelectTimerReset();
                setTimeout((ref) => {
                    this._selectionFinished = true;
                    this._currentChessFigureIndex = 0;
                    this._attackIndex = 0;
                    ref.getComponent(ChessGame.MovementController).EndMovement();
                }, 1200, this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex]);
            }
            this.ShowSelection();
        }
        Move() {
            const movementController = new ChessGame.MovementController();
            const currentFigure = this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex];
            let currentMove;
            if (this._isMovement) {
                if (this._movements.length > 0) {
                    currentMove = this._movements[this._movementIndex];
                }
            }
            else {
                if (this._attacks.length > 0) {
                    currentMove = this._attacks[this._attackIndex];
                }
            }
            if (currentMove) {
                movementController.Init(currentMove, this._places, currentFigure.name);
                currentFigure.addComponent(movementController);
            }
        }
        HandleSoundController(soundType) {
            const index = this._currentChessFigureIndex;
            const soundController = new ChessGame.SoundController(soundType);
            this._player[this._currentPlayer].GetFigures()[index].addComponent(soundController);
        }
        HandleSelectionControl() {
            // Hud.
            ChessGame.gameState.player = this._currentPlayer;
            if (this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex]) {
                const _currentFigure = this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex];
                const _currentPlace = _currentFigure.GetPlace();
                const v3 = new f.Vector3(_currentPlace.mtxLocal.translation.x, 3, _currentPlace.mtxLocal.translation.z);
                this._selectionControl.mtxLocal.translation = v3;
            }
        }
        CheckIfValidIndex() {
            console.log(this._attacks);
            console.log(this._movements);
            if (this._currentChessFigureIndex > this._player[this._currentPlayer].GetFigures().length - 1) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex = this._player[this._currentPlayer].GetFigures().length - 1;
            }
            if (this._movementIndex > this._movements.length - 1) {
                this._movementIndex = 0;
            }
            if (this._movementIndex < 0) {
                this._movementIndex = this._movements.length - 1;
            }
        }
        HandleCameraPosition() {
            const _currentFigure = this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex];
            const _transform = _currentFigure.getComponent(f.ComponentTransform);
            this._cameraController.UpdatePosition(_transform);
        }
        ShowSelection() {
            if (this._isMovement) {
                if (this._movementIndex < this._movements.length) {
                    const currentMovementPosition = this._movements[this._movementIndex].getContainer();
                    const transform = currentMovementPosition.getComponent(f.ComponentTransform);
                    this._cameraController.UpdatePosition(transform);
                    currentMovementPosition.addChild(new ChessGame.MovementSelection());
                }
            }
            else {
                if (this._attackIndex < this._attacks.length) {
                    const currentAttackPosition = this._attacks[this._attackIndex].getContainer();
                    const transform = currentAttackPosition.getComponent(f.ComponentTransform);
                    this._cameraController.UpdatePosition(transform);
                    currentAttackPosition.addChild(new ChessGame.MovementSelection());
                }
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
            const currentChessFigure = this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex];
            // console.log(currentChessFigure)
            const chessPlayerSetting = currentChessFigure.GetChessFigureMovement();
            const currentPlaceTransform = currentChessFigure.GetPlace().getComponent(f.ComponentTransform);
            const currentPlace = currentPlaceTransform.mtxLocal.translation;
            if (chessPlayerSetting != undefined) {
                if (this._isMovement) {
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
                                                if (placeController.GetChessFigure().GetUser().GetPlayerType() !== this._currentPlayer) {
                                                    POSSIBLEMOVEMENTS.push(placeTrans);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                // console.log("....")
                                const targetPosition = new f.Vector3(ChessGame.Round(direction * movement._fieldsX + currentPlace.x, 10), 0, ChessGame.Round(direction * movement._fieldsZ + currentPlace.z, 10));
                                for (const place of this._places) {
                                    const placeTrans = place.getComponent(f.ComponentTransform);
                                    if (ChessGame.Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController = place.getComponent(ChessGame.PlaceController);
                                        if (!placeController.IsChessFigureNull() && currentChessFigure.name !== "Bauer") {
                                            if (placeController.GetChessFigure().GetUser().GetPlayerType() !== this._currentPlayer) {
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
                                            // console.log(placeController);
                                            if (!placeController.IsChessFigureNull()) {
                                                if (placeController.GetChessFigure().GetUser().GetPlayerType() !== this._currentPlayer) {
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
                    // console.log(".....");
                    if (chessPlayerSetting._attack !== null) {
                        for (const attack of chessPlayerSetting._attack) {
                            if (!attack._scalable) {
                                const targetPosition = new f.Vector3(ChessGame.Round(direction * attack._fieldsX + currentPlace.x, 10), 0, ChessGame.Round(direction * attack._fieldsZ + currentPlace.z, 10));
                                for (const place of this._places) {
                                    const placeTrans = place.getComponent(f.ComponentTransform);
                                    if (ChessGame.Round(placeTrans.mtxLocal.translation.x, 10) === targetPosition.x && ChessGame.Round(placeTrans.mtxLocal.translation.z, 10) === targetPosition.z) {
                                        const placeController = place.getComponent(ChessGame.PlaceController);
                                        if (!placeController.IsChessFigureNull()) {
                                            if (placeController.GetChessFigure().GetUser().GetPlayerType() !== this._currentPlayer) {
                                                POSSIBLEATTACKS.push(placeTrans);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        this._isMovement = true;
                    }
                }
            }
            this._movements = POSSIBLEMOVEMENTS;
            this._attacks = POSSIBLEATTACKS;
            // this.x++;
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
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class MovementController extends f.ComponentScript {
        constructor() {
            super();
            this._enemyOnTheWay = false;
            this.singleton = true;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Start.bind(this));
        }
        get EnemyOnTheWay() {
            return this._enemyOnTheWay;
        }
        get CollidingEnemy() {
            return this._collidingEnemy;
        }
        Init(target, places, name) {
            this._name = name;
            this._target = target;
            this._places = places;
        }
        EndMovement() {
            this._enemyOnTheWay = false;
            this._collidingEnemy = null;
            this._body.physicsType = f.PHYSICS_TYPE.KINEMATIC;
            this._body.mass = 1;
            this._body.restitution = 0.5;
            this.getContainer().getComponent(ChessGame.CollisionController).Remove();
            this.getContainer().removeComponent(this);
        }
        Start() {
            this._parent = this.getContainer();
            this._body = this._parent.getComponent(f.ComponentRigidbody);
            this._start = this._parent.GetPlace().getComponent(f.ComponentTransform);
            this._parent.addComponent(new ChessGame.CollisionController());
            this.CheckIfEnemyOccupyWay();
            //     // this._start = this.getContainer().getComponent(f.ComponentTransform);
            //     // this._body = this.getContainer().getComponent(f.ComponentRigidbody);
            //     // this._parent = this.getContainer() as ChessFigure;
            //     // this._parent.addComponent(new SoundController(SoundType.MOVE));
            //     // this._parent.addComponent(this._collisionController);
            //     // this.Move();
            this.HandleMove();
        }
        HandleMove() {
            this._body.physicsType = f.PHYSICS_TYPE.DYNAMIC;
            this._body.mass = 5;
            this._body.restitution = 0;
            const toTranslate = new f.Vector3(this._target.mtxLocal.translation.x - this._start.mtxLocal.translation.x, 0, this._target.mtxLocal.translation.z - this._start.mtxLocal.translation.z);
            switch (this._name) {
                case "Springer":
                    // this._body.applyLinearImpulse(new f.Vector3(0, 5, 0));
                    break;
                case "Bauer":
                    this._parent.UpdateInitScale();
                    break;
                default:
                    break;
            }
            this._body.translateBody(toTranslate);
            const newPlaceController = this._target.getContainer().getComponent(ChessGame.PlaceController);
            const currentPlaceController = this._parent.GetPlace().getComponent(ChessGame.PlaceController);
            currentPlaceController.RemoveChessFigure();
            newPlaceController.SetChessFigure(this._parent);
        }
        CheckIfEnemyOccupyWay() {
            const targetVector = this._target.mtxLocal.translation;
            for (const place of this._places) {
                const transform = place.getComponent(f.ComponentTransform);
                if (ChessGame.Round(transform.mtxLocal.translation.x, 10) === ChessGame.Round(targetVector.x, 10) && ChessGame.Round(transform.mtxLocal.translation.z, 10) === ChessGame.Round(targetVector.z, 10)) {
                    const placeController = place.getComponent(ChessGame.PlaceController);
                    const chessFigure = placeController.GetChessFigure();
                    if (chessFigure) {
                        if (this._parent.GetUser().GetPlayerType() !== chessFigure.GetUser().GetPlayerType()) {
                            // this._enemyOnWay = true;
                            // this._freeWayCheck = false;
                            this._enemyOnTheWay = true;
                            chessFigure.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.DYNAMIC;
                            chessFigure.getComponent(f.ComponentRigidbody).friction = 0;
                            this._collidingEnemy = chessFigure;
                        }
                    }
                }
            }
        }
    }
    ChessGame.MovementController = MovementController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class MovementSelection extends ChessGame.GameObject {
        constructor() {
            super("MovementSelection", 1, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.SPHERE, f.PHYSICS_GROUP.GROUP_4, new f.MeshSphere);
            const body = this.getComponent(f.ComponentRigidbody);
            this.removeComponent(body);
            const mesh = this.getComponent(f.ComponentMesh);
            mesh.mtxPivot.scale(new f.Vector3(0.3, 0.3, 0.3));
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.addEventListener("childAppend" /* CHILD_APPEND */, this.HandleRemove.bind(this));
        }
        HandleRemove(event) {
            setTimeout(() => {
                this.getParent().removeChild(this);
            }, 50);
        }
    }
    ChessGame.MovementSelection = MovementSelection;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class PlaceController extends f.ComponentScript {
        constructor(chessFigure = null) {
            super();
            this._chessFigure = chessFigure;
        }
        GetChessFigure() {
            return this._chessFigure;
        }
        SetChessFigure(chessFigure = null) {
            chessFigure.SetPlace(this?.getContainer());
            this._chessFigure = chessFigure;
        }
        IsChessFigureNull() {
            return this._chessFigure === null ? true : false;
        }
        RemoveChessFigure() {
            this._chessFigure.SetPlace(null);
            this._chessFigure = null;
        }
    }
    ChessGame.PlaceController = PlaceController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class Projectile extends ChessGame.GameObject {
        constructor(target) {
            super("Projectile", 1, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CAPSULE, f.PHYSICS_GROUP.DEFAULT, new f.MeshSphere());
            this._speed = 10;
            let componentMesh = this.getComponent(f.ComponentMesh);
            componentMesh.mtxPivot.scale(new f.Vector3(0.4, 0.5, 0.4));
            // this.mtxLocal.lookAt(this._target)
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("BLUE")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this._target = target;
            this.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.HandleCollision.bind(this));
            console.log(this);
        }
        Move() {
            this.mtxLocal.translate(new f.Vector3(this._target.x / this._speed, 1 / this._speed, this._target.z / this._speed));
        }
        HandleCollision(event) {
            console.log(event);
        }
    }
    ChessGame.Projectile = Projectile;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SelectionControl extends ChessGame.GameObject {
        constructor() {
            super("Selection", 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.PYRAMID, f.PHYSICS_GROUP.DEFAULT, new f.MeshPyramid);
            const mesh = this.getComponent(f.ComponentMesh);
            mesh.mtxPivot.scale(new f.Vector3(0.7, 0.5, 0.7));
            this.mtxLocal.translateY(3);
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("Grey")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
        }
    }
    ChessGame.SelectionControl = SelectionControl;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class SoundController extends f.ComponentScript {
        constructor(type) {
            super();
            this._type = type;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        Delete() {
            if (this._soundSettings.withSound) {
                this.getContainer().removeComponent(this._soundComponent);
                this.getContainer().removeComponent(this);
            }
        }
        async FetchData(type) {
            this._setting = await ChessGame.DataController.Instance.GetSound(type);
            this._soundSettings = await (await ChessGame.DataController.Instance.GetGameSetting()).SoundSetting;
        }
        async Created(event) {
            await this.FetchData(this._type);
            if (this._soundSettings.withSound) {
                const audio = new f.Audio(`./audio/${this._setting.name}.mp3`);
                this._soundComponent = new f.ComponentAudio(audio, this._setting.loop);
                this.getContainer().addComponent(this._soundComponent);
                this._soundComponent.volume = this._setting.volume;
                this._soundComponent.play(true);
                setTimeout(() => {
                    if (!this._soundComponent.isPlaying) {
                        this.Delete();
                    }
                }, 2000);
            }
        }
    }
    ChessGame.SoundController = SoundController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    class State {
        constructor() {
        }
        static get Instance() {
            return this._instance || (this._instance = new this());
        }
        set SetUser(user) {
            this.activeUser = user;
        }
        get User() {
            return this.activeUser;
        }
    }
    ChessGame.State = State;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    class TimeController {
        constructor() {
            this._count = false;
            this._currentUseTime = 0;
        }
        StartTimer() {
            this._count = true;
        }
        StoppTimer() {
            this._count = false;
            this._remainTime = this._remainTime - this._currentUseTime;
            this._currentUseTime = 0;
        }
        Count() {
            if (this._count) {
                this._currentUseTime++;
            }
        }
        IsEnoughRemianTime() {
            return this._remainTime > 0 ? true : false;
        }
    }
    ChessGame.TimeController = TimeController;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    var fui = FudgeUserInterface;
    var f = FudgeCore;
    class GameState extends f.Mutable {
        constructor() {
            super(...arguments);
            // public hits: number = 0;
            this.time = 120;
            this.player = "player";
            this.currentTime = 0;
        }
        reduceMutator(_mutator) { }
    }
    ChessGame.gameState = new GameState();
    class Hud {
        static start() {
            let domHud = document.querySelector("div#ui-wrapper");
            Hud.controller = new fui.Controller(ChessGame.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    ChessGame.Hud = Hud;
})(ChessGame || (ChessGame = {}));
var ChessGame;
(function (ChessGame) {
    function Round(number, place) {
        const zahl = (Math.round(number * place) / place);
        return zahl;
    }
    ChessGame.Round = Round;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessGame.js.map