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
    let _gameTime: Number;
    let _dragTime: Number;
    let _speed: number = 1;
    let _places: f.Node[] = [];
    let _surface: f.Node;
    let _chessPlayer: ChessPlayer;
    let _maxTime: number = 120;
    let _selectionControl: SelectionControl;
    let _startUserPlayer: UserType = UserType.PLAYER;
    // let _playerFigures: f.Node[] = [];
    // let _enemyFigures: f.Node[] = [];
    // let _currentFigure: f.Node;

    window.addEventListener("load", Start);
    async function Start(event: Event): Promise<void> {
        // console.log()
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;


        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        _root = <f.Graph>FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];
        // console.log(_root);

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

        // _canvas.addEventListener("mousemove", mouseMove);
        // _canvas.addEventListener("click", _canvas.requestPointerLock);
        console.log(_root);
        _inputController.ResetTimer();
        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, HandleGame);
        f.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
    }
    function mouseMove(_event: MouseEvent): void {


        _player._rigidbody.rotateBody(f.Vector3.Y(-1 * _event.movementX * _speed / 10));
        _camera._node.mtxLocal.rotateX(_event.movementY * _speed / 10);
    }
    function InitCamera(): void {
        // console.log(_startUserPlayer)
        _cameraController = new CameraController(_startUserPlayer);
        const camera: Camera = {
            _node: new f.Node("Camera"),
            _componentCamera: new f.ComponentCamera()
        };
        camera._node.addComponent(camera._componentCamera);
        camera._node.addComponent(new f.ComponentTransform(new f.Matrix4x4));
        camera._node.addComponent(_cameraController);
        // camera._node.mtxWorld.translation = new f.Vector3(0, 0, 0);
        // camera._componentCamera.mtxPivot.lookAt(_places[0].mtxLocal.translation);
        _camera = camera;
        // _camera._node
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
        // player._avatar.getComponent(f.ComponentTransform).mtxLocal.lookAt(new f.Vector3(0,0,0));
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
        const player: f.Node = figures.getChildrenByName("Player")[0];
        const enemy: f.Node = figures.getChildrenByName("Enemy")[0];
        const places: f.Node = _root.getChildrenByName("Places")[0];
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
            const chessFigure: ChessFigure = new ChessFigure(CHESSFIGURES[i], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, UserType.PLAYER);
            placeController.SetChessFigure(chessFigure);
            player.addChild(chessFigure);
        }
        let index: number = 0;
        for (let i: number = _places.length - 1; i > _places.length - 17; i--) {
            const place: f.Node = _places[i];
            const placeController: PlaceController = place.getComponent(PlaceController);
            const chessFigure: ChessFigure = new ChessFigure(CHESSFIGURES[index], 1, f.PHYSICS_TYPE.KINEMATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, place, UserType.ENEMY);
            placeController.SetChessFigure(chessFigure);
            enemy.addChild(chessFigure);
            index++;
        }
        const CHESSPLAYER: ChessPlayer = {
            player,
            enemy
        };
        _chessPlayer = CHESSPLAYER;
        // console.log(_places);-
    }

    function InitController(): void {

        _selectionControl = new SelectionControl();
        // _cameraController = new CameraController();
        _inputController = new InputController(_places, _chessPlayer, _cameraController, _maxTime, _selectionControl, _startUserPlayer);

        _root.appendChild(_selectionControl);

    }
    function HandleGame(event: Event): void {
        _inputController.HandleInput();
        ƒ.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
        _viewport.draw();
        // f.Physics.settings.debugDraw = true;
    }

}




// <script>(function (_graphId) {
//                 window.addEventListener("load", init);
//                 // show dialog for startup
//                 let dialog;
//                 function init(_event) {
//                     dialog = document.querySelector("dialog");
//                     dialog.addEventListener("click", function (_event) {
//                         dialog.close();
//                         startInteractiveViewport();
//                     });
//                     dialog.showModal();
//                 }
//                 // setup and start interactive viewport
//                 async function startInteractiveViewport() {
//                     // load resources referenced in the link-tag
//                     await FudgeCore.Project.loadResourcesFromHTML();
//                     FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
//                     // pick the graph to show
//                     let graph = FudgeCore.Project.resources[_graphId];
//                     FudgeCore.Debug.log("Graph:", graph);
//                     // setup the viewport
//                     let cmpCamera = new FudgeCore.ComponentCamera();
//                     let canvas = document.querySelector("canvas");
//                     let viewport = new FudgeCore.Viewport();
//                     viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
//                     FudgeCore.Debug.log("Viewport:", viewport);
//                     // hide the cursor when interacting, also suppressing right-click menu
//                     canvas.addEventListener("mousedown", canvas.requestPointerLock);
//                     canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
//                     // make the camera interactive (complex method in FudgeAid)
//                     FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
//                     // setup audio
//                     let cmpListener = new ƒ.ComponentAudioListener();
//                     cmpCamera.getContainer().addComponent(cmpListener);
//                     FudgeCore.AudioManager.default.listenWith(cmpListener);
//                     FudgeCore.AudioManager.default.listenTo(graph);
//                     FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);
//                     // draw viewport once for immediate feedback
//                     viewport.draw();
//                     canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
//                 }
//             })("Graph|2021-05-23T14:11:54.579Z|49352");
// </script>