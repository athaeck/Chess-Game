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
    let _root: f.Graph;
    let _player: Player;
    let _viewport: f.Viewport;
    let _canvas: HTMLCanvasElement;
    let _camera: Camera;
    let _inputController: InputController;
    let _gameTime: Number;
    let _dragTime: Number;
    window.addEventListener("load", Start);
    async function Start(event: Event): Promise<void> {
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;
        await FudgeCore.Project.loadResourcesFromHTML();
        const root: f.Graph = <f.Graph>FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];

        // const gameController: GameController = new GameController(root);
        // this = gameController;
        _root = root;
        console.log(_root);
        // f.Physics.settings.debugDraw = true;
        InitCamera();
        InitAvatar();
        f.Physics.adjustTransforms(_root, true);
        _canvas = document.querySelector("canvas");
        _viewport = new f.Viewport();
        _viewport.initialize("Viewport", _root, _camera._componentCamera, _canvas);
        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, HandleGame);
        f.Loop.start();
    }
    function InitCamera(): void {
        const camera: Camera = {
            _node: new f.Node("Camera"),
            _componentCamera: new f.ComponentCamera()
        };
        camera._node.addComponent(camera._componentCamera);
        camera._node.addComponent(new f.ComponentTransform(new f.Matrix4x4));
        _camera = camera;
    }
    function InitAvatar(): void {
        const player: Player = {
            _rigidbody: null,
            _avatar: new f.Node("Player")
        };
        player._avatar.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(new f.Vector3(0, 5, .5))));
        player._avatar.addComponent(new f.ComponentAudioListener());
        player._avatar.appendChild(_camera._node);
        _player = player;
        _root.appendChild(_player._avatar);
    }
    function HandleGame(event: Event): void {

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