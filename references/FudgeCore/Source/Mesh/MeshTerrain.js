"use strict";
var FudgeCore;
(function (FudgeCore) {
    class PositionOnTerrain {
    }
    FudgeCore.PositionOnTerrain = PositionOnTerrain;
    /**
     * Generates a planar Grid and applies a Heightmap-Function to it.
     * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, Moritz Beaugrand HFU, 2020
     */
    class MeshTerrain extends FudgeCore.Mesh {
        /**
         * HeightMapFunction or PNG
         * @param _name
         * @param source
         * @param _resolutionX
         * @param _resolutionZ
         */
        constructor(_name = "MeshHeightMap", source, _resolutionX = 16, _resolutionZ = 16) {
            super(_name);
            this.imgScale = 255;
            this.resolutionX = _resolutionX;
            this.resolutionZ = _resolutionZ;
            if (_resolutionZ || _resolutionX <= 0) {
                FudgeCore.Debug.warn("HeightMap Mesh cannot have resolution values < 1. ");
                this.resolutionX = Math.max(1, this.resolutionX);
                this.resolutionZ = Math.max(1, this.resolutionZ);
            }
            if (!(source instanceof FudgeCore.TextureImage)) {
                this.heightMapFunction = source;
                this.image = null;
            }
            else
                this.heightMapFunction = null;
            if (source instanceof FudgeCore.TextureImage) {
                this.image = source;
                this.resolutionX = source.image.width - 1;
                this.resolutionZ = source.image.height - 1;
            }
            else
                this.image = null;
            this.ƒnormalsFace = this.createFaceNormals();
            this.ƒindices = this.createIndices();
        }
        getPositionOnTerrain(position, mtxWorld) {
            let relPosObject = position;
            if (mtxWorld) {
                relPosObject = FudgeCore.Vector3.TRANSFORMATION(position, FudgeCore.Matrix4x4.INVERSION(mtxWorld), true);
            }
            let nearestFace = this.findNearestFace(relPosObject);
            let posOnTerrain = new PositionOnTerrain;
            let origin = new FudgeCore.Vector3(relPosObject.x, this.calculateHeight(nearestFace, relPosObject), relPosObject.z);
            let direction = nearestFace.faceNormal;
            if (mtxWorld) {
                origin = FudgeCore.Vector3.TRANSFORMATION(origin, mtxWorld, true);
                direction = FudgeCore.Vector3.TRANSFORMATION(direction, mtxWorld, false);
            }
            posOnTerrain.position = origin;
            posOnTerrain.normal = direction;
            return posOnTerrain;
        }
        createVertices() {
            let vertices = new Float32Array((this.resolutionX + 1) * (this.resolutionZ + 1) * 3);
            if (this.heightMapFunction != null) {
                //Iterate over each cell to generate grid of vertices
                for (let i = 0, z = 0; z <= this.resolutionZ; z++) {
                    for (let x = 0; x <= this.resolutionX; x++) {
                        // X
                        vertices[i] = x / this.resolutionX - 0.5;
                        // Apply heightmap to y coordinate
                        vertices[i + 1] = this.heightMapFunction(x / this.resolutionX, z / this.resolutionZ);
                        // Z
                        vertices[i + 2] = z / this.resolutionZ - 0.5;
                        i += 3;
                    }
                }
                return vertices;
            }
            else if (this.image != null) {
                let imgArray = this.imageToClampedArray(this.image);
                console.log(imgArray);
                let px = 0;
                for (let i = 0, z = 0; z <= this.resolutionZ; z++) {
                    for (let x = 0; x <= this.resolutionX; x++) {
                        // X
                        vertices[i] = x / this.resolutionX - 0.5;
                        // Apply heightmap to y coordinate
                        vertices[i + 1] = imgArray[px * 4] / this.imgScale;
                        // Z
                        vertices[i + 2] = z / this.resolutionZ - 0.5;
                        i += 3;
                        px++;
                    }
                }
                return vertices;
            }
            else {
                throw new Error("No Source for Vertices is given, must be function or image");
            }
        }
        createIndices() {
            let vert = 0;
            let tris = 0;
            let indices = new Uint16Array(this.resolutionX * this.resolutionZ * 6);
            let switchOrientation = false;
            for (let z = 0; z < this.resolutionZ; z++) {
                for (let x = 0; x < this.resolutionX; x++) {
                    if (!switchOrientation) {
                        // First triangle of each uneven grid-cell
                        indices[tris + 0] = vert + 0;
                        indices[tris + 1] = vert + this.resolutionX + 1;
                        indices[tris + 2] = vert + 1;
                        // Second triangle of each uneven grid-cell
                        indices[tris + 3] = vert + 1;
                        indices[tris + 4] = vert + this.resolutionX + 1;
                        indices[tris + 5] = vert + this.resolutionX + 2;
                    }
                    else {
                        // First triangle of each even grid-cell
                        indices[tris + 0] = vert + 0;
                        indices[tris + 1] = vert + this.resolutionX + 1;
                        indices[tris + 2] = vert + this.resolutionX + 2;
                        // Second triangle of each even grid-cell
                        indices[tris + 3] = vert + 0;
                        indices[tris + 4] = vert + this.resolutionX + 2;
                        indices[tris + 5] = vert + 1;
                    }
                    switchOrientation = !switchOrientation;
                    vert++;
                    tris += 6;
                }
                if (this.resolutionX % 2 == 0)
                    switchOrientation = !switchOrientation;
                vert++;
            }
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array(this.indices.length * 2);
            for (let i = 0, z = 0; z <= this.resolutionZ; z++) {
                for (let x = 0; x <= this.resolutionX; x++) {
                    textureUVs[i] = x / this.resolutionX;
                    textureUVs[i + 1] = z / this.resolutionZ;
                    i += 2;
                }
            }
            return textureUVs;
        }
        imageToClampedArray(image) {
            let trImport;
            let canvasImage = document.createElement("canvas");
            canvasImage.width = image.image.width;
            canvasImage.height = image.image.height;
            let crcHeightMap = canvasImage.getContext("2d");
            crcHeightMap.imageSmoothingEnabled = false;
            crcHeightMap.drawImage(image.image, 0, 0);
            trImport = crcHeightMap.getImageData(0, 0, image.image.width, image.image.height).data;
            return trImport;
        }
        calculateHeight(face, relativePosObject) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(0, 1, 0), relativePosObject);
            let intersection = ray.intersectPlane(face.vertexONE, face.faceNormal);
            return intersection.y;
        }
        findNearestFace(relativPosObject) {
            let vertices = this.vertices;
            let indices = this.indices;
            let row = Math.floor((relativPosObject.z + 0.5) * this.resolutionZ);
            let column = Math.floor((relativPosObject.x + 0.5) * this.resolutionX);
            if (row >= this.resolutionZ)
                row = this.resolutionZ - 1;
            if (row < 0)
                row = 0;
            if (column >= this.resolutionX)
                column = this.resolutionZ - 1;
            if (column < 0)
                column = 0;
            let field = ((row * this.resolutionX) + column) * 6;
            let vertexONE1 = new FudgeCore.Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
            let vertexTWO1 = new FudgeCore.Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
            let vertexTHREE1 = new FudgeCore.Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);
            let face1 = new DistanceToFaceVertices(vertexONE1, vertexTWO1, vertexTHREE1, relativPosObject);
            field = field + 3;
            let vertexONE2 = new FudgeCore.Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
            let vertexTWO2 = new FudgeCore.Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
            let vertexTHREE2 = new FudgeCore.Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);
            let face2 = new DistanceToFaceVertices(vertexONE2, vertexTWO2, vertexTHREE2, relativPosObject);
            if (face1.distance < face2.distance)
                return face1;
            else
                return face2;
        }
    }
    MeshTerrain.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTerrain);
    FudgeCore.MeshTerrain = MeshTerrain;
    class DistanceToFaceVertices {
        constructor(vertexONE, vertexTWO, vertexTHREE, relativPosObject) {
            this.vertexONE = vertexONE;
            this.vertexTWO = vertexTWO;
            this.vertexTHREE = vertexTHREE;
            this.distanceONE = new FudgeCore.Vector2(vertexONE.x - relativPosObject.x, vertexONE.z - relativPosObject.z).magnitude;
            this.distanceTWO = new FudgeCore.Vector2(vertexTWO.x - relativPosObject.x, vertexTWO.z - relativPosObject.z).magnitude;
            this.distanceTHREE = new FudgeCore.Vector2(vertexTHREE.x - relativPosObject.x, vertexTHREE.z - relativPosObject.z).magnitude;
            this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE;
            this.calculateFaceNormal();
        }
        calculateFaceNormal() {
            let v1 = FudgeCore.Vector3.DIFFERENCE(this.vertexTWO, this.vertexONE);
            let v2 = FudgeCore.Vector3.DIFFERENCE(this.vertexTHREE, this.vertexONE);
            this.faceNormal = FudgeCore.Vector3.CROSS(v1, v2);
        }
    }
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshTerrain.js.map