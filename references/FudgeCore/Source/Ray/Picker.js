"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Provides static methods for picking using [[Render]]
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Picker {
        /**
         * Takes a ray plus min and max values for the near and far planes to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted [[Pick]]-array with information about the hits of the ray.
         */
        static pickRay(_branch, _ray, _min, _max) {
            let cmpCameraPick = new FudgeCore.ComponentCamera();
            cmpCameraPick.mtxPivot.translation = _ray.origin;
            cmpCameraPick.mtxPivot.lookAt(_ray.direction);
            cmpCameraPick.projectCentral(1, 0.001, FudgeCore.FIELD_OF_VIEW.DIAGONAL, _min, _max);
            let picks = FudgeCore.Render.pickBranch(_branch, cmpCameraPick);
            return picks;
        }
        /**
         * Takes a camera and a point on its virtual normed projection plane (distance 1) to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted [[Pick]]-array with information about the hits of the ray.
         */
        static pickCamera(_branch, _cmpCamera, _posProjection) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-_posProjection.x, _posProjection.y, 1));
            let length = ray.direction.magnitude;
            let mtxCamera = _cmpCamera.mtxPivot;
            if (_cmpCamera.getContainer())
                mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.mtxPivot);
            ray.transform(mtxCamera);
            let picks = Picker.pickRay(_branch, ray, length * _cmpCamera.getNear(), length * _cmpCamera.getFar());
            return picks;
        }
        /**
         * Takes the camera of the given viewport and a point the client surface to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted [[Pick]]-array with information about the hits of the ray.
         */
        static pickViewport(_viewport, _posClient) {
            let posProjection = _viewport.pointClientToProjection(_posClient);
            let picks = Picker.pickCamera(_viewport.getBranch(), _viewport.camera, posProjection);
            return picks;
        }
    }
    FudgeCore.Picker = Picker;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Picker.js.map