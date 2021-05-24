"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    let _root;
    let _player;
    let _viewport;
    let _canvas;
    let _camera;
    let _inputController;
    let _gameTime;
    let _dragTime;
    let _speed = 1;
    let _places = [];
    let _surface;
    // let _playerFigures: f.Node[] = [];
    // let _enemyFigures: f.Node[] = [];
    // let _currentFigure: f.Node;
    window.addEventListener("load", Start);
    async function Start(event) {
        f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        _root = FudgeCore.Project.resources["Graph|2021-05-23T14:11:54.579Z|49352"];
        console.log(_root);
        InitWorld();
        InitCamera();
        InitAvatar();
        InitController();
        f.Physics.adjustTransforms(_root, true);
        _canvas = document.querySelector("canvas");
        _viewport = new f.Viewport();
        _viewport.initialize("Viewport", _root, _camera._componentCamera, _canvas);
        _canvas.addEventListener("mousemove", mouseMove);
        _canvas.addEventListener("click", _canvas.requestPointerLock);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, HandleGame);
        f.Loop.start();
    }
    function mouseMove(_event) {
        _player._rigidbody.rotateBody(f.Vector3.Y(-1 * _event.movementX * _speed / 10));
        _camera._node.mtxLocal.rotateX(_event.movementY * _speed / 10);
    }
    function InitCamera() {
        const camera = {
            _node: new f.Node("Camera"),
            _componentCamera: new f.ComponentCamera()
        };
        camera._node.addComponent(camera._componentCamera);
        camera._node.addComponent(new f.ComponentTransform(new f.Matrix4x4));
        // camera._componentCamera.mtxPivot.lookAt(_places[0].mtxLocal.translation);
        _camera = camera;
        // _camera._node
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
        player._avatar.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(new f.Vector3(0, 5, -10))));
        player._avatar.addComponent(new f.ComponentAudioListener());
        player._avatar.appendChild(_camera._node);
        console.log(player);
        _player = player;
        _root.appendChild(_player._avatar);
    }
    function InitWorld() {
        const surface = _root.getChildrenByName("Surface")[0];
        surface.addComponent(new ƒ.ComponentRigidbody(0, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT));
        _surface = surface;
        console.log(_surface);
        const places = _root.getChildrenByName("Places")[0];
        _places = places.getChildren();
        for (let place of _places) {
            const rigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
            rigidbody.mtxPivot.scaleZ(0.1);
            place.addComponent(rigidbody);
        }
        const figures = _root.getChildrenByName("Figures")[0];
        console.log(_places);
    }
    function InitController() {
    }
    function HandleGame(event) {
        ƒ.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
        _viewport.draw();
        // f.Physics.settings.debugDraw = true;
    }
})(ChessGame || (ChessGame = {}));
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
//# sourceMappingURL=GameController.js.map