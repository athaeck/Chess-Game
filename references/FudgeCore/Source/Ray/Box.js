"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines a threedimensional box by two corner-points, one with minimal values and one with maximum values
     */
    class Box {
        constructor(_min = FudgeCore.Vector3.ONE(Infinity), _max = FudgeCore.Vector3.ONE(-Infinity)) {
            this.set(_min, _max);
        }
        /**
         * Define the corners of this box, standard values are Infinity for min, and -Infinity for max,
         * creating an impossible inverted box that can not contain any points
         */
        set(_min = FudgeCore.Vector3.ONE(Infinity), _max = FudgeCore.Vector3.ONE(-Infinity)) {
            this.min = _min;
            this.max = _max;
        }
        /**
         * Expand the box if necessary to include the given point
         */
        expand(_include) {
            this.min.min(_include);
            this.max.max(_include);
        }
    }
    FudgeCore.Box = Box;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Box.js.map