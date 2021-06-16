"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Representation of a vector3 as geographic coordinates as seen on a globe
     * ```plaintext
     * ←|→ Longitude (Angle to the z-axis)
     *  ↕- Latitude (Angle to the equator)
     *  -→ Magnitude (Distance from the center)
     * ```
     */
    class Geo3 {
        constructor(_longitude = 0, _latitude = 0, _magnitude = 1) {
            this.magnitude = 0;
            this.latitude = 0;
            this.longitude = 0;
            this.set(_longitude, _latitude, _magnitude);
        }
        /**
         * Set the properties of this instance at once
         */
        set(_longitude = 0, _latitude = 0, _magnitude = 1) {
            this.magnitude = _magnitude;
            this.latitude = _latitude;
            this.longitude = _longitude;
        }
        /**
         * Returns a pretty string representation
         */
        toString() {
            return `longitude: ${this.longitude.toPrecision(5)}, latitude: ${this.latitude.toPrecision(5)}, magnitude: ${this.magnitude.toPrecision(5)}`;
        }
    }
    FudgeCore.Geo3 = Geo3;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Geo3.js.map