"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores information provided by [[Render]]-picking e.g. using [[Picker]] and provides methods for further calculation of positions and normals etc.
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Pick {
        constructor(_node) {
            this.node = _node;
        }
        #mtxViewToWorld;
        #posWorld;
        #posMesh;
        /**
         * Accessor to calculate and store world position of intersection of [[Ray]] and [[Mesh]] only when used.
         */
        get posWorld() {
            if (this.#posWorld)
                return this.#posWorld;
            let pointInClipSpace = FudgeCore.Vector3.Z(this.zBuffer);
            let m = this.#mtxViewToWorld.get();
            let result = FudgeCore.Vector3.TRANSFORMATION(pointInClipSpace, this.#mtxViewToWorld, true);
            let w = m[3] * pointInClipSpace.x + m[7] * pointInClipSpace.y + m[11] * pointInClipSpace.z + m[15];
            result.scale(1 / w);
            this.#posWorld = result;
            return result;
        }
        /**
         * Accessor to calculate and store position in mesh-space of intersection of [[Ray]] and [[Mesh]] only when used.
         */
        get posMesh() {
            if (this.#posMesh)
                return this.#posMesh;
            let mtxWorldToMesh = FudgeCore.Matrix4x4.INVERSION(this.node.getComponent(FudgeCore.ComponentMesh).mtxWorld);
            let posMesh = FudgeCore.Vector3.TRANSFORMATION(this.posWorld, mtxWorldToMesh);
            this.#posMesh = posMesh;
            return posMesh;
        }
        /**
         * Accessor to calculate and store the face normal in world-space at the point of intersection of [[Ray]] and [[Mesh]] only when used.
         */
        get normal() {
            let cmpMesh = this.node.getComponent(FudgeCore.ComponentMesh);
            let mesh = cmpMesh.mesh;
            let normal = FudgeCore.Vector3.ZERO();
            let vertex = FudgeCore.Vector3.ZERO();
            let minDistance = Infinity;
            let result;
            for (let i = 2; i < mesh.indices.length; i += 3) {
                let iVertex = mesh.indices[i];
                let [x, y, z] = mesh.vertices.subarray(iVertex * 3, (iVertex + 1) * 3);
                vertex.set(x, y, z);
                [x, y, z] = mesh.normalsFace.subarray(iVertex * 3, (iVertex + 1) * 3);
                normal.set(x, y, z);
                let difference = FudgeCore.Vector3.DIFFERENCE(this.posMesh, vertex);
                let distance = Math.abs(FudgeCore.Vector3.DOT(normal, difference));
                if (distance < minDistance) {
                    result = normal.copy;
                    minDistance = distance;
                }
            }
            result.transform(cmpMesh.mtxWorld, false);
            result.normalize();
            return result;
        }
        /**
         * Called solely by the renderer to enable calculation of the world coordinates of this [[Pick]]
         */
        set mtxViewToWorld(_mtxViewToWorld) {
            this.#mtxViewToWorld = _mtxViewToWorld;
        }
    }
    FudgeCore.Pick = Pick;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Pick.js.map