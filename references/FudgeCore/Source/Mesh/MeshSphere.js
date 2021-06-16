"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
     * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshSphere extends FudgeCore.Mesh {
        // Dirty Workaround to have access to the normals from createVertices()
        // private normals: Array<number> = [];
        // private textureUVs: Array<number> = [];
        // public textureUVs: Float32Array;
        constructor(_name = "MeshSphere", _sectors = 8, _stacks = 8) {
            super(_name);
            this.create(_sectors, _stacks);
        }
        create(_sectors = 3, _stacks = 2) {
            this.clear();
            //Clamp resolution to prevent performance issues
            this.sectors = Math.min(Math.round(_sectors), 128);
            this.stacks = Math.min(Math.round(_stacks), 128);
            if (_sectors < 3 || _stacks < 2) {
                FudgeCore.Debug.warn("UV Sphere must have at least 3 sectors and 2 stacks to form a 3-dimensional shape.");
                this.sectors = Math.max(3, _sectors);
                this.stacks = Math.max(2, _stacks);
            }
            let vertices = [];
            let normals = [];
            let textureUVs = [];
            let x;
            let z;
            let xz;
            let y;
            let sectorStep = 2 * Math.PI / this.sectors;
            let stackStep = Math.PI / this.stacks;
            let stackAngle;
            let sectorAngle;
            /* add (sectorCount+1) vertices per stack.
            the first and last vertices have same position and normal,
            but different tex coords */
            for (let i = 0; i <= this.stacks; ++i) {
                stackAngle = Math.PI / 2 - i * stackStep;
                xz = Math.cos(stackAngle);
                y = Math.sin(stackAngle);
                // add (sectorCount+1) vertices per stack
                // the first and last vertices have same position and normal, but different tex coords
                for (let j = 0; j <= this.sectors; ++j) {
                    sectorAngle = j * sectorStep;
                    //vertex position
                    x = xz * Math.cos(sectorAngle);
                    z = xz * Math.sin(sectorAngle);
                    vertices.push(x, y, z);
                    //normals
                    normals.push(x, y, z);
                    //UV Coords
                    textureUVs.push(j / this.sectors * -1);
                    textureUVs.push(i / this.stacks);
                }
            }
            // scale down
            vertices = vertices.map(_value => _value / 2);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒnormals = new Float32Array(normals);
            this.ƒvertices = new Float32Array(vertices);
            this.ƒnormalsFace = this.createFaceNormals();
            this.ƒindices = this.createIndices();
            // this.createRenderBuffers();
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.sectors = this.sectors;
            serialization.stacks = this.stacks;
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            this.create(_serialization.sectors, _serialization.stacks);
            return this;
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(_mutator.sectors, _mutator.stacks);
        }
        //#endregion
        createIndices() {
            let inds = [];
            let k1;
            let k2;
            for (let i = 0; i < this.stacks; ++i) {
                k1 = i * (this.sectors + 1); // beginning of current stack
                k2 = k1 + this.sectors + 1; // beginning of next stack
                for (let j = 0; j < this.sectors; ++j, ++k1, ++k2) {
                    // 2 triangles per sector excluding first and last stacks
                    // k1 => k2 => k1+1
                    if (i != 0) {
                        inds.push(k1);
                        inds.push(k1 + 1);
                        inds.push(k2);
                    }
                    if (i != (this.stacks - 1)) {
                        inds.push(k1 + 1);
                        inds.push(k2 + 1);
                        inds.push(k2);
                    }
                }
            }
            let indices = new Uint16Array(inds);
            return indices;
        }
    }
    MeshSphere.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSphere);
    FudgeCore.MeshSphere = MeshSphere;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshSphere.js.map