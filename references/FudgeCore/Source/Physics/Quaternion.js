"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
      * Storing and manipulating rotations in the form of quaternions.
      * Constructed out of the 4 components x,y,z,w. Commonly used to calculate rotations in physics engines.
      * Class mostly used internally to bridge the in FUDGE commonly used angles in degree to OimoPhysics quaternion system.
      * @authors Marko Fehrenbach, HFU, 2020
      */
    class Quaternion extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0, _w = 0) {
            super();
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
        }
        /** Get/Set the X component of the Quaternion. Real Part */
        get X() {
            return this.x;
        }
        set X(_x) {
            this.x = _x;
        }
        /** Get/Set the Y component of the Quaternion. Real Part */
        get Y() {
            return this.y;
        }
        set Y(_y) {
            this.y = _y;
        }
        /** Get/Set the Z component of the Quaternion. Real Part */
        get Z() {
            return this.z;
        }
        set Z(_z) {
            this.z = _z;
        }
        /** Get/Set the Y component of the Quaternion. Imaginary Part */
        get W() {
            return this.w;
        }
        set W(_w) {
            this.w = _w;
        }
        /**
         * Create quaternion from vector3 angles in degree
         */
        setFromVector3(rollX, pitchY, yawZ) {
            let cy = Math.cos(yawZ * 0.5);
            let sy = Math.sin(yawZ * 0.5);
            let cp = Math.cos(pitchY * 0.5);
            let sp = Math.sin(pitchY * 0.5);
            let cr = Math.cos(rollX * 0.5);
            let sr = Math.sin(rollX * 0.5);
            this.w = cr * cp * cy + sr * sp * sy;
            this.x = sr * cp * cy - cr * sp * sy;
            this.y = cr * sp * cy + sr * cp * sy;
            this.z = cr * cp * sy - sr * sp * cy;
        }
        /**
         * Returns the euler angles in radians as Vector3 from this quaternion.
         */
        toEulerangles() {
            let angles = new FudgeCore.Vector3();
            // roll (x-axis rotation)
            let sinrcosp = 2 * (this.w * this.x + this.y * this.z);
            let cosrcosp = 1 - 2 * (this.x * this.x + this.y * this.y);
            angles.x = Math.atan2(sinrcosp, cosrcosp);
            // pitch (y-axis rotation)
            let sinp = 2 * (this.w * this.y - this.z * this.x);
            if (Math.abs(sinp) >= 1)
                angles.y = this.copysign(Math.PI / 2, sinp); // use 90 degrees if out of range
            else
                angles.y = Math.asin(sinp);
            // yaw (z-axis rotation)
            let sinycosp = 2 * (this.w * this.z + this.x * this.y);
            let cosycosp = 1 - 2 * (this.y * this.y + this.z * this.z);
            angles.z = Math.atan2(sinycosp, cosycosp);
            return angles;
        }
        /**
         * Return angles in degrees as vector3 from this. quaterion
         */
        toDegrees() {
            let angles = this.toEulerangles();
            angles.x = angles.x * (180 / Math.PI);
            angles.y = angles.y * (180 / Math.PI);
            angles.z = angles.z * (180 / Math.PI);
            return angles;
        }
        getMutator() {
            let mutator = {
                x: this.x, y: this.y, z: this.z, w: this.w
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
        /** Copying the sign of a to b */
        copysign(a, b) {
            return b < 0 ? -Math.abs(a) : Math.abs(a);
        }
    }
    FudgeCore.Quaternion = Quaternion;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Quaternion.js.map