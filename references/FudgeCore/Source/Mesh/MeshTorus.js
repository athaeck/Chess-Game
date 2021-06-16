"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a Torus with a given thickness and the number of major- and minor segments
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshTorus extends FudgeCore.Mesh {
        constructor(_name = "MeshTorus", _thickness = 0.25, _majorSegments = 32, _minorSegments = 12) {
            super(_name);
            this.thickness = 0.25;
            this.majorSegments = 32;
            this.minorSegments = 12;
            this.create(_thickness, _majorSegments, _minorSegments);
        }
        create(_thickness = 0.25, _majorSegments = 32, _minorSegments = 12) {
            //Clamp resolution to prevent performance issues
            this.majorSegments = Math.min(_majorSegments, 128);
            this.minorSegments = Math.min(_minorSegments, 128);
            if (_majorSegments < 3 || _minorSegments < 3) {
                FudgeCore.Debug.warn("Torus must have at least 3 major and minor segments");
                this.majorSegments = Math.max(3, _majorSegments);
                this.minorSegments = Math.max(3, _minorSegments);
            }
            this.clear();
            let vertices = [];
            let normals = [];
            let textureUVs = [];
            let centerX;
            let centerY;
            let x, y, z;
            let PI2 = Math.PI * 2;
            for (let j = 0; j <= this.minorSegments; j++) {
                for (let i = 0; i <= this.majorSegments; i++) {
                    let u = i / this.majorSegments * PI2;
                    let v = j / this.minorSegments * PI2;
                    centerX = Math.cos(u);
                    centerY = Math.sin(u);
                    x = (1 + this.thickness * Math.cos(v)) * Math.sin(u);
                    y = this.thickness * Math.sin(v);
                    z = (1 + this.thickness * Math.cos(v)) * Math.cos(u);
                    vertices.push(x, y, z);
                    let normal = new FudgeCore.Vector3(x - centerX, y - centerY, z);
                    normal.normalize();
                    normals.push(normal.x, normal.y, normal.z);
                    textureUVs.push(i / this.majorSegments, j / this.minorSegments);
                }
            }
            // scale down
            vertices = vertices.map(_value => _value / 2);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒnormals = new Float32Array(normals);
            this.ƒvertices = new Float32Array(vertices);
            this.ƒindices = this.createIndices();
            this.createRenderBuffers();
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            let thickness = Math.round(_mutator.thickness);
            let majorSegments = Math.round(_mutator.majorSegments);
            let minorSegments = Math.round(_mutator.minorSegments);
            this.create(thickness, majorSegments, minorSegments);
        }
        createIndices() {
            let inds = [];
            for (let j = 1; j <= this.minorSegments; j++) {
                for (let i = 1; i <= this.majorSegments; i++) {
                    let a = (this.majorSegments + 1) * j + i - 1;
                    let b = (this.majorSegments + 1) * (j - 1) + i - 1;
                    let c = (this.majorSegments + 1) * (j - 1) + i;
                    let d = (this.majorSegments + 1) * j + i;
                    inds.push(a, b, d, b, c, d);
                }
            }
            let indices = new Uint16Array(inds);
            return indices;
        }
    }
    MeshTorus.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTorus);
    FudgeCore.MeshTorus = MeshTorus;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshTorus.js.map