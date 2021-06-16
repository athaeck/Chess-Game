"use strict";
///<reference path="MeshPolygon.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generates an extrusion of a polygon by a series of transformations
     * ```plaintext
     *                      ____
     * Polygon         ____╱╲   ╲
     * Transform 0  → ╱ ╲__╲_╲___╲ ← Transform 2
     *                ╲_╱__╱ ╱   ╱
     *     Transform 1  →  ╲╱___╱
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class MeshExtrusion extends FudgeCore.MeshPolygon {
        // private transforms: MutableArray<Matrix4x4> = new MutableArray(Matrix4x4);
        constructor(_name = "MeshExtrusion", _vertices = FudgeCore.MeshPolygon.verticesDefault, _mtxTransforms = MeshExtrusion.mtxDefaults, _fitTexture = true) {
            super(_name, _vertices, _fitTexture);
            this.mtxTransforms = new FudgeCore.MutableArray();
            this.extrude(_mtxTransforms);
            // console.log("Mutator", this.getMutator());
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.transforms = FudgeCore.Serializer.serializeArray(FudgeCore.Matrix4x4, this.mtxTransforms);
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            let mtxTransforms;
            if (_serialization.transforms)
                mtxTransforms = await FudgeCore.Serializer.deserializeArray(_serialization.transforms);
            this.extrude(mtxTransforms);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.extrude(this.mtxTransforms);
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        //#endregion
        extrude(_mtxTransforms = MeshExtrusion.mtxDefaults) {
            this.mtxTransforms = FudgeCore.MutableArray.from(_mtxTransforms);
            // save original polygon
            let polygon = [];
            for (let i = 0; i < this.vertices.length; i += 3)
                polygon.push(new FudgeCore.Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));
            let nTransforms = _mtxTransforms.length;
            let nVerticesPolygon = polygon.length;
            let nFacesPolygon = nVerticesPolygon - 2;
            let nIndicesPolygon = nFacesPolygon * 3;
            let vertices = [];
            // create base by transformation of polygon with first transform
            let base = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, _mtxTransforms[0], true));
            vertices.push(...base);
            // create lid by transformation of polygon with last transform
            let lid = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, _mtxTransforms[nTransforms - 1], true));
            vertices.push(...lid);
            // duplicate first vertex of polygon to the end to create a texturable wrapping
            polygon.push(polygon[0].copy);
            let wrap;
            for (let i = 0; i < nTransforms; i++) {
                let mtxTransform = _mtxTransforms[i];
                wrap = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, mtxTransform, true));
                vertices.push(...wrap);
                if (i > 0 && i < nTransforms - 1)
                    vertices.push(...wrap.map((_vector) => _vector.copy));
            }
            // copy indices to new index array
            let indices = [];
            indices.push(...this.indices);
            // copy indices for second polygon and reverse sequence
            for (let i = 0; i < nIndicesPolygon; i += 3) {
                indices.push(this.indices[i] + nVerticesPolygon);
                indices.push(this.indices[i + 2] + nVerticesPolygon);
                indices.push(this.indices[i + 1] + nVerticesPolygon);
            }
            // create indizes for wrapper
            for (let t = 0; t < nTransforms - 1; t++)
                for (let i = 0; i < nVerticesPolygon; i++) {
                    // let index: number = i + (2 + t) * nVerticesPolygon + t;
                    let index = i + 2 * nVerticesPolygon + 2 * t * (nVerticesPolygon + 1);
                    indices.push(...FudgeCore.Mesh.getTrigonsFromQuad([index, index + nVerticesPolygon + 1, index + nVerticesPolygon + 2, index + 1], false));
                }
            FudgeCore.Mesh.deleteInvalidIndices(indices, vertices);
            let nTextureUVs = this.textureUVs.length;
            let textureUVs = [];
            textureUVs.push(...this.textureUVs);
            textureUVs.push(...this.textureUVs);
            // TODO: wrap texture nicer respecting the distances between vertices, see lengths polygon etc.
            // first step: use fitTexture only for stretching, otherwise use vertext positions for texturing
            // let sumLengths: number = lengthsPolygon.reduce((_sum, _value) => _sum + _value);
            let index = nTextureUVs * 2;
            let incV = 1 / nVerticesPolygon;
            let incU = 1 / (nTransforms - 1);
            let u = 1;
            for (let t = 0; t < nTransforms - 1; t++) {
                let v = 0;
                for (let vertex = 0; vertex <= nVerticesPolygon; vertex++) {
                    textureUVs[index] = v;
                    textureUVs[index + nVerticesPolygon * 2 + 2] = v;
                    index++;
                    textureUVs[index] = u;
                    textureUVs[index + nVerticesPolygon * 2 + 2] = u - incU;
                    index++;
                    v += incV;
                }
                u -= incU;
            }
            this.ƒvertices = new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
            this.ƒindices = new Uint16Array(indices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
        }
    }
    MeshExtrusion.iSubclass = FudgeCore.Mesh.registerSubclass(MeshExtrusion);
    MeshExtrusion.mtxDefaults = [
        FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(0.5)),
        FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(-0.5))
    ];
    FudgeCore.MeshExtrusion = MeshExtrusion;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshExtrusion.js.map