"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class ComponentScript extends FudgeCore.Component {
        constructor() {
            super();
            this.singleton = false;
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
    }
    // registering this doesn't make sense, only its subclasses. Or this component must refer to scripts to be attached to this component
    // TODO: rethink & refactor
    ComponentScript.iSubclass = FudgeCore.Component.registerSubclass(ComponentScript);
    FudgeCore.ComponentScript = ComponentScript;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentScript.js.map