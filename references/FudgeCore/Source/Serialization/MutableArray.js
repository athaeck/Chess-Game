"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Mutable array of [[Mutable]]s. The [[Mutator]]s of the entries are included as array in the [[Mutator]]
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class MutableArray extends Array {
        rearrange(_sequence) {
            let length = this.length;
            for (let index of _sequence) {
                let original = this[index];
                // TODO: optimize, copy only double entries
                //@ts-ignore
                let copy = new original.constructor();
                copy.mutate(original.getMutator());
                this.push(copy);
            }
            this.splice(0, length);
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let entry in this)
                types[entry] = this[entry].constructor.name;
            return types;
        }
        getMutator() {
            return this.map((_value) => _value.getMutator());
        }
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        async mutate(_mutator) {
            for (let entry in this)
                await this[entry].mutate(_mutator[entry]);
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         */
        updateMutator(_mutator) {
            for (let entry in this) {
                let mutatorValue = _mutator[entry];
                if (!mutatorValue)
                    continue;
                if (this[entry] instanceof FudgeCore.Mutable)
                    _mutator[entry] = this[entry].getMutator();
                else
                    _mutator[entry] = this[entry];
            }
        }
    }
    FudgeCore.MutableArray = MutableArray;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MutableArray.js.map