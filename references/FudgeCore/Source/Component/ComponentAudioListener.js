"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Serves to set the spatial location and orientation of AudioListeners relative to the
     * world transform of the [[Node]] it is attached to.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentAudioListener extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        }
        /**
         * Updates the position and orientation of the given AudioListener
         */
        update(_listener) {
            let mtxResult = this.mtxPivot;
            if (this.getContainer())
                mtxResult = FudgeCore.Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.mtxPivot);
            // Debug.log(mtxResult.toString());
            let position = mtxResult.translation;
            let forward = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Z(1), mtxResult, false);
            let up = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Y(), mtxResult, false);
            _listener.positionX.value = position.x;
            _listener.positionY.value = position.y;
            _listener.positionZ.value = position.z;
            _listener.forwardX.value = forward.x;
            _listener.forwardY.value = forward.y;
            _listener.forwardZ.value = forward.z;
            _listener.upX.value = up.x;
            _listener.upY.value = up.y;
            _listener.upZ.value = up.z;
            // Debug.log(mtxResult.translation.toString(), forward.toString(), up.toString());
        }
    }
    ComponentAudioListener.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudioListener);
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentAudioListener.js.map