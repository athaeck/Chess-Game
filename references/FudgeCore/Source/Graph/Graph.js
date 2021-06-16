"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * A node managed by [[Project]] that functions as a template for [[GraphInstance]]s
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
     */
    class Graph extends FudgeCore.Node {
        constructor() {
            super(...arguments);
            this.idResource = undefined;
            this.type = "Graph";
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.idResource;
            serialization.type = this.type;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            FudgeCore.Project.register(this, _serialization.idResource);
            return this;
        }
    }
    FudgeCore.Graph = Graph;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Graph.js.map