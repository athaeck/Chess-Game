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
    let _root: f.Graph;
    let _player: Player;
    let _viewport: f.Viewport;
    let _canvas: HTMLCanvasElement;
    let _camera: Camera;
    let _inputController: InputController;
    let _cameraController: CameraController;
    // let _gameTime: Number;
    // let _dragTime: Number;
    // let _speed: number = 1;
    let _places: f.Node[] = [];
    let _surface: f.Node;
    let _chessPlayer: ChessPlayers;
    // let _maxTime: number = 120;
    let _selectionControl: SelectionControl;
    let _startUserPlayer: UserType = UserType.PLAYER;

    window.addEventListener("load", Start);
    export class GameController {
        private _inputController: InputController;
        private _currentUser: UserType;
        private _chessPlayer: ChessPlayers;
        private _playerTimeController: TimeController;
        constructor(chessPlayer: ChessPlayers, places: f.Node[],cameraController: CameraController, selctionController: SelectionControl) {
            const random: number = new f.Random().getRange(0, 11);
            this._chessPlayer = chessPlayer;
            this._currentUser = random > 5 ? UserType.PLAYER : UserType.ENEMY;
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController = new InputController(places, chessPlayer, cameraController, selctionController, this._currentUser);
        }
        public HandleGame(): void{
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController.UpdateCurrentUser(this._currentUser);
            this._inputController.HandleInput();
            this.HandleFinishMove();
        }
        private HandleFinishMove(): void{
            if (this._inputController.GetSelectionState()) {
                this._playerTimeController.StoppTimer();
                switch (this._currentUser) {
                    case UserType.PLAYER:
                        this._currentUser = UserType.ENEMY;
                        break;
                    default:
                        this._currentUser = UserType.PLAYER;
                        break;
                }
                this._playerTimeController.StartTimer();
            }
        }
    }
    async function Start(event: Event): Promise<void> {
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;


        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        _root = <f.Graph>FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];


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


        _canvas.addEventListener("click", _canvas.requestPointerLock);
        console.log(_root);
        // _inputController.ResetTimer();
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
        const player: ChessPlayer = new ChessPlayer(playerF, UserType.PLAYER, new TimeController())
        const enemy: ChessPlayer = new ChessPlayer(enemyF, UserType.ENEMY, new TimeController())
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
        // _cameraController = new CameraController();
        // _inputController = new InputController(_places, _chessPlayer, _cameraController, _selectionControl);

        _root.appendChild(_selectionControl);

    }
    function HandleGame(event: Event): void {
        // _inputController.HandleInput();
        ƒ.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
        _viewport.draw();
        // f.Physics.settings.debugDraw = true;
    }

}
