"use strict";
// / <reference path="Component.ts"/>
var FudgeCore;
(function (FudgeCore) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW[FIELD_OF_VIEW["HORIZONTAL"] = 0] = "HORIZONTAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["VERTICAL"] = 1] = "VERTICAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["DIAGONAL"] = 2] = "DIAGONAL";
    })(FIELD_OF_VIEW = FudgeCore.FIELD_OF_VIEW || (FudgeCore.FIELD_OF_VIEW = {}));
    /**
     * Defines identifiers for the various projections a camera can provide.
     * TODO: change back to number enum if strings not needed
     */
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = FudgeCore.PROJECTION || (FudgeCore.PROJECTION = {}));
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.clrBackground = new FudgeCore.Color(0, 0, 0, 1); // The color of the background the camera will render.
            //private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projection = PROJECTION.CENTRAL;
            this.mtxProjection = new FudgeCore.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.near = 1;
            this.far = 2000;
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
            //#endregion
        }
        // TODO: examine, if background should be an attribute of Camera or Viewport
        /**
         * Returns the multiplikation of the worldtransformation of the camera container, the pivot of this camera and the inversion of the projection matrix
         * yielding the worldspace to viewspace matrix
         */
        get mtxWorldToView() {
            //TODO: optimize, no need to recalculate if neither mtxWorld nor pivot have changed
            let mtxCamera = this.mtxPivot;
            try {
                mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.mtxPivot);
            }
            catch (_error) {
                // no container node or no world transformation found -> continue with pivot only
            }
            let mtxResult = FudgeCore.Matrix4x4.INVERSION(mtxCamera);
            mtxResult = FudgeCore.Matrix4x4.MULTIPLICATION(this.mtxProjection, mtxResult);
            return mtxResult;
        }
        getProjection() {
            return this.projection;
        }
        getBackgroundEnabled() {
            return this.backgroundEnabled;
        }
        getAspect() {
            return this.aspectRatio;
        }
        getFieldOfView() {
            return this.fieldOfView;
        }
        getDirection() {
            return this.direction;
        }
        getNear() {
            return this.near;
        }
        getFar() {
            return this.far;
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction, _near = 1, _far = 2000) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.near = _near;
            this.far = _far;
            this.mtxProjection = FudgeCore.Matrix4x4.PROJECTION_CENTRAL(_aspect, this.fieldOfView, _near, _far, this.direction); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvas.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = FudgeCore.Render.getCanvas().clientWidth, _bottom = FudgeCore.Render.getCanvas().clientHeight, _top = 0) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.mtxProjection = FudgeCore.Matrix4x4.PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
        /**
         * Return the calculated dimension of a projection surface in the hypothetical distance of 1 to the camera
         */
        getProjectionRectangle() {
            let tanFov = Math.tan(Math.PI * this.fieldOfView / 360); // Half of the angle, to calculate dimension from the center -> right angle
            let tanHorizontal = 0;
            let tanVertical = 0;
            if (this.direction == FIELD_OF_VIEW.DIAGONAL) {
                let aspect = Math.sqrt(this.aspectRatio);
                tanHorizontal = tanFov * aspect;
                tanVertical = tanFov / aspect;
            }
            else if (this.direction == FIELD_OF_VIEW.VERTICAL) {
                tanVertical = tanFov;
                tanHorizontal = tanVertical * this.aspectRatio;
            }
            else { //FOV_DIRECTION.HORIZONTAL
                tanHorizontal = tanFov;
                tanVertical = tanHorizontal / this.aspectRatio;
            }
            return FudgeCore.Rectangle.GET(0, 0, tanHorizontal * 2, tanVertical * 2);
        }
        pointWorldToClip(_pointInWorldSpace) {
            let result;
            let m = this.mtxWorldToView.get();
            let w = m[3] * _pointInWorldSpace.x + m[7] * _pointInWorldSpace.y + m[11] * _pointInWorldSpace.z + m[15];
            result = FudgeCore.Vector3.TRANSFORMATION(_pointInWorldSpace, this.mtxWorldToView);
            result.scale(1 / w);
            return result;
        }
        pointClipToWorld(_pointInClipSpace) {
            let mtxViewToWorld = FudgeCore.Matrix4x4.INVERSION(this.mtxWorldToView);
            let m = mtxViewToWorld.get();
            let rayWorld = FudgeCore.Vector3.TRANSFORMATION(_pointInClipSpace, mtxViewToWorld, true);
            let w = m[3] * _pointInClipSpace.x + m[7] * _pointInClipSpace.y + m[11] * _pointInClipSpace.z + m[15];
            rayWorld.scale(1 / w);
            return rayWorld;
        }
        //#region Transfer
        serialize() {
            let serialization = {
                backgroundColor: this.clrBackground,
                backgroundEnabled: this.backgroundEnabled,
                projection: this.projection,
                fieldOfView: this.fieldOfView,
                direction: this.direction,
                aspect: this.aspectRatio,
                pivot: this.mtxPivot.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.clrBackground = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.projection = _serialization.projection;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.direction = _serialization.direction;
            this.mtxPivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            switch (this.projection) {
                case PROJECTION.ORTHOGRAPHIC:
                    this.projectOrthographic(); // TODO: serialize and deserialize parameters
                    break;
                case PROJECTION.CENTRAL:
                    this.projectCentral();
                    break;
            }
            return this;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.direction)
                types.direction = FIELD_OF_VIEW;
            if (types.projection)
                types.projection = PROJECTION;
            return types;
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            switch (this.projection) {
                case PROJECTION.CENTRAL:
                    this.projectCentral(this.aspectRatio, this.fieldOfView, this.direction);
                    break;
            }
        }
        reduceMutator(_mutator) {
            delete _mutator.transform;
            super.reduceMutator(_mutator);
        }
    }
    ComponentCamera.iSubclass = FudgeCore.Component.registerSubclass(ComponentCamera);
    FudgeCore.ComponentCamera = ComponentCamera;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentCamera.js.map