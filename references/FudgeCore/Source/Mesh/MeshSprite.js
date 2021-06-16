"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate two quads placed back to back, the one facing in negative Z-direction is textured reversed
     * ```plaintext
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshSprite extends FudgeCore.Mesh {
        constructor(_name = "MeshSprite") {
            super(_name);
            // this.create();
        }
        createVertices() {
            let vertices = new Float32Array([
                /*0*/ -1, 1, 0, /*1*/ -1, -1, 0, /*2*/ 1, -1, 0, /*3*/ 1, 1, 0
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                1, 2, 0, 2, 3, 0,
                0, 3, 1, 3, 2, 1 //back
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            return new Float32Array([
                /*0: normal of front face*/
                0, 0, 1,
                /*1: normal of back face*/
                0, 0, -1,
                /*2*/
                0, 0, 0,
                /*3*/
                0, 0, 0
            ]);
        }
    }
    MeshSprite.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSprite);
    FudgeCore.MeshSprite = MeshSprite;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshSprite.js.map