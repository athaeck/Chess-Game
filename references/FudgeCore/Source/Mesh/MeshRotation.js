"use strict";
///<reference path="MeshPolygon.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generates a rotation of a polygon around the y-axis
     * ```plaintext
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class MeshRotation extends FudgeCore.MeshPolygon {
        constructor(_name = "MeshRotation", _vertices = MeshRotation.verticesDefault, _sectors = 3, _fitTexture = true) {
            super(_name, _vertices, _fitTexture);
            this.rotate(_sectors);
            // console.log("Mutator", this.getMutator());
        }
        get minVertices() {
            return 2;
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.sectors = this.sectors;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.sectors = _serialization.sectors;
            this.rotate(this.sectors);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.rotate(this.sectors);
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        //#endregion
        rotate(_sectors) {
            this.sectors = Math.round(_sectors);
            let angle = 360 / this.sectors;
            let mtxRotate = FudgeCore.Matrix4x4.ROTATION_Y(angle);
            // save original polygon
            let polygon = [];
            for (let i = 0; i < this.vertices.length; i += 3)
                polygon.push(new FudgeCore.Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));
            let nVerticesPolygon = polygon.length;
            // let nFacesPolygon: number = nVerticesPolygon - 2;
            // let nIndicesPolygon: number = nFacesPolygon * 3;
            let vertices = [];
            for (let sector = 0; sector <= this.sectors; sector++) {
                vertices.push(...polygon.map((_vector) => _vector.copy));
                polygon.forEach((_vector) => _vector.transform(mtxRotate));
                // vertices.push(...polygon.map((_vector: Vector3) => _vector.copy));
            }
            // copy indices to new index array
            let indices = [];
            for (let sector = 0; sector < this.sectors; sector++) {
                for (let quad = 0; quad < nVerticesPolygon - 1; quad++) {
                    let start = sector * nVerticesPolygon + quad;
                    let quadIndices = [start + 1, start + 1 + nVerticesPolygon, start + nVerticesPolygon, start];
                    indices.push(...FudgeCore.Mesh.getTrigonsFromQuad(quadIndices));
                }
            }
            FudgeCore.Mesh.deleteInvalidIndices(indices, vertices);
            let textureUVs = [];
            for (let sector = 0; sector <= this.sectors; sector++) {
                for (let i = 0; i < nVerticesPolygon; i++) {
                    let u = sector / this.sectors;
                    let v = i * 1 / (nVerticesPolygon - 1);
                    textureUVs.push(u, v);
                }
            }
            this.ƒvertices = new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
            this.ƒindices = new Uint16Array(indices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
        }
    }
    MeshRotation.iSubclass = FudgeCore.Mesh.registerSubclass(MeshRotation);
    MeshRotation.verticesDefault = [
        new FudgeCore.Vector2(0.5, 0.5),
        new FudgeCore.Vector2(0.5, -0.5)
    ];
    FudgeCore.MeshRotation = MeshRotation;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshRotation.js.map