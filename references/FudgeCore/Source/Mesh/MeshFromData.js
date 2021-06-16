"use strict";
var FudgeCore;
(function (FudgeCore) {
    /** Allows to create custom meshes from given Data */
    class MeshFromData extends FudgeCore.Mesh {
        constructor(_vertices, _textureUVs, _indices, _faceNormals) {
            super();
            this.verticesToSet = _vertices;
            this.textureUVsToSet = _textureUVs;
            this.indicesToSet = _indices;
            this.faceNormalsToSet = _faceNormals;
        }
        createVertices() {
            return this.verticesToSet;
        }
        createTextureUVs() {
            return this.textureUVsToSet;
        }
        createIndices() {
            return this.indicesToSet;
        }
        createFaceNormals() {
            return this.faceNormalsToSet;
        }
    }
    FudgeCore.MeshFromData = MeshFromData;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshFromData.js.map