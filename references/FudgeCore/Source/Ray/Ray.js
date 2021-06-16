"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defined by an origin and a direction of type [[Vector3]], rays are used to calculate picking an intersections
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Ray {
        constructor(_direction = FudgeCore.Vector3.Z(-1), _origin = FudgeCore.Vector3.ZERO(), _length = 1) {
            this.origin = _origin;
            this.direction = _direction;
            this.length = _length;
        }
        /**
         * Returns the point of intersection of this ray with a plane defined by
         * the given point of origin and the planes normal. All values and calculations
         * must be relative to the same coordinate system, preferably the world
         */
        intersectPlane(_origin, _normal) {
            let difference = FudgeCore.Vector3.DIFFERENCE(_origin, this.origin);
            let factor = FudgeCore.Vector3.DOT(difference, _normal) / FudgeCore.Vector3.DOT(this.direction, _normal);
            let intersect = FudgeCore.Vector3.SUM(this.origin, FudgeCore.Vector3.SCALE(this.direction, factor));
            return intersect;
        }
        /**
         * Returns the shortest distance from the ray to the given target point.
         * All values and calculations must be relative to the same coordinate system, preferably the world.
         */
        getDistance(_target) {
            let originToTarget = FudgeCore.Vector3.DIFFERENCE(_target, this.origin);
            let raySection = FudgeCore.Vector3.NORMALIZATION(this.direction, 1);
            let projectedLength = FudgeCore.Vector3.DOT(originToTarget, raySection);
            raySection.scale(projectedLength);
            raySection.add(this.origin);
            let distance = FudgeCore.Vector3.DIFFERENCE(_target, raySection);
            return distance;
        }
        /**
         * Transform the ray by the given matrix
         */
        transform(_mtxTransform) {
            this.direction.transform(_mtxTransform);
            this.origin.transform(_mtxTransform);
        }
        /**
         * Returns a readable string representation of this ray
         */
        toString() {
            return `origin: ${this.origin.toString()}, direction: ${this.direction.toString()}, length: ${this.length.toPrecision(5)}`;
        }
    }
    FudgeCore.Ray = Ray;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Ray.js.map