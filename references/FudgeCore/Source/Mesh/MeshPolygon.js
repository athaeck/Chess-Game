"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a flat polygon. All trigons share vertex 0, so careful design is required to create concave polygons.
     * Vertex 0 is also associated with the face normal.
     * ```plaintext
     *             0
     *           1╱|╲  4 ...
     *            ╲|_╲╱
     *            2   3
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class MeshPolygon extends FudgeCore.Mesh {
        constructor(_name = "MeshPolygon", _shape = MeshPolygon.verticesDefault, _fitTexture = true) {
            super(_name);
            this.shape = new FudgeCore.MutableArray();
            this.create(_shape, _fitTexture);
        }
        // private static fitMesh(_vertices: Vector2[]): Vector2[] {
        //   let result: Vector2[] = [];
        //   let min: Vector2 = Vector2.ZERO();
        //   let max: Vector2 = Vector2.ZERO();
        //   for (let vertex of _vertices) {
        //     min.x = Math.min(min.x, vertex.x);
        //     max.x = Math.max(max.x, vertex.x);
        //     min.y = Math.min(min.y, vertex.y);
        //     max.y = Math.max(max.y, vertex.y);
        //   }
        //   let center: Vector2 = new Vector2((min.x + max.x) / 2, (min.y + max.y) / 2);
        //   let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);
        //   for (let vertex of _vertices) {
        //     let adjusted: Vector2 = Vector2.DIFFERENCE(vertex, center);
        //     adjusted.x /= size.x;
        //     adjusted.y /= size.y;
        //     result.push(adjusted);
        //   }
        //   return result;
        // }
        get minVertices() {
            return 3;
        }
        create(_shape = [], _fitTexture = true) {
            this.shape = FudgeCore.MutableArray.from(_shape.map(_vertex => _vertex.copy));
            this.clear();
            this.fitTexture = _fitTexture;
            if (_shape.length < this.minVertices) {
                FudgeCore.Debug.warn(`At least ${this.minVertices} vertices needed to construct MeshPolygon, default trigon used`);
                this.create(MeshPolygon.verticesDefault, true);
                return;
            }
            let shape = _shape;
            let min = FudgeCore.Vector2.ZERO();
            let max = FudgeCore.Vector2.ZERO();
            let vertices = [];
            for (let vertex of shape) {
                vertices.push(vertex.x);
                vertices.push(vertex.y);
                vertices.push(0);
                min.x = Math.min(min.x, vertex.x);
                max.x = Math.max(max.x, vertex.x);
                min.y = Math.min(min.y, vertex.y);
                max.y = Math.max(max.y, vertex.y);
            }
            let size = new FudgeCore.Vector2(max.x - min.x, max.y - min.y);
            let textureUVs = [];
            if (this.fitTexture) {
                for (let vertex of shape) {
                    let textureUV = FudgeCore.Vector2.SUM(vertex, min);
                    textureUV.y *= -1;
                    textureUVs.push(textureUV.x / size.x);
                    textureUVs.push(textureUV.y / size.y);
                }
            }
            else {
                textureUVs = _shape.map(_vertex => [_vertex.x, -_vertex.y]).flat();
            }
            // console.log(textureUVs);
            this.ƒvertices = new Float32Array(vertices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒindices = this.createIndices();
            // this.ƒnormalsFace = this.createFaceNormals();
            // this.createRenderBuffers();
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.shape = FudgeCore.Serializer.serializeArray(FudgeCore.Vector2, this.shape);
            serialization.fitTexture = this.fitTexture;
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            let vectors = await FudgeCore.Serializer.deserializeArray(_serialization.shape);
            this.create(vectors, _serialization.fitTexture);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.create(this.shape, _mutator.fitTexture);
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        //#endregion
        createIndices() {
            let indices = [];
            for (let i = 2; i < this.vertices.length / 3; i++)
                indices.push(0, i - 1, i);
            return new Uint16Array(indices);
        }
    }
    MeshPolygon.iSubclass = FudgeCore.Mesh.registerSubclass(MeshPolygon);
    MeshPolygon.verticesDefault = [
        new FudgeCore.Vector2(-1, -1),
        new FudgeCore.Vector2(1, -1),
        new FudgeCore.Vector2(0, 1)
    ];
    FudgeCore.MeshPolygon = MeshPolygon;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshPolygon.js.map