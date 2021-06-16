"use strict";
// / <reference path="../Transfer/Serializer.ts"/>
// / <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020 | Jascha Karagöl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class Component extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.singleton = true;
            this.active = true;
            this.container = null;
            //#endregion
        }
        static registerSubclass(_subclass) { return Component.subclasses.push(_subclass) - 1; }
        get isActive() {
            return this.active;
        }
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton() {
            return this.singleton;
        }
        activate(_on) {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? "componentActivate" /* COMPONENT_ACTIVATE */ : "componentDeactivate" /* COMPONENT_DEACTIVATE */));
        }
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        getContainer() {
            return this.container;
        }
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                if (this.container)
                    this.container.addComponent(this);
            }
            catch (_error) {
                this.container = previousContainer;
            }
        }
        //#region Transfer
        serialize() {
            let serialization = {
                active: this.active
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.active = _serialization.active;
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.singleton;
            delete _mutator.container;
            delete _mutator.mtxWorld;
        }
    }
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    Component.baseClass = Component;
    /** list of all the subclasses derived from this class, if they registered properly*/
    Component.subclasses = [];
    FudgeCore.Component = Component;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Component.js.map