"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * An instance of a [[Graph]].
     * This node keeps a reference to its resource an can thus optimize serialization
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
     */
    class GraphInstance extends FudgeCore.Node {
        constructor(_graph) {
            super("Graph");
            /** id of the resource that instance was created from */
            // TODO: examine, if this should be a direct reference to the Graph, instead of the id
            this.idSource = undefined;
            if (!_graph)
                return;
            this.idSource = _graph.idResource;
            this.reset();
        }
        /**
         * Recreate this node from the [[Graph]] referenced
         */
        async reset() {
            let resource = await FudgeCore.Project.getResource(this.idSource);
            await this.set(resource);
        }
        //TODO: optimize using the referenced Graph, serialize/deserialize only the differences
        serialize() {
            let serialization = super.serialize();
            serialization.idSource = this.idSource;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.idSource = _serialization.idSource;
            return this;
        }
        /**
         * Set this node to be a recreation of the [[Graph]] given
         */
        async set(_graph) {
            // TODO: examine, if the serialization should be stored in the Graph for optimization
            let serialization = FudgeCore.Serializer.serialize(_graph);
            //Serializer.deserialize(serialization);
            for (let path in serialization) {
                await this.deserialize(serialization[path]);
                break;
            }
            this.idSource = _graph.idResource;
            this.dispatchEvent(new Event("graphInstantiated" /* GRAPH_INSTANTIATED */));
        }
    }
    FudgeCore.GraphInstance = GraphInstance;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=GraphInstance.js.map