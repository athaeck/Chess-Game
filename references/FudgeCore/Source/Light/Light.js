"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Light extends FudgeCore.Mutable {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
        }
        getType() {
            return this.constructor;
        }
        serialize() {
            let serialization = {
                color: this.color.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.color.deserialize(_serialization.color);
            return this;
        }
        reduceMutator() { }
    }
    FudgeCore.Light = Light;
    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)
     * ```plaintext
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightAmbient = LightAmbient;
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * ```plaintext
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightDirectional = LightDirectional;
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * ```plaintext
     *         .\|/.
     *        -- o --
     *         ´/|\`
     * ```
     */
    class LightPoint extends Light {
        constructor() {
            super(...arguments);
            this.range = 10;
        }
    }
    FudgeCore.LightPoint = LightPoint;
    /**
     * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color
     * ```plaintext
     *          o
     *         /|\
     *        / | \
     * ```
     */
    class LightSpot extends Light {
    }
    FudgeCore.LightSpot = LightSpot;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Light.js.map