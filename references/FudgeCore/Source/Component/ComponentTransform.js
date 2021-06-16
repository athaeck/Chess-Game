"use strict";
var FudgeCore;
(function (FudgeCore) {
    let BASE;
    (function (BASE) {
        BASE[BASE["SELF"] = 0] = "SELF";
        BASE[BASE["PARENT"] = 1] = "PARENT";
        BASE[BASE["WORLD"] = 2] = "WORLD";
        BASE[BASE["NODE"] = 3] = "NODE";
    })(BASE = FudgeCore.BASE || (FudgeCore.BASE = {}));
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends FudgeCore.Component {
        constructor(_mtxInit = FudgeCore.Matrix4x4.IDENTITY()) {
            super();
            this.mtxLocal = _mtxInit;
        }
        //#region Transformations respecting the hierarchy
        /**
         * Adjusts the rotation to point the z-axis directly at the given target point in world space and tilts it to accord with the given up vector,
         * respectively calculating yaw and pitch. If no up vector is given, the previous up-vector is used.
         */
        lookAt(_targetWorld, _up) {
            let container = this.getContainer();
            if (!container && !container.getParent())
                return this.mtxLocal.lookAt(_targetWorld, _up);
            // component is attached to a child node -> transform respecting the hierarchy
            let mtxWorld = container.mtxWorld.copy;
            mtxWorld.lookAt(_targetWorld, _up, true);
            let mtxLocal = FudgeCore.Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
            this.mtxLocal = mtxLocal;
        }
        /**
         * Adjusts the rotation to match its y-axis with the given up-vector and facing its z-axis toward the given target at minimal angle,
         * respectively calculating yaw only. If no up vector is given, the previous up-vector is used.
         */
        showTo(_targetWorld, _up) {
            let container = this.getContainer();
            if (!container && !container.getParent())
                return this.mtxLocal.showTo(_targetWorld, _up);
            // component is attached to a child node -> transform respecting the hierarchy
            let mtxWorld = container.mtxWorld.copy;
            mtxWorld.showTo(_targetWorld, _up, true);
            let mtxLocal = FudgeCore.Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
            this.mtxLocal = mtxLocal;
        }
        /**
         * recalculates this local matrix to yield the identical world matrix based on the given node.
         * Use rebase before appending the container of this component to another node while preserving its transformation in the world.
         */
        rebase(_node = null) {
            let mtxResult = this.mtxLocal;
            let container = this.getContainer();
            if (container)
                mtxResult = container.mtxWorld;
            if (_node)
                mtxResult = FudgeCore.Matrix4x4.RELATIVE(mtxResult, null, _node.mtxWorldInverse);
            this.mtxLocal = mtxResult;
        }
        /**
         * Applies the given transformation relative to the selected base (SELF, PARENT, WORLD) or a particular other node (NODE)
         */
        transform(_mtxTransform, _base = BASE.SELF, _node = null) {
            switch (_base) {
                case BASE.SELF:
                    this.mtxLocal.multiply(_mtxTransform);
                    break;
                case BASE.PARENT:
                    this.mtxLocal.multiply(_mtxTransform, true);
                    break;
                case BASE.NODE:
                    if (!_node)
                        throw new Error("BASE.NODE requires a node given as base");
                case BASE.WORLD:
                    this.rebase(_node);
                    this.mtxLocal.multiply(_mtxTransform, true);
                    let container = this.getContainer();
                    if (container) {
                        if (_base == BASE.NODE)
                            // fix mtxWorld of container for subsequent rebasing 
                            container.mtxWorld.set(FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, container.mtxLocal));
                        let parent = container.getParent();
                        if (parent) {
                            // fix mtxLocal for current parent
                            this.rebase(container.getParent());
                            container.mtxWorld.set(FudgeCore.Matrix4x4.MULTIPLICATION(container.getParent().mtxWorld, container.mtxLocal));
                        }
                    }
                    break;
            }
        }
        //#endregion
        //#region Transfer
        serialize() {
            let serialization = {
                local: this.mtxLocal.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            this.mtxLocal.deserialize(_serialization.local);
            return this;
        }
        // public mutate(_mutator: Mutator): void {
        //     this.local.mutate(_mutator);
        // }
        // public getMutator(): Mutator { 
        //     return this.local.getMutator();
        // }
        // public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
        //     let types: MutatorAttributeTypes = this.local.getMutatorAttributeTypes(_mutator);
        //     return types;
        // }
        reduceMutator(_mutator) {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
    }
    ComponentTransform.iSubclass = FudgeCore.Component.registerSubclass(ComponentTransform);
    FudgeCore.ComponentTransform = ComponentTransform;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentTransform.js.map