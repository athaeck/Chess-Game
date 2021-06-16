"use strict";
///<reference types="../../Core/Build/FudgeCore"/>
var ƒ = FudgeCore;
var ƒAid = FudgeAid;
var FudgeAid;
(function (FudgeAid) {
    ƒ.Serializer.registerNamespace(FudgeAid);
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Abstract class supporting versious arithmetical helper functions
     */
    class Arith {
        /**
         * Returns one of the values passed in, either _value if within _min and _max or the boundary being exceeded by _value
         */
        static clamp(_value, _min, _max, _isSmaller = (_value1, _value2) => { return _value1 < _value2; }) {
            if (_isSmaller(_value, _min))
                return _min;
            if (_isSmaller(_max, _value))
                return _max;
            return _value;
        }
    }
    FudgeAid.Arith = Arith;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Within a given precision, an object of this class finds the parameter value at which a given function
     * switches its boolean return value using interval splitting (bisection).
     * Pass the type of the parameter and the type the precision is measured in.
     */
    class ArithBisection {
        /**
         * Creates a new Solver
         * @param _function A function that takes an argument of the generic type <Parameter> and returns a boolean value.
         * @param _divide A function splitting the interval to find a parameter for the next iteration, may simply be the arithmetic mean
         * @param _isSmaller A function that determines a difference between the borders of the current interval and compares this to the given precision
         */
        constructor(_function, _divide, _isSmaller) {
            this.function = _function;
            this.divide = _divide;
            this.isSmaller = _isSmaller;
        }
        /**
         * Finds a solution with the given precision in the given interval using the functions this Solver was constructed with.
         * After the method returns, find the data in this objects properties.
         * @param _left The parameter on one side of the interval.
         * @param _right The parameter on the other side, may be "smaller" than [[_left]].
         * @param _epsilon The desired precision of the solution.
         * @param _leftValue The value on the left side of the interval, omit if yet unknown or pass in if known for better performance.
         * @param _rightValue The value on the right side of the interval, omit if yet unknown or pass in if known for better performance.
         * @throws Error if both sides of the interval return the same value.
         */
        solve(_left, _right, _epsilon, _leftValue = undefined, _rightValue = undefined) {
            this.left = _left;
            this.leftValue = _leftValue || this.function(_left);
            this.right = _right;
            this.rightValue = _rightValue || this.function(_right);
            if (this.isSmaller(_left, _right, _epsilon))
                return;
            if (this.leftValue == this.rightValue)
                throw (new Error("Interval solver can't operate with identical function values on both sides of the interval"));
            let between = this.divide(_left, _right);
            let betweenValue = this.function(between);
            if (betweenValue == this.leftValue)
                this.solve(between, this.right, _epsilon, betweenValue, this.rightValue);
            else
                this.solve(this.left, between, _epsilon, this.leftValue, betweenValue);
        }
        toString() {
            let out = "";
            out += `left: ${this.left.toString()} -> ${this.leftValue}`;
            out += "\n";
            out += `right: ${this.right.toString()} -> ${this.rightValue}`;
            return out;
        }
    }
    FudgeAid.ArithBisection = ArithBisection;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        constructor(_cmpCamera, _distanceStart = 2, _maxRotX = 75, _minDistance = 1, _maxDistance = 10) {
            super("CameraOrbit");
            this.axisRotateX = new ƒ.Axis("RotateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisRotateY = new ƒ.Axis("RotateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisDistance = new ƒ.Axis("Distance", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "RotateX":
                        this.rotateX(output);
                        break;
                    case "RotateY":
                        this.rotateY(output);
                        break;
                    case "Distance":
                        this.distance += output;
                }
            };
            this.maxRotX = Math.min(_maxRotX, 89);
            this.minDistance = _minDistance;
            this.maxDistance = _maxDistance;
            let cmpTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);
            this.rotatorX = new ƒ.Node("CameraRotationX");
            this.rotatorX.addComponent(new ƒ.ComponentTransform());
            this.addChild(this.rotatorX);
            this.translator = new ƒ.Node("CameraTranslate");
            this.translator.addComponent(new ƒ.ComponentTransform());
            this.translator.mtxLocal.rotateY(180);
            this.rotatorX.addChild(this.translator);
            this.translator.addComponent(_cmpCamera);
            this.distance = _distanceStart;
            this.axisRotateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisRotateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisDistance.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        get cmpCamera() {
            return this.translator.getComponent(ƒ.ComponentCamera);
        }
        get nodeCamera() {
            return this.translator;
        }
        set distance(_distance) {
            let newDistance = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
            this.translator.mtxLocal.translation = ƒ.Vector3.Z(newDistance);
        }
        get distance() {
            return this.translator.mtxLocal.translation.z;
        }
        set rotationY(_angle) {
            this.mtxLocal.rotation = ƒ.Vector3.Y(_angle);
        }
        get rotationY() {
            return this.mtxLocal.rotation.y;
        }
        set rotationX(_angle) {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.mtxLocal.rotation = ƒ.Vector3.X(_angle);
        }
        get rotationX() {
            return this.rotatorX.mtxLocal.rotation.x;
        }
        rotateY(_delta) {
            this.mtxLocal.rotateY(_delta);
        }
        rotateX(_delta) {
            this.rotationX = this.rotatorX.mtxLocal.rotation.x + _delta;
        }
        // set position of camera component relative to the center of orbit
        positionCamera(_posWorld) {
            let difference = ƒ.Vector3.DIFFERENCE(_posWorld, this.mtxWorld.translation);
            let geo = difference.geo;
            this.rotationY = geo.longitude;
            this.rotationX = -geo.latitude;
            this.distance = geo.magnitude;
        }
    }
    FudgeAid.CameraOrbit = CameraOrbit;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbitMovingFocus extends FudgeAid.CameraOrbit {
        constructor(_cmpCamera, _distanceStart = 5, _maxRotX = 85, _minDistance = 0, _maxDistance = Infinity) {
            super(_cmpCamera, _distanceStart, _maxRotX, _minDistance, _maxDistance);
            this.axisTranslateX = new ƒ.Axis("TranslateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateY = new ƒ.Axis("TranslateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateZ = new ƒ.Axis("TranslateZ", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "TranslateX":
                        this.translateX(output);
                        break;
                    case "TranslateY":
                        this.translateY(output);
                        break;
                    case "TranslateZ":
                        this.translateZ(output);
                }
            };
            this.name = "CameraOrbitMovingFocus";
            this.axisTranslateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateZ.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        translateX(_delta) {
            this.mtxLocal.translateX(_delta);
        }
        translateY(_delta) {
            let translation = this.rotatorX.mtxWorld.getY();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
        translateZ(_delta) {
            // this.mtxLocal.translateZ(_delta);
            let translation = this.rotatorX.mtxWorld.getZ();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
    }
    FudgeAid.CameraOrbitMovingFocus = CameraOrbitMovingFocus;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    let IMAGE_RENDERING;
    (function (IMAGE_RENDERING) {
        IMAGE_RENDERING["AUTO"] = "auto";
        IMAGE_RENDERING["SMOOTH"] = "smooth";
        IMAGE_RENDERING["HIGH_QUALITY"] = "high-quality";
        IMAGE_RENDERING["CRISP_EDGES"] = "crisp-edges";
        IMAGE_RENDERING["PIXELATED"] = "pixelated";
    })(IMAGE_RENDERING = FudgeAid.IMAGE_RENDERING || (FudgeAid.IMAGE_RENDERING = {}));
    /**
     * Adds comfort methods to create a render canvas
     */
    class Canvas {
        static create(_fillParent = true, _imageRendering = IMAGE_RENDERING.AUTO, _width = 800, _height = 600) {
            let canvas = document.createElement("canvas");
            canvas.id = "FUDGE";
            let style = canvas.style;
            style.imageRendering = _imageRendering;
            style.width = _width + "px";
            style.height = _height + "px";
            style.marginBottom = "-0.25em";
            if (_fillParent) {
                style.width = "100%";
                style.height = "100%";
            }
            return canvas;
        }
    }
    FudgeAid.Canvas = Canvas;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class Node extends ƒ.Node {
        constructor(_name = Node.getNextName(), _transform, _material, _mesh) {
            super(_name);
            if (_transform)
                this.addComponent(new ƒ.ComponentTransform(_transform));
            if (_material)
                this.addComponent(new ƒ.ComponentMaterial(_material));
            if (_mesh)
                this.addComponent(new ƒ.ComponentMesh(_mesh));
        }
        static getNextName() {
            return "ƒAidNode_" + Node.count++;
        }
        get mtxMeshPivot() {
            let cmpMesh = this.getComponent(ƒ.ComponentMesh);
            return cmpMesh ? cmpMesh.mtxPivot : null;
        }
        async deserialize(_serialization) {
            // Quick and maybe hacky solution. Created node is completely dismissed and a recreation of the baseclass gets return. Otherwise, components will be doubled...
            let node = new ƒ.Node(_serialization.name);
            await node.deserialize(_serialization);
            // console.log(node);
            return node;
        }
    }
    Node.count = 0;
    FudgeAid.Node = Node;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeArrow extends FudgeAid.Node {
        constructor(_name, _color) {
            super(_name, ƒ.Matrix4x4.IDENTITY());
            let shaft = new FudgeAid.Node(_name + "Shaft", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Shaft"));
            let head = new FudgeAid.Node(_name + "Head", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Head"));
            shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
            head.mtxLocal.translateZ(0.5);
            head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
            head.mtxLocal.rotateX(90);
            shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            this.addChild(shaft);
            this.addChild(head);
        }
        static createInternalResources() {
            let map = new Map();
            map.set("Shaft", new ƒ.MeshCube("ArrowShaft"));
            map.set("Head", new ƒ.MeshPyramid("ArrowHead"));
            let coat = new ƒ.CoatColored(ƒ.Color.CSS("white"));
            map.set("Material", new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat));
            map.forEach((_resource) => ƒ.Project.deregister(_resource));
            return map;
        }
        set color(_color) {
            for (let child of this.getChildren()) {
                child.getComponent(ƒ.ComponentMaterial).clrPrimary.copy(_color);
            }
        }
    }
    NodeArrow.internalResources = NodeArrow.createInternalResources();
    FudgeAid.NodeArrow = NodeArrow;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeCoordinateSystem extends FudgeAid.Node {
        constructor(_name = "CoordinateSystem", _transform) {
            super(_name, _transform);
            let arrowRed = new FudgeAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
            let arrowGreen = new FudgeAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
            let arrowBlue = new FudgeAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
            arrowRed.mtxLocal.rotateY(90);
            arrowGreen.mtxLocal.rotateX(-90);
            this.addChild(arrowRed);
            this.addChild(arrowGreen);
            this.addChild(arrowBlue);
        }
    }
    FudgeAid.NodeCoordinateSystem = NodeCoordinateSystem;
})(FudgeAid || (FudgeAid = {}));
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeAid;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Adds a light setup to the node given, consisting of an ambient light, a directional key light and a directional back light.
     * Exept of the node to become the container, all parameters are optional and provided default values for general purpose.
     */
    function addStandardLightComponents(_node, _clrAmbient = new ƒ.Color(0.2, 0.2, 0.2), _clrKey = new ƒ.Color(0.9, 0.9, 0.9), _clrBack = new ƒ.Color(0.6, 0.6, 0.6), _posKey = new ƒ.Vector3(4, 12, 8), _posBack = new ƒ.Vector3(-1, -0.5, -3)) {
        let key = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrKey));
        key.mtxPivot.translate(_posKey);
        key.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        let back = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrBack));
        back.mtxPivot.translate(_posBack);
        back.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        let ambient = new ƒ.ComponentLight(new ƒ.LightAmbient(_clrAmbient));
        _node.addComponent(key);
        _node.addComponent(back);
        _node.addComponent(ambient);
    }
    FudgeAid.addStandardLightComponents = addStandardLightComponents;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Handles the animation cycle of a sprite on a [[Node]]
     */
    class NodeSprite extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.framerate = 12; // animation frames per second, single frames can be shorter or longer based on their timescale
            this.frameCurrent = 0;
            this.direction = 1;
            /**
             * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
             */
            this.showFrameNext = (_event) => {
                this.frameCurrent = (this.frameCurrent + this.direction + this.animation.frames.length) % this.animation.frames.length;
                this.showFrame(this.frameCurrent);
            };
            this.cmpMesh = new ƒ.ComponentMesh(NodeSprite.mesh);
            // Define coat from the SpriteSheet to use when rendering
            this.cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderTexture, null));
            this.addComponent(this.cmpMesh);
            this.addComponent(this.cmpMaterial);
        }
        static createInternalResource() {
            let mesh = new ƒ.MeshSprite("Sprite");
            ƒ.Project.deregister(mesh);
            return mesh;
        }
        setAnimation(_animation) {
            this.animation = _animation;
            if (this.timer)
                ƒ.Time.game.deleteTimer(this.timer);
            this.showFrame(0);
        }
        /**
         * Show a specific frame of the sequence
         */
        showFrame(_index) {
            let spriteFrame = this.animation.frames[_index];
            this.cmpMesh.mtxPivot = spriteFrame.mtxPivot;
            this.cmpMaterial.mtxPivot = spriteFrame.mtxTexture;
            this.cmpMaterial.material.setCoat(this.animation.spritesheet);
            this.frameCurrent = _index;
            this.timer = ƒ.Time.game.setTimer(spriteFrame.timeScale * 1000 / this.framerate, 1, this.showFrameNext);
        }
        /**
         * Sets the direction for animation playback, negativ numbers make it play backwards.
         */
        setFrameDirection(_direction) {
            this.direction = Math.floor(_direction);
        }
    }
    NodeSprite.mesh = NodeSprite.createInternalResource();
    FudgeAid.NodeSprite = NodeSprite;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Describes a single frame of a sprite animation
     */
    class SpriteFrame {
    }
    FudgeAid.SpriteFrame = SpriteFrame;
    /**
     * Convenience for creating a [[CoatTexture]] to use as spritesheet
     */
    function createSpriteSheet(_name, _image) {
        let coat = new ƒ.CoatTextured();
        coat.name = _name;
        let texture = new ƒ.TextureImage();
        texture.image = _image;
        coat.texture = texture;
        return coat;
    }
    FudgeAid.createSpriteSheet = createSpriteSheet;
    /**
     * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
     * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
     */
    class SpriteSheetAnimation {
        constructor(_name, _spritesheet) {
            this.frames = [];
            this.name = _name;
            this.spritesheet = _spritesheet;
        }
        /**
         * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
         */
        generate(_rects, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            this.frames = [];
            let framing = new ƒ.FramingScaled();
            framing.setScale(1 / img.width, 1 / img.height);
            let count = 0;
            for (let rect of _rects) {
                let frame = this.createFrame(this.name + `${count}`, framing, rect, _resolutionQuad, _origin);
                frame.timeScale = 1;
                this.frames.push(frame);
                count++;
            }
        }
        /**
         * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
         * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
         * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
         * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
         */
        generateByGrid(_startRect, _frames, _resolutionQuad, _origin, _offsetNext, _offsetWrap = ƒ.Vector2.ZERO()) {
            let img = this.spritesheet.texture.texImageSource;
            let rectImage = new ƒ.Rectangle(0, 0, img.width, img.height);
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.add(_offsetNext);
                if (rectImage.covers(rect))
                    continue;
                _startRect.position.add(_offsetWrap);
                rect = _startRect.copy;
                if (!rectImage.covers(rect))
                    break;
            }
            rects.forEach((_rect) => ƒ.Debug.log(_rect.toString()));
            this.generate(rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _framing, _rect, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            let rectTexture = new ƒ.Rectangle(0, 0, img.width, img.height);
            let frame = new SpriteFrame();
            frame.rectTexture = _framing.getRect(_rect);
            frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);
            let rectQuad = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
            frame.mtxPivot = ƒ.Matrix4x4.IDENTITY();
            frame.mtxPivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
            frame.mtxPivot.scaleX(rectQuad.size.x);
            frame.mtxPivot.scaleY(rectQuad.size.y);
            // ƒ.Debug.log(rectQuad.toString());
            frame.mtxTexture = ƒ.Matrix3x3.IDENTITY();
            frame.mtxTexture.translate(frame.rectTexture.position);
            frame.mtxTexture.scale(frame.rectTexture.size);
            return frame;
        }
    }
    FudgeAid.SpriteSheetAnimation = SpriteSheetAnimation;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.ComponentStateMachine = ComponentStateMachine;
})(FudgeAid || (FudgeAid = {}));
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
var FudgeAid;
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
(function (FudgeAid) {
    /**
     * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
     * the instructions for the machine and comfort methods to transit and act.
     */
    class StateMachine {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.StateMachine = StateMachine;
    /**
     * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
     * and all dedicated methods defined for transitions to other states, as well as default methods.
     * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
     * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
     */
    class StateMachineInstructions extends Map {
        /** Define dedicated transition method to transit from one state to another*/
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        /** Define dedicated action method for a state */
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
        transitDefault(_machine) {
            //
        }
        /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
        actDefault(_machine) {
            //
        }
        /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
        transit(_current, _next, _machine) {
            _machine.stateNext = _next;
            try {
                let active = this.get(_current);
                let transition = active.transitions.get(_next);
                transition(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.transitDefault(_machine);
            }
            finally {
                _machine.stateCurrent = _next;
                _machine.stateNext = undefined;
            }
        }
        /** Invoke the dedicated action method if found for the current state, or the default method */
        act(_current, _machine) {
            try {
                let active = this.get(_current);
                active.action(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.actDefault(_machine);
            }
        }
        /** Find the instructions dedicated for the current state or create an empty set for it */
        getStateMethods(_current) {
            let active = this.get(_current);
            if (!active) {
                active = { action: null, transitions: new Map() };
                this.set(_current, active);
            }
            return active;
        }
    }
    FudgeAid.StateMachineInstructions = StateMachineInstructions;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    class Viewport {
        static create(_branch) {
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.mtxPivot.translate(ƒ.Vector3.Z(4));
            cmpCamera.mtxPivot.rotateY(180);
            let canvas = FudgeAid.Canvas.create();
            document.body.appendChild(canvas);
            let viewport = new ƒ.Viewport();
            viewport.initialize("ƒAid-Viewport", _branch, cmpCamera, canvas);
            return viewport;
        }
        static expandCameraToInteractiveOrbit(_viewport, _showFocus = true, _speedCameraRotation = 1, _speedCameraTranslation = 0.01, _speedCameraDistance = 0.001) {
            _viewport.setFocus(true);
            _viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            _viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            _viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
            _viewport.addEventListener("\u0192pointerdown" /* DOWN */, hndPointerDown);
            _viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
            _viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
            let cntMouseHorizontal = new ƒ.Control("MouseHorizontal");
            let cntMouseVertical = new ƒ.Control("MouseVertical");
            // camera setup
            let camera;
            camera = new FudgeAid.CameraOrbitMovingFocus(_viewport.camera, 5, 85, 0.01, 1000);
            _viewport.camera.projectCentral(_viewport.camera.getAspect(), _viewport.camera.getFieldOfView(), _viewport.camera.getDirection(), 0.01, 1000);
            // yset up axis to control
            camera.axisRotateX.addControl(cntMouseVertical);
            camera.axisRotateX.setFactor(_speedCameraRotation);
            camera.axisRotateY.addControl(cntMouseHorizontal);
            camera.axisRotateY.setFactor(_speedCameraRotation);
            // _viewport.getBranch().addChild(camera);
            let focus;
            if (_showFocus) {
                focus = new FudgeAid.NodeCoordinateSystem("Focus");
                focus.addComponent(new ƒ.ComponentTransform());
                _viewport.getBranch().addChild(focus);
            }
            redraw();
            return camera;
            function hndPointerMove(_event) {
                if (!_event.buttons)
                    return;
                let posCamera = camera.nodeCamera.mtxWorld.translation.copy;
                cntMouseHorizontal.setInput(_event.movementX);
                cntMouseVertical.setInput(_event.movementY);
                ƒ.Render.prepare(camera);
                if (_event.altKey || _event.buttons == 4) {
                    let offset = ƒ.Vector3.DIFFERENCE(posCamera, camera.nodeCamera.mtxWorld.translation);
                    camera.mtxLocal.translate(offset, false);
                }
                redraw();
            }
            function hndPointerDown(_event) {
                let pos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
                let picks = ƒ.Picker.pickViewport(_viewport, pos);
                if (picks.length == 0)
                    return;
                picks.sort((_a, _b) => _a.zBuffer < _b.zBuffer ? -1 : 1);
                let posCamera = camera.nodeCamera.mtxWorld.translation;
                camera.mtxLocal.translation = picks[0].posWorld;
                ƒ.Render.prepare(camera);
                camera.positionCamera(posCamera);
                redraw();
            }
            function hndWheelMove(_event) {
                camera.distance *= 1 + (_event.deltaY * _speedCameraDistance);
                redraw();
            }
            function redraw() {
                if (focus)
                    focus.mtxLocal.translation = camera.mtxLocal.translation;
                ƒ.Render.prepare(camera);
                _viewport.draw();
            }
        }
    }
    FudgeAid.Viewport = Viewport;
})(FudgeAid || (FudgeAid = {}));
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class CameraController extends f.ComponentScript {
        constructor(userType) {
            super();
            this._user = userType;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.Created.bind(this));
        }
        get TransformComponent() {
            return this._transformComponent;
        }
        UpdatePosition(currentChessFigure) {
            this._transformComponent.mtxLocal.lookAt(currentChessFigure.mtxLocal.translation, new f.Vector3(0, 1, 0));
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
            this._life = 100;
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
            // console.log(State.Instance.User)
            // const parent: ChessFigure = event.cmpRigidbody.container as ChessFigure;
            // // console.log(parent)
            // const target: ChessFigure = event.target.container as ChessFigure;
            // // console.log(target)
            // if (parent && target) {
            //     if (State.Instance.User === parent.GetUser().GetPlayerType()) {
            //         if (parent.GetUser().GetPlayerType() !== target.GetUser().GetPlayerType()) {
            //             target.SetDeathTimer();
            //         }
            //     }
            // }
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
    var f = FudgeCore;
    class DuellController {
        // private 
        constructor(surface, cameraController, duell) {
            const offset = 15;
            this._surface = surface;
            this._cameraController = cameraController;
            this._duell = duell;
            this._originPosition = surface.getComponent(f.ComponentTransform);
            this._battleGround = new f.Node("CheckmateBattle");
            for (const component of surface.getAllComponents()) {
                this._battleGround.addComponent(component);
            }
            this._battleGround.getComponent(f.ComponentTransform).mtxLocal.translateY(offset);
            // const transformSurface: f.ComponentTransform = surface.getComponent(f.ComponentTransform);
            // transformSurface.mtxLocal.translateY(offset);
            const transform = cameraController.TransformComponent;
            transform.mtxLocal.translateY(offset);
        }
        get BattleGround() {
            return this._battleGround;
        }
        get End() {
            return false;
        }
        HandleInput() {
        }
    }
    ChessGame.DuellController = DuellController;
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
            this._duellMode = false;
            const random = new f.Random().getRange(0, 11);
            this._chessPlayer = chessPlayer;
            this._currentUser = random > 5 ? ChessGame.UserType.PLAYER : ChessGame.UserType.ENEMY;
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController = new ChessGame.InputController(places, chessPlayer, cameraController, selctionController, this._currentUser);
            this._root = root;
            this._soundController = new ChessGame.SoundController(ChessGame.SoundType.TIME);
            this._root.addComponent(this._soundController);
            this._cameraController = cameraController;
            console.log(this._root);
        }
        HandleGame() {
            this._playerTimeController = this._chessPlayer[this._currentUser].GetTimeController();
            this._inputController.UpdateCurrentUser(this._currentUser);
            this._inputController.HandleInput();
            // this.WatchMovementController();
            // this.DeSpawnEnemy();
            this.HandleFinishMove();
            this.WatchCheckmate();
        }
        HandleFinishMove() {
            if (this._inputController.GetSelectionState()) {
                this._playerTimeController.StoppTimer();
                this._soundController.Delete();
                // this._enemyOnTheWay = false;
                switch (this._currentUser) {
                    case ChessGame.UserType.PLAYER:
                        this._currentUser = ChessGame.UserType.ENEMY;
                        break;
                    default:
                        this._currentUser = ChessGame.UserType.PLAYER;
                        break;
                }
                ChessGame.State.Instance.SetUser = this._currentUser;
                this._playerTimeController.StartTimer();
                this._root.addComponent(this._soundController);
            }
        }
        WatchCheckmate() {
            if (this._inputController.Checkmate) {
                this._duellMode = true;
                this._duellController = new ChessGame.DuellController;
            }
        }
        HandleMovements() {
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
        f.Physics.world.simulate(ƒ.Loop.timeFrameReal / 1000);
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
            this._isCheckmate = false;
            // private x: number = 0;
            this._selectionFinished = false;
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._currentPlayer = user;
            this._cameraController.UpdatePlayer(this._currentPlayer);
            this.GetChessFigureMovements();
        }
        get Checkmate() {
            return this._isCheckmate;
        }
        get CurrentDuell() {
            const p = this._player[this._currentPlayer].GetFigures()[this._currentChessFigureIndex];
            const o = this._isMovement ? this._movements[this._movementIndex].getContainer().getComponent(ChessGame.PlaceController).GetChessFigure() : this._attacks[this._attackIndex].getContainer().getComponent(ChessGame.PlaceController).GetChessFigure();
            switch (this._currentPlayer) {
                case ChessGame.UserType.ENEMY:
                    return {
                        enemy: p,
                        player: o
                    };
                default:
                    return {
                        player: p,
                        enemy: o
                    };
            }
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
        IsCheckmate() {
            let target;
            if (this._isMovement) {
                target = this._movements[this._movementIndex];
            }
            else {
                target = this._attacks[this._attackIndex];
            }
            let targetName;
            if (target !== undefined) {
                const placeC = target.getContainer().getComponent(ChessGame.PlaceController);
                if (!placeC.IsChessFigureNull()) {
                    targetName = placeC.GetChessFigure().GetUser().GetPlayerType() !== this._currentPlayer ? placeC.GetChessFigure().name : undefined;
                }
            }
            return targetName !== undefined && targetName === "König" ? true : false;
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
                if (!this.IsCheckmate()) {
                    movementController.Init(currentMove, this._places, currentFigure.name);
                    currentFigure.addComponent(movementController);
                }
                else {
                    this._isCheckmate = true;
                }
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
            if (this._attackIndex > this._attacks.length - 1) {
                this._attackIndex = 0;
            }
            if (this._attackIndex < 0) {
                this._attackIndex = this._attacks.length - 1;
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
                    if (chessPlayerSetting._attack !== null) {
                        for (const attack of chessPlayerSetting._attack) {
                            // if (!attack._scalable) {
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
                            // }
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
            this.HandleMove();
        }
        HandleMove() {
            this._body.physicsType = f.PHYSICS_TYPE.DYNAMIC;
            this._body.mass = 5;
            this._body.restitution = 0;
            const toTranslate = new f.Vector3(this._target.mtxLocal.translation.x - this._start.mtxLocal.translation.x, 0, this._target.mtxLocal.translation.z - this._start.mtxLocal.translation.z);
            switch (this._name) {
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
                            // this._enemyOnTheWay = true;
                            // chessFigure.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.DYNAMIC;
                            // chessFigure.getComponent(f.ComponentRigidbody).friction = 0;
                            // this._collidingEnemy = chessFigure;
                            chessFigure.GetUser().RemoveFigure(chessFigure);
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