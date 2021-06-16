"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    var Mesh_1;
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    let Mesh = Mesh_1 = class Mesh extends FudgeCore.Mutable {
        constructor(_name = "Mesh") {
            super();
            this.idResource = undefined;
            this.name = "Mesh";
            this.name = _name;
            this.clear();
            FudgeCore.Project.register(this);
        }
        static getBufferSpecification() {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        static registerSubclass(_subClass) { return Mesh_1.subclasses.push(_subClass) - 1; }
        /**
         * Takes an array of four indices for a quad and returns an array of six indices for two trigons cutting that quad.
         * If the quad is planar (default), the trigons end on the same index, allowing a single normal for both faces on the referenced vertex
         */
        static getTrigonsFromQuad(_quad, _even = true) {
            // TODO: add parameters for other diagonal and reversion of rotation
            let indices;
            if (_even)
                indices = [_quad[0], _quad[1], _quad[2], _quad[3], _quad[0], _quad[2]];
            else
                indices = [_quad[0], _quad[1], _quad[2], _quad[0], _quad[2], _quad[3]];
            return indices;
        }
        static deleteInvalidIndices(_indices, _vertices) {
            //delete "non"-faces with two identical vectors
            for (let i = _indices.length - 3; i >= 0; i -= 3) {
                let v0 = _vertices[_indices[i]];
                let v1 = _vertices[_indices[i + 1]];
                let v2 = _vertices[_indices[i + 2]];
                if (v0.equals(v1) || v2.equals(v1) || v0.equals(v2))
                    _indices.splice(i, 3);
            }
        }
        get type() {
            return this.constructor.name;
        }
        get vertices() {
            if (this.ƒvertices == null)
                this.ƒvertices = this.createVertices();
            return this.ƒvertices;
        }
        get indices() {
            if (this.ƒindices == null)
                this.ƒindices = this.createIndices();
            return this.ƒindices;
        }
        get normalsFace() {
            if (this.ƒnormalsFace == null)
                this.ƒnormalsFace = this.createFaceNormals();
            return this.ƒnormalsFace;
        }
        get textureUVs() {
            if (this.ƒtextureUVs == null)
                this.ƒtextureUVs = this.createTextureUVs();
            return this.ƒtextureUVs;
        }
        get boundingBox() {
            if (this.ƒbox == null)
                this.ƒbox = this.createBoundingBox();
            return this.ƒbox;
        }
        get radius() {
            if (this.ƒradius == null)
                this.ƒradius = this.createRadius();
            return this.ƒradius;
        }
        useRenderBuffers(_shader, _mtxWorld, _mtxProjection, _id) { }
        createRenderBuffers() { }
        deleteRenderBuffers(_shader) { }
        getVertexCount() {
            return this.vertices.length / Mesh_1.getBufferSpecification().size;
        }
        getIndexCount() {
            return this.indices.length;
        }
        clear() {
            this.ƒvertices = undefined;
            this.ƒindices = undefined;
            this.ƒtextureUVs = undefined;
            this.ƒnormalsFace = undefined;
            this.ƒnormals = undefined;
            this.ƒbox = undefined;
            this.ƒradius = undefined;
            this.renderBuffers = null;
        }
        // Serialize/Deserialize for all meshes that calculate without parameters
        serialize() {
            let serialization = {
                idResource: this.idResource,
                name: this.name,
                type: this.type // store for editor view
            }; // no data needed ...
            return serialization;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            // type is an accessor and must not be deserialized
            return this;
        }
        /**Flip the Normals of a Mesh to render opposite side of each polygon*/
        flipNormals() {
            //invertNormals
            for (let n = 0; n < this.normalsFace.length; n++) {
                this.normalsFace[n] = -this.normalsFace[n];
            }
            //flip indices direction
            for (let i = 0; i < this.indices.length - 2; i += 3) {
                let i0 = this.indices[i];
                this.indices[i] = this.indices[i + 1];
                this.indices[i + 1] = i0;
            }
            this.createRenderBuffers();
        }
        createVertices() { return null; }
        createTextureUVs() { return null; }
        createIndices() { return null; }
        createNormals() { return null; }
        createFaceNormals() {
            let normals = [];
            let vertices = [];
            for (let v = 0; v < this.vertices.length; v += 3)
                vertices.push(new FudgeCore.Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));
            for (let i = 0; i < this.indices.length; i += 3) {
                let trigon = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0 = FudgeCore.Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[1]]);
                let v1 = FudgeCore.Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[2]]);
                let normal = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(v0, v1));
                let index = trigon[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
            }
            return new Float32Array(normals);
        }
        createRadius() {
            let radius = 0;
            for (let vertex = 0; vertex < this.vertices.length; vertex += 3) {
                radius = Math.max(radius, Math.hypot(this.vertices[vertex], this.vertices[vertex + 1], this.vertices[vertex + 2]));
            }
            return radius;
        }
        createBoundingBox() {
            let box = FudgeCore.Recycler.get(FudgeCore.Box);
            box.set();
            for (let vertex = 0; vertex < this.vertices.length; vertex += 3) {
                box.min.x = Math.min(this.vertices[vertex], box.min.x);
                box.max.x = Math.max(this.vertices[vertex], box.max.x);
                box.min.y = Math.min(this.vertices[vertex + 1], box.min.y);
                box.max.y = Math.max(this.vertices[vertex + 1], box.max.y);
                box.min.z = Math.min(this.vertices[vertex + 2], box.min.z);
                box.max.z = Math.max(this.vertices[vertex + 2], box.max.z);
            }
            return box;
        }
        reduceMutator(_mutator) {
            delete _mutator.ƒbox;
            delete _mutator.ƒradius;
            delete _mutator.ƒvertices;
            delete _mutator.ƒindices;
            delete _mutator.ƒnormals;
            delete _mutator.ƒnormalsFace;
            delete _mutator.ƒtextureUVs;
            delete _mutator.renderBuffers;
        }
    };
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    Mesh.baseClass = Mesh_1;
    /** list of all the subclasses derived from this class, if they registered properly*/
    Mesh.subclasses = [];
    Mesh = Mesh_1 = __decorate([
        FudgeCore.RenderInjectorMesh.decorate
    ], Mesh);
    FudgeCore.Mesh = Mesh;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Mesh.js.map