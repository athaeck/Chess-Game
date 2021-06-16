"use strict";
var FudgeCore;
(function (FudgeCore) {
    // export interface MutatorForComponent extends Mutator { readonly forUserComponent: null; }
    /**
     * Collect applicable attributes of the instance and copies of their values in a Mutator-object
     */
    function getMutatorOfArbitrary(_object) {
        let mutator = {};
        let attributes = Reflect.ownKeys(Reflect.getPrototypeOf(_object));
        for (let attribute of attributes) {
            let value = Reflect.get(_object, attribute);
            if (value instanceof Function)
                continue;
            // if (value instanceof Object && !(value instanceof Mutable))
            //   continue;
            mutator[attribute.toString()] = value;
        }
        return mutator;
    }
    FudgeCore.getMutatorOfArbitrary = getMutatorOfArbitrary;
    /**
     * Base class for all types being mutable using [[Mutator]]-objects, thus providing and using interfaces created at runtime.
     * Mutables provide a [[Mutator]] that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard [[Mutator]] built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the [[Mutator]] must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
     */
    class Mutable extends FudgeCore.EventTargetƒ {
        /**
         * Decorator allows to attach [[Mutable]] functionality to existing classes.
         */
        // public static decorate(_constructor: Function): void {
        //   Object.defineProperty(_constructor.prototype, "useRenderData", {
        //     value: function getMutator(this: MutableForUserInterface): Mutator {
        //       return getMutatorOfArbitrary(this);
        //     }
        //   });
        // }
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        get type() {
            return this.constructor.name;
        }
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object.
         * By default, a mutator cannot extended, since extensions are not available in the object the mutator belongs to.
         * A mutator may be reduced by the descendants of [[Mutable]] to contain only the properties needed.
         */
        getMutator(_extendable = false) {
            let mutator = {};
            // collect primitive and mutable attributes
            for (let attribute in this) {
                let value = this[attribute];
                if (value instanceof Function)
                    continue;
                if (value instanceof Object && !(value instanceof Mutable) && !(value instanceof FudgeCore.MutableArray) && !(value.hasOwnProperty("idResource")))
                    continue;
                mutator[attribute] = this[attribute];
            }
            if (!_extendable)
                // mutator can be reduced but not extended!
                Object.preventExtensions(mutator);
            // delete unwanted attributes
            this.reduceMutator(mutator);
            // replace references to mutable objects with references to mutators
            for (let attribute in mutator) {
                let value = mutator[attribute];
                if (value instanceof Mutable)
                    mutator[attribute] = value.getMutator();
                if (value instanceof FudgeCore.MutableArray)
                    mutator[attribute] = value.map((_value) => _value.getMutator());
            }
            return mutator;
        }
        /**
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation() {
            return this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for indiviualization by the component.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        // public getMutatorForComponent(): MutatorForComponent {
        //     return <MutatorForComponent>this.getMutator();
        // }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * Does not recurse into objects!
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                let type = null;
                let value = _mutator[attribute];
                if (_mutator[attribute] != undefined)
                    if (typeof (value) == "object")
                        type = this[attribute].constructor.name;
                    else if (typeof (value) == "function")
                        type = value["name"];
                    else
                        type = _mutator[attribute].constructor.name;
                types[attribute] = type;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator) {
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                if (value instanceof Mutable)
                    _mutator[attribute] = value.getMutator();
                else
                    _mutator[attribute] = this[attribute];
            }
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        async mutate(_mutator) {
            for (let attribute in _mutator) {
                if (!Reflect.has(this, attribute))
                    continue;
                let mutant = Reflect.get(this, attribute);
                let value = _mutator[attribute];
                if (mutant instanceof FudgeCore.MutableArray || mutant instanceof Mutable)
                    await mutant.mutate(value);
                else
                    Reflect.set(this, attribute, value);
            }
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
    }
    FudgeCore.Mutable = Mutable;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Mutable.js.map