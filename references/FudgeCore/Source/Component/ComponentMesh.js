"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends FudgeCore.Component {
        constructor(_mesh = null) {
            super();
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
            this.mesh = null;
            this.mesh = _mesh;
        }
        get radius() {
            let scaling = this.mtxWorld.scaling;
            let scale = Math.max(Math.abs(scaling.x), Math.abs(scaling.y), Math.abs(scaling.z));
            return this.mesh.radius * scale;
        }
        // TODO: remove or think if the transformed bounding box is of value or can be made to be
        // public get boundingBox(): Box {
        //   let box: Box = Recycler.get(Box);
        //   box.set(
        //     Vector3.TRANSFORMATION(this.mesh.boundingBox.min, this.mtxWorld, true),
        //     Vector3.TRANSFORMATION(this.mesh.boundingBox.max, this.mtxWorld, true)
        //   );
        //   return box;
        // }
        //#region Transfer
        serialize() {
            let serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMesh = this.mesh.idResource;
            if (idMesh)
                serialization = { idMesh: idMesh };
            else
                serialization = { mesh: FudgeCore.Serializer.serialize(this.mesh) };
            serialization.pivot = this.mtxPivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            let mesh;
            if (_serialization.idMesh)
                mesh = await FudgeCore.Project.getResource(_serialization.idMesh);
            else
                mesh = await FudgeCore.Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;
            this.mtxPivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutatorForUserInterface() {
            let mutator = this.getMutator();
            // if (!this.mesh)
            //   mutator.mesh = Mesh;
            return mutator;
        }
    }
    ComponentMesh.iSubclass = FudgeCore.Component.registerSubclass(ComponentMesh);
    FudgeCore.ComponentMesh = ComponentMesh;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentMesh.js.map