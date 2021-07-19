///<reference path="./enum.ts"/>
namespace ChessGame {
    import f = FudgeCore;

    export interface Player {
        _rigidbody: f.ComponentRigidbody;
        _avatar: f.Node;
    }
    export interface Camera {
        _node: f.Node;
        _componentCamera: f.ComponentCamera;
    }
    const CHESSFIGURES: string[] = [
        "Turm", "Springer", "Läufer", "Dame", "König", "Läufer", "Springer", "Turm", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer"
    ];
    export interface GameEnd{
        _winner: UserType;
    }
    let _root: f.Graph;
    let _player: Player;
    let _viewport: f.Viewport;
    let _canvas: HTMLCanvasElement;
    let _camera: Camera;
    let _gameController: GameController;
    let _cameraController: CameraController;
    let _places: f.Node[] = [];
    let _surface: f.Node;
    let _chessPlayer: ChessPlayers;
    let _selectionControl: SelectionControl;
    let _startUserPlayer: UserType = UserType.PLAYER;
    let _inputSetting: Input;
    let _playerName: string = "";
    let _enemyName: string = "";

    window.addEventListener("load", Init);
    export class GameController {
        private _inputController: InputController;
        private _currentUser: UserType;
        private _chessPlayer: ChessPlayers;
        private _playerTimeController: TimeController;
        private _root: f.Graph;
        private _soundController: SoundController;
        private _duellMode: boolean = false;
        private _duellController: DuellController;
        private _cameraController: CameraController;
        private _checkmate: boolean = false;
        private _finished: boolean = false;
        private _winner: GameEnd;
        constructor(chessPlayer: ChessPlayers, places: f.Node[], cameraController: CameraController, selctionController: SelectionControl, root: f.Graph) {
            const random: number = new f.Random().getRange(0, 11);
            this._chessPlayer = chessPlayer;
            this._currentUser = random > 5 ? UserType.PLAYER : UserType.ENEMY;
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._root = root;
            this._soundController = new SoundController(SoundType.TIME);
            this._root.addComponent(this._soundController);
            this._cameraController = cameraController;
            this._duellController = null;
            this._inputController = new InputController(places, chessPlayer, cameraController, selctionController, this._currentUser, this);
            console.log(this);
        }
        public HandleGame(): void {
            if (!this._finished) {
                if (!this._checkmate) {
                    this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
                    this._inputController.UpdateCurrentUser(this._currentUser);
                    this._inputController.HandleInput();
                    // this.WatchMovementController();
                    // this.DeSpawnEnemy();   
                    // this.WatchCheckmate();
                    // this.HandleFinishMove();
                }
                // else {
                //     this._duellController.HandleInput();
                //     this.HandleMovements();
                //     this.WatchCheckmateEnd();
                // }
            }
            this.WatchEndGame();
        }
        public HandleFinishMove(): void {
            // if (this._inputController.GetSelectionState()) {
                this._playerTimeController.StoppTimer();
                this._soundController.Delete();
                // this._enemyOnTheWay = false;
                switch (this._currentUser) {
                    case UserType.PLAYER:
                        this._currentUser = UserType.ENEMY;
                        break;
                    default:
                        this._currentUser = UserType.PLAYER;
                        break;
                }
                State.Instance.SetUser = this._currentUser;
                this._playerTimeController.StartTimer();
                this._root.addComponent(this._soundController);
            // }

        }
        public WatchEndGame(): void{
            // Object.keys(this._chessPlayer).map((value:) => {
            //     const player: ChessPlayer = this._chessPlayer[value];
            // })
            let gameEnd: GameEnd;
            const ps: ChessPlayer[] = [];
            ps.push(this._chessPlayer[UserType.PLAYER]);
            ps.push(this._chessPlayer[UserType.ENEMY]);
            for (const player of ps) {
                let hitKing: boolean = false;
                for (const figure of player.GetFigures()) {
                    if (figure.name === "König") {
                        hitKing = true;
                    }
                }
                if (!hitKing) {
                    this._finished = true;
                    const end: GameEnd = {
                        _winner: player.GetPlayerType() === UserType.ENEMY ? UserType.PLAYER : UserType.ENEMY
                    };
                    gameEnd = end;
                    break;
                }
            }
            this._winner = gameEnd;

        }
        public WatchCheckmate(): void {
            // if (this._inputController.Checkmate) {
                // console.log(111)
                this._inputController.Checkmate = false;
                this._duellMode = true;
                // const surface: f.Node = this._root.getChildrenByName("Surface")[0];
                // setTimeout(()=>{})
                if (this._duellController === null) {
                    this._duellController = new DuellController(this._cameraController, this._inputController.CurrentDuell);
                    this._root.addChild(this._duellController.BattleGround);
                    console.log(this._root);
                }
               
            // }
        }
        public WatchCheckmateEnd(): void {
            if (this._duellController.End) {
                this._checkmate = false;
                this._root.removeChild(this._duellController.BattleGround);
                this._duellController = null;
            }
        }
        public HandleMovements(): void {
            // const projectiles: Projectile[] = [];
            // for (const figure of this._chessPlayer[this._currentUser].GetFigures()) {
            //     // for(const proj)
            //     if (figure.getChildren().length > 0) {
            //         for (const prj of figure.getChildren() as Projectile[]) {
            //             projectiles.push(prj);
            //         }
            //     }
            // }
            // for (const projectile of projectiles) {
            //     projectile.Move();
            // }
        }
    }
    function Init(): void {
        let dialog: HTMLDialogElement = document.querySelector("dialog");
        dialog.showModal();
        const PLAYERINPUT: HTMLInputElement = document.getElementById("player-name") as HTMLInputElement;
        const ENEMYINPUT: HTMLInputElement = document.getElementById("enemy-name") as HTMLInputElement;
        const STARTBUTTON: HTMLButtonElement = document.getElementById("play-button") as HTMLButtonElement;
        const ERROR: HTMLParagraphElement = document.getElementById("error-message") as HTMLParagraphElement;
        ERROR.style.display = "none";
        STARTBUTTON.addEventListener("click", () => {
            _enemyName = ENEMYINPUT.value;
            _playerName = PLAYERINPUT.value;
            ERROR.style.display = "none";
            ERROR.innerHTML = "";
            if (_playerName.length > 0 && _enemyName.length > 0) {
                dialog.close();
                Start();
            } else {
                ERROR.style.display = "block";
                ERROR.innerHTML = "Bitte gib gülte Namen ein!";
            }

        });
    }
    async function Start(): Promise<void> {
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;


        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        _root = <f.Graph>FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];
        _inputSetting = await (await DataController.Instance.GetGameSetting()).Input;

        StartChessMatch();
    }
    function StartChessMatch(): void {
        InitWorld();
        InitCamera();
        InitAvatar();
        InitController();

        f.Physics.adjustTransforms(_root, true);

        _canvas = document.querySelector("canvas");
        _viewport = new f.Viewport();
        _viewport.initialize("Viewport", _root, _camera._componentCamera, _canvas);

        Hud.start();

        if (_inputSetting.mouseLock) {
            _canvas.addEventListener("click", _canvas.requestPointerLock);
        }
        console.log(_root);
        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, HandleGame);
        f.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
    }
    function InitCamera(): void {
        _cameraController = new CameraController(_startUserPlayer);
        const camera: Camera = {
            _node: new f.Node("Camera"),
            _componentCamera: new f.ComponentCamera()
        };
        camera._node.addComponent(camera._componentCamera);
        camera._node.addComponent(new f.ComponentTransform(new f.Matrix4x4));
        camera._node.addComponent(_cameraController);
        _camera = camera;
    }
    function InitAvatar(): void {
        const player: Player = {
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
    function InitWorld(): void {
        const surface: f.Node = _root.getChildrenByName("Surface")[0];
        surface.addComponent(new ƒ.ComponentRigidbody(0, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT));
        _surface = surface;
        const figures: f.Node = _root.getChildrenByName("Figures")[0];
        const playerF: f.Node = figures.getChildrenByName("Player")[0];
        const enemyF: f.Node = figures.getChildrenByName("Enemy")[0];
        const places: f.Node = _root.getChildrenByName("Places")[0];
        const player: ChessPlayer = new ChessPlayer(playerF, UserType.PLAYER, new TimeController(), _playerName);
        const enemy: ChessPlayer = new ChessPlayer(enemyF, UserType.ENEMY, new TimeController(), _enemyName);
        _places = places.getChildren();
        for (let place of _places) {
            const rigidbody: f.ComponentRigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
            rigidbody.mtxPivot.scaleZ(0.1);
            place.addComponent(rigidbody);
            place.addComponent(new PlaceController());
        }
        for (let i: number = 0; i < 16; i++) {
            const place: f.Node = _places[i];
            const placeController: PlaceController = place.getComponent(PlaceController);
            const chessFigure: ChessFigure = new ChessFigure(CHESSFIGURES[i], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, player);
            placeController.SetChessFigure(chessFigure);
            playerF.addChild(chessFigure);
        }
        let index: number = 0;
        for (let i: number = _places.length - 1; i > _places.length - 17; i--) {
            const place: f.Node = _places[i];
            const placeController: PlaceController = place.getComponent(PlaceController);
            const chessFigure: ChessFigure = new ChessFigure(CHESSFIGURES[index], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, enemy);
            placeController.SetChessFigure(chessFigure);
            enemyF.addChild(chessFigure);
            index++;
        }

        const CHESSPLAYER: ChessPlayers = {
            player,
            enemy
        };
        _chessPlayer = CHESSPLAYER;
    }

    function InitController(): void {

        _selectionControl = new SelectionControl();
        _gameController = new GameController(_chessPlayer, _places, _cameraController, _selectionControl, _root);
        _root.appendChild(_selectionControl);
        _root.addComponent(new SoundController(SoundType.ATMO));

    }
    function HandleGame(event: Event): void {
        _gameController.HandleGame();
        f.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
        _viewport.draw();
    }

}
