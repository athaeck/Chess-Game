"use strict";
///<reference path="../Light/Light.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines identifiers for the various types of light this component can provide.
     */
    // export let LIGHT_TYPE: { [type: string]: string } = {
    let LIGHT_TYPE;
    (function (LIGHT_TYPE) {
        LIGHT_TYPE["AMBIENT"] = "LightAmbient";
        LIGHT_TYPE["DIRECTIONAL"] = "LightDirectional";
        LIGHT_TYPE["POINT"] = "LightPoint";
        LIGHT_TYPE["SPOT"] = "LightSpot";
    })(LIGHT_TYPE = FudgeCore.LIGHT_TYPE || (FudgeCore.LIGHT_TYPE = {}));
    /**
      * Attaches a [[Light]] to the node
      * @authors Jirka Dell'Oro-Friedl, HFU, 2019
      */
    class ComponentLight extends FudgeCore.Component {
        constructor(_light = new FudgeCore.LightAmbient()) {
            super();
            // private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.light = null;
            this.singleton = false;
            this.light = _light;
        }
        setType(_class) {
            let mtrOld = {};
            if (this.light)
                mtrOld = this.light.getMutator();
            this.light = new _class();
            this.light.mutate(mtrOld);
        }
        serialize() {
            let serialization = {
                pivot: this.mtxPivot.serialize(),
                light: FudgeCore.Serializer.serialize(this.light)
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.mtxPivot.deserialize(_serialization.pivot);
            this.light = await FudgeCore.Serializer.deserialize(_serialization.light);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.type = this.light.getType().name;
            return mutator;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.type)
                types.type = LIGHT_TYPE;
            return types;
        }
        async mutate(_mutator) {
            let type = _mutator.type;
            if (type != this.light.constructor.name)
                this.setType(FudgeCore.Serializer.getConstructor(type));
            delete (_mutator.type); // exclude light type from further mutation
            super.mutate(_mutator);
            _mutator.type = type; // reconstruct mutator
        }
    }
    ComponentLight.iSubclass = FudgeCore.Component.registerSubclass(ComponentLight);
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentLight.js.map