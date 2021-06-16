"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material extends FudgeCore.Mutable {
        constructor(_name, _shader, _coat) {
            super();
            this.idResource = undefined;
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
            FudgeCore.Project.register(this);
        }
        /**
         * Creates a new [[Coat]] instance that is valid for the [[Shader]] referenced by this material
         */
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        /**
         * Makes this material reference the given [[Coat]] if it is compatible with the referenced [[Shader]]
         * @param _coat
         */
        setCoat(_coat) {
            if (_coat.constructor != this.shaderType.getCoat())
                if (_coat instanceof this.shaderType.getCoat())
                    FudgeCore.Debug.fudge("Coat is extension of Coat required by shader");
                else
                    throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }
        /**
         * Returns the currently referenced [[Coat]] instance
         */
        getCoat() {
            return this.coat;
        }
        /**
         * Changes the materials reference to the given [[Shader]], creates and references a new [[Coat]] instance
         * and mutates the new coat to preserve matching properties.
         * @param _shaderType
         */
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
            this.setCoat(coat);
        }
        /**
         * Returns the [[Shader]] referenced by this material
         */
        getShader() {
            return this.shaderType;
        }
        //#region Transfer
        // TODO: this type of serialization was implemented for implicit Material create. Check if obsolete when only one material class exists and/or materials are stored separately
        serialize() {
            let serialization = {
                name: this.name,
                idResource: this.idResource,
                shader: this.shaderType.name,
                coat: FudgeCore.Serializer.serialize(this.coat)
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.name = _serialization.name;
            FudgeCore.Project.register(this, _serialization.idResource);
            // this.idResource = _serialization.idResource;
            // TODO: provide for shaders in the users namespace. See Serializer fullpath etc.
            // tslint:disable-next-line: no-any
            this.shaderType = FudgeCore[_serialization.shader];
            let coat = await FudgeCore.Serializer.deserialize(_serialization.coat);
            this.setCoat(coat);
            return this;
        }
        reduceMutator(_mutator) {
            // delete _mutator.idResource;
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Material.js.map