"use strict";
var FudgeCore;
(function (FudgeCore) {
    //gives WebGL Buffer the data from the [[Mesh]]
    class RenderInjectorMesh {
        static decorate(_constructor) {
            Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
                value: RenderInjectorMesh.useRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "createRenderBuffers", {
                value: RenderInjectorMesh.createRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
                value: RenderInjectorMesh.deleteRenderBuffers
            });
        }
        static createRenderBuffers() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let vertices = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices, WebGL2RenderingContext.STATIC_DRAW);
            let indices = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
            crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices, WebGL2RenderingContext.STATIC_DRAW);
            let textureUVs = crc3.createBuffer();
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs, WebGL2RenderingContext.STATIC_DRAW);
            let normalsFace = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFace, WebGL2RenderingContext.STATIC_DRAW);
            let renderBuffers = {
                vertices: vertices,
                indices: indices,
                nIndices: this.getIndexCount(),
                textureUVs: textureUVs,
                normalsFace: normalsFace
            };
            this.renderBuffers = renderBuffers;
        }
        static useRenderBuffers(_shader, _mtxWorld, _mtxProjection, _id) {
            if (!this.renderBuffers)
                this.createRenderBuffers();
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let aPosition = _shader.attributes["a_position"];
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.vertices);
            crc3.enableVertexAttribArray(aPosition);
            FudgeCore.RenderWebGL.setAttributeStructure(aPosition, FudgeCore.Mesh.getBufferSpecification());
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indices);
            let uProjection = _shader.uniforms["u_projection"];
            crc3.uniformMatrix4fv(uProjection, false, _mtxProjection.get());
            // feed in face normals if shader accepts u_world. 
            let uWorld = _shader.uniforms["u_world"];
            if (uWorld) {
                crc3.uniformMatrix4fv(uWorld, false, _mtxWorld.get());
            }
            let aNormal = _shader.attributes["a_normal"];
            if (aNormal) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsFace);
                crc3.enableVertexAttribArray(aNormal);
                FudgeCore.RenderWebGL.setAttributeStructure(aNormal, FudgeCore.Mesh.getBufferSpecification());
            }
            // feed in texture coordinates if shader accepts a_textureUVs
            let aTextureUVs = _shader.attributes["a_textureUVs"];
            if (aTextureUVs) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVs);
                crc3.enableVertexAttribArray(aTextureUVs); // enable the buffer
                crc3.vertexAttribPointer(aTextureUVs, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            // feed in an id of the node if shader accepts u_id. Used for picking
            let uId = _shader.uniforms["u_id"];
            if (uId)
                FudgeCore.RenderWebGL.getRenderingContext().uniform1i(uId, _id);
        }
        static deleteRenderBuffers(_renderBuffers) {
            // console.log("deleteRenderBuffers", this);
            // return;
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (_renderBuffers) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                crc3.deleteBuffer(_renderBuffers.vertices);
                crc3.deleteBuffer(_renderBuffers.textureUVs);
                crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
                crc3.deleteBuffer(_renderBuffers.indices);
            }
        }
    }
    FudgeCore.RenderInjectorMesh = RenderInjectorMesh;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RenderInjectorMesh.js.map