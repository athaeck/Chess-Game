"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
     * static LOAD Method. Currently only works with triangulated Meshes
     * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
     * @todo UVs, Load Materials, Support Quads
     * @authors Simon Storl-Schulke 2021 */
    class MeshObj extends FudgeCore.Mesh {
        constructor(objString) {
            super();
            this.verts = [];
            this.uvs = [];
            this.inds = [];
            this.facenormals = [];
            this.parseObj(objString);
            this.splitVertices();
        }
        /** Loads an obj file from the given source url and a returns a complete Node from it.
        * Multiple Objects are treated as a single Mesh. If no material is given, uses a default flat white material. */
        static LOAD(src, name = "ObjNode", material = new FudgeCore.Material("MaterialRed", FudgeCore.ShaderFlat, new FudgeCore.CoatColored(new FudgeCore.Color(0.8, 0.8, 0.8, 1)))) {
            let xmlhttp = new XMLHttpRequest();
            let fileContent = "";
            let nodeObj = new FudgeCore.Node(name);
            nodeObj.addComponent(new FudgeCore.ComponentTransform());
            xmlhttp.onreadystatechange = async function () {
                if (this.readyState == 4 && this.status == 200) {
                    fileContent = this.responseText;
                    let meshObj = new MeshObj(fileContent);
                    nodeObj.addComponent(new FudgeCore.ComponentMesh(meshObj));
                    nodeObj.addComponent(new FudgeCore.ComponentMaterial(material));
                    //TODO: New Node for each Object and return Parent Node
                }
            };
            xmlhttp.open("GET", src, true);
            xmlhttp.send();
            return nodeObj;
        }
        /** Creates three Vertices from each face. Although inefficient, this has to be done for now - see Issue 244 */
        splitVertices() {
            let vertsNew = [];
            //let uvsNew: number[] = [];
            let indicesNew = [];
            let faceNormalsNew = [];
            // For each face
            for (let i = 0; i < this.inds.length; i += 3) {
                // Get its 3 vertices
                let v1 = new FudgeCore.Vector3(this.verts[this.inds[i + 0] * 3 + 0], this.verts[this.inds[i + 0] * 3 + 1], this.verts[this.inds[i + 0] * 3 + 2]);
                let v2 = new FudgeCore.Vector3(this.verts[this.inds[i + 1] * 3 + 0], this.verts[this.inds[i + 1] * 3 + 1], this.verts[this.inds[i + 1] * 3 + 2]);
                let v3 = new FudgeCore.Vector3(this.verts[this.inds[i + 2] * 3 + 0], this.verts[this.inds[i + 2] * 3 + 1], this.verts[this.inds[i + 2] * 3 + 2]);
                // Calculate Normal by three face vertices
                let normal = FudgeCore.Vector3.CROSS(FudgeCore.Vector3.DIFFERENCE(v2, v1), FudgeCore.Vector3.DIFFERENCE(v3, v1));
                normal.normalize();
                // Use same Normal for all three face verices
                faceNormalsNew.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
                vertsNew.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                indicesNew.push(i, i + 1, i + 2);
            }
            this.verts = vertsNew;
            // this.uvs = uvsNew;
            this.inds = indicesNew;
            this.facenormals = faceNormalsNew;
        }
        /** Splits up the obj string into separate arrays for each datatype */
        parseObj(data) {
            const lines = data.split("\n");
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith("#"))
                    continue;
                const parts = line.split(" ");
                parts.shift();
                //Vertex - example: v 0.70 -0.45 -0.52
                if (!line || line.startsWith("v "))
                    this.verts.push(...parts.map(x => +x));
                //Texcoord - example: vt 0.545454 0.472382
                else if (!line || line.startsWith("vt "))
                    this.uvs.push(...parts.map(x => +x));
                /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
                vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
                else if (!line || line.startsWith("f ")) {
                    this.inds.push(+parts[0].split("/")[0] - 1, +parts[1].split("/")[0] - 1, +parts[2].split("/")[0] - 1);
                }
            }
        }
        createVertices() {
            return new Float32Array(this.verts);
            ;
        }
        createTextureUVs() {
            //TODO: not working yet
            return new Float32Array(this.uvs);
        }
        createIndices() {
            return new Uint16Array(this.inds);
        }
        createFaceNormals() {
            return new Float32Array(this.facenormals);
        }
    }
    FudgeCore.MeshObj = MeshObj;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=MeshObj.js.map