"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Representation of a vector2 as polar coordinates
     * ```plaintext
     *  ↕- angle (Angle to the x-axis)
     *  -→ Magnitude (Distance from the center)
     * ```
     */
    class Geo2 {
        constructor(_angle = 0, _magnitude = 1) {
            this.magnitude = 0;
            this.angle = 0;
            this.set(_angle, _magnitude);
        }
        /**
         * Set the properties of this instance at once
         */
        set(_angle = 0, _magnitude = 1) {
            this.magnitude = _magnitude;
            this.angle = _angle;
        }
        /**
         * Returns a pretty string representation
         */
        toString() {
            return `angle: ${this.angle.toPrecision(5)},  magnitude: ${this.magnitude.toPrecision(5)}`;
        }
    }
    FudgeCore.Geo2 = Geo2;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Geo2.js.map