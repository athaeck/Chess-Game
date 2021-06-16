"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Controls the rendering of a branch, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends FudgeCore.EventTargetƒ {
        constructor() {
            super(...arguments);
            this.name = "Viewport"; // The name to call this viewport by.
            this.camera = null; // The camera representing the view parameters to render the branch.
            // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
            // Multiple viewports using the same canvas shouldn't differ here...
            // different framing methods can be used, this is the default
            this.frameClientToCanvas = new FudgeCore.FramingScaled();
            this.frameCanvasToDestination = new FudgeCore.FramingComplex();
            this.frameDestinationToSource = new FudgeCore.FramingScaled();
            this.frameSourceToRender = new FudgeCore.FramingScaled();
            this.adjustingFrames = true;
            this.adjustingCamera = true;
            this.#branch = null; // The to render with all its descendants.
            this.#crc2 = null;
            this.#canvas = null;
            /**
             * Handle drag-drop events and dispatch to viewport as FUDGE-Event
             */
            this.hndDragDropEvent = (_event) => {
                let _dragevent = _event;
                switch (_dragevent.type) {
                    case "dragover":
                    case "drop":
                        _dragevent.preventDefault();
                        _dragevent.dataTransfer.effectAllowed = "none";
                        break;
                    case "dragstart":
                        // just dummy data,  valid data should be set in handler registered by the user
                        _dragevent.dataTransfer.setData("text", "Hallo");
                        // TODO: check if there is a better solution to hide the ghost image of the draggable object
                        _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                        break;
                }
                let event = new FudgeCore.EventDragDrop("ƒ" + _event.type, _dragevent);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle pointer events and dispatch to viewport as FUDGE-Event
             */
            this.hndPointerEvent = (_event) => {
                let event = new FudgeCore.EventPointer("ƒ" + _event.type, _event);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
             */
            this.hndKeyboardEvent = (_event) => {
                if (!this.hasFocus)
                    return;
                let event = new FudgeCore.EventKeyboard("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            /**
             * Handle wheel event and dispatch to viewport as FUDGE-Event
             */
            this.hndWheelEvent = (_event) => {
                let event = new FudgeCore.EventWheel("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            // #endregion
        }
        #branch; // The to render with all its descendants.
        #crc2;
        #canvas;
        //#endregion
        // #region Events (passing from canvas to viewport and from there into branch)
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        get hasFocus() {
            return (Viewport.focus == this);
        }
        /**
         * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
         */
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.#canvas = _canvas;
            this.#crc2 = _canvas.getContext("2d");
            this.rectSource = FudgeCore.Render.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
            this.setBranch(_branch);
        }
        /**
         * Retrieve the destination canvas
         */
        getCanvas() {
            return this.#canvas;
        }
        /**
         * Retrieve the 2D-context attached to the destination canvas
         */
        getContext() {
            return this.#crc2;
        }
        /**
         * Retrieve the size of the destination canvas as a rectangle, x and y are always 0
         */
        getCanvasRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.width, this.#canvas.height);
        }
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0
         */
        getClientRectangle() {
            // FUDGE doesn't care about where the client rect is, only about the size matters.
            // return Rectangle.GET(this.canvas.offsetLeft, this.canvas.offsetTop, this.canvas.clientWidth, this.canvas.clientHeight);
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.clientWidth, this.#canvas.clientHeight);
        }
        /**
         * Set the branch to be drawn in the viewport.
         */
        setBranch(_branch) {
            if (this.#branch) {
                this.#branch.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
                this.#branch.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
            }
            this.#branch = _branch;
            if (this.#branch) {
                this.#branch.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
                this.#branch.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
            }
        }
        /**
         * Retrieve the branch this viewport renders
         */
        getBranch() {
            return this.#branch;
        }
        /**
         * Logs this viewports scenegraph to the console.
         * TODO: remove this method, since it's implemented in Debug
         */
        showSceneGraph() {
            FudgeCore.Debug.branch(this.#branch);
        }
        // #region Drawing
        /**
         * Draw this viewport displaying its branch. By default, the transforms in the branch are recalculated first.
         * Pass `false` if calculation was already done for this frame
         */
        draw(_calculateTransforms = true) {
            if (!this.#branch)
                return;
            FudgeCore.Render.resetFrameBuffer();
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            if (_calculateTransforms)
                this.calculateTransforms();
            FudgeCore.Render.clear(this.camera.clrBackground);
            FudgeCore.Render.draw(this.camera);
            this.#crc2.imageSmoothingEnabled = false;
            this.#crc2.drawImage(FudgeCore.Render.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        /**
         * Calculate the cascade of transforms in this branch and store the results as mtxWorld in the [[Node]]s and [[ComponentMesh]]es
         */
        calculateTransforms() {
            let mtxRoot = FudgeCore.Matrix4x4.IDENTITY();
            if (this.#branch.getParent())
                mtxRoot = this.#branch.getParent().mtxWorld;
            FudgeCore.Render.prepare(this.#branch, null, mtxRoot);
        }
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames() {
            // get the rectangle of the canvas area as displayed (consider css)
            let rectClient = this.getClientRectangle();
            // adjust the canvas size according to the given framing applied to client
            let rectCanvas = this.frameClientToCanvas.getRect(rectClient);
            this.#canvas.width = rectCanvas.width;
            this.#canvas.height = rectCanvas.height;
            // adjust the destination area on the target-canvas to render to by applying the framing to canvas
            this.rectDestination = this.frameCanvasToDestination.getRect(rectCanvas);
            // adjust the area on the source-canvas to render from by applying the framing to destination area
            this.rectSource = this.frameDestinationToSource.getRect(this.rectDestination);
            // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
            this.rectSource.x = this.rectSource.y = 0;
            // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport. For now, it's always adjusted to the current viewport
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            FudgeCore.Render.setRenderRectangle(rectRender);
            // no more transformation after this for now, offscreen canvas and render-viewport have the same size
            FudgeCore.Render.setCanvasSize(rectRender.width, rectRender.height);
        }
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera() {
            let rect = FudgeCore.Render.getRenderRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar());
        }
        // #endregion
        //#region Points
        /**
         * Returns a [[Ray]] in world coordinates from this camera through the point given in client space
         */
        getRayFromClient(_point) {
            let posProjection = this.pointClientToProjection(_point);
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-posProjection.x, posProjection.y, 1));
            // ray.direction.scale(camera.distance);
            ray.origin.transform(this.camera.mtxPivot);
            ray.direction.transform(this.camera.mtxPivot, false);
            let cameraNode = this.camera.getContainer();
            if (cameraNode) {
                ray.origin.transform(cameraNode.mtxWorld);
                ray.direction.transform(cameraNode.mtxWorld, false);
            }
            return ray;
        }
        /**
         * Returns a point on the client rectangle matching the projection of the given point in world space
         */
        pointWorldToClient(_position) {
            let projection = this.camera.pointWorldToClip(_position);
            let posClient = this.pointClipToClient(projection.toVector2());
            return posClient;
        }
        /**
         * Returns a point on the source-rectangle matching the given point on the client rectangle
         */
        pointClientToSource(_client) {
            let result = this.frameClientToCanvas.getPoint(_client, this.getClientRectangle());
            result = this.frameCanvasToDestination.getPoint(result, this.getCanvasRectangle());
            result = this.frameDestinationToSource.getPoint(result, this.rectSource);
            //TODO: when Source, Render and RenderViewport deviate, continue transformation 
            return result;
        }
        /**
         * Returns a point on the render-rectangle matching the given point on the source rectangle
         */
        pointSourceToRender(_source) {
            let projectionRectangle = this.camera.getProjectionRectangle();
            let point = this.frameSourceToRender.getPoint(_source, projectionRectangle);
            // console.log(projectionRectangle.toString());
            return point;
        }
        /**
         * Returns a point on the render-rectangle matching the given point on the client rectangle
         */
        pointClientToRender(_client) {
            let point = this.pointClientToSource(_client);
            point = this.pointSourceToRender(point);
            //TODO: when Render and RenderViewport deviate, continue transformation 
            return point;
        }
        /**
         * Returns a point on a projection surface in the hypothetical distance of 1 to the camera
         * matching the given point on the client rectangle
         * TODO: examine, if this should be a camera-method. Current implementation is for central-projection
         */
        pointClientToProjection(_client) {
            let posRender = this.pointClientToRender(_client);
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            let rectProjection = this.camera.getProjectionRectangle();
            let posProjection = new FudgeCore.Vector2(rectProjection.width * posRender.x / rectRender.width, rectProjection.height * posRender.y / rectRender.height);
            posProjection.subtract(new FudgeCore.Vector2(rectProjection.width / 2, rectProjection.height / 2));
            posProjection.y *= -1;
            return posProjection;
        }
        /**
         * Returns a point in the client rectangle matching the given point in normed clipspace rectangle,
         * which stretches from -1 to 1 in both dimensions, y pointing up
         */
        pointClipToClient(_normed) {
            // let rectClient: Rectangle = this.getClientRectangle();
            // let result: Vector2 = Vector2.ONE(0.5);
            // result.x *= (_normed.x + 1) * rectClient.width;
            // result.y *= (1 - _normed.y) * rectClient.height;
            // result.add(rectClient.position);
            //TODO: check if rectDestination can safely (and more perfomant) be used instead getClientRectangle
            let pointClient = FudgeCore.Render.rectClip.pointToRect(_normed, this.rectDestination);
            return pointClient;
        }
        /**
         * Returns a point in the client rectangle matching the given point in normed clipspace rectangle,
         * which stretches from -1 to 1 in both dimensions, y pointing up
         */
        pointClipToCanvas(_normed) {
            let pointCanvas = FudgeCore.Render.rectClip.pointToRect(_normed, this.getCanvasRectangle());
            return pointCanvas;
        }
        /**
         * Returns a point in the browser page matching the given point of the viewport
         */
        pointClientToScreen(_client) {
            let screen = new FudgeCore.Vector2(this.#canvas.offsetLeft + _client.x, this.#canvas.offsetTop + _client.y);
            return screen;
        }
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         * // TODO: examine, if this can be achieved by regular DOM-Focus and tabindex=0
         */
        setFocus(_on) {
            if (_on) {
                if (Viewport.focus == this)
                    return;
                if (Viewport.focus)
                    Viewport.focus.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = this;
                this.dispatchEvent(new Event("focusin" /* FOCUS_IN */));
            }
            else {
                if (Viewport.focus != this)
                    return;
                this.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = null;
            }
        }
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event
         */
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.#canvas, _type, this.hndPointerEvent, _on);
        }
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         */
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.#canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         */
        activateDragDropEvent(_type, _on) {
            if (_type == "\u0192dragstart" /* START */)
                this.#canvas.draggable = _on;
            this.activateEvent(this.#canvas, _type, this.hndDragDropEvent, _on);
        }
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         */
        activateWheelEvent(_type, _on) {
            this.activateEvent(this.#canvas, _type, this.hndWheelEvent, _on);
        }
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         */
        addCanvasPosition(event) {
            event.canvasX = this.#canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.#canvas.height * event.pointerY / event.clientRect.height;
        }
        activateEvent(_target, _type, _handler, _on) {
            _type = _type.slice(1); // chip the ƒlorin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
        hndComponentEvent(_event) {
            FudgeCore.Debug.fudge(_event);
        }
    }
    FudgeCore.Viewport = Viewport;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Viewport.js.map