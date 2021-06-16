"use strict";
///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
///<reference path="../Math/Rectangle.ts"/>
var FudgeCore;
(function (FudgeCore) {
    let BLEND;
    (function (BLEND) {
        BLEND[BLEND["OPAQUE"] = 0] = "OPAQUE";
        BLEND[BLEND["TRANSPARENT"] = 1] = "TRANSPARENT";
        BLEND[BLEND["PARTICLE"] = 2] = "PARTICLE";
    })(BLEND = FudgeCore.BLEND || (FudgeCore.BLEND = {}));
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    class RenderWebGL extends FudgeCore.EventTargetStatic {
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
         */
        static initialize(_antialias, _alpha) {
            FudgeCore.fudgeConfig = FudgeCore.fudgeConfig || {};
            let contextAttributes = {
                alpha: (_alpha != undefined) ? _alpha : FudgeCore.fudgeConfig.alpha || false,
                antialias: (_antialias != undefined) ? _antialias : FudgeCore.fudgeConfig.antialias || false,
                premultipliedAlpha: false
            };
            FudgeCore.Debug.fudge("Initialize RenderWebGL", contextAttributes);
            let canvas = document.createElement("canvas");
            let crc3;
            crc3 = RenderWebGL.assert(canvas.getContext("webgl2", contextAttributes), "WebGL-context couldn't be created");
            RenderWebGL.crc3 = crc3;
            // Enable backface- and zBuffer-culling.
            crc3.enable(WebGL2RenderingContext.CULL_FACE);
            crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            crc3.enable(WebGL2RenderingContext.BLEND);
            crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
            // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
            RenderWebGL.rectRender = RenderWebGL.getCanvasRect();
            return crc3;
        }
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation  The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification  Interface passing datapullspecifications to the buffer.
         */
        static setAttributeStructure(_attributeLocation, _bufferSpecification) {
            RenderWebGL.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value  value to check against null
        * @param _message  optional, additional message for the exception
        */
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderWebGL.crc3 ? RenderWebGL.crc3.getError() : ""}`);
            return _value;
        }
        /**
         * Return a reference to the offscreen-canvas
         */
        static getCanvas() {
            return RenderWebGL.crc3.canvas; // TODO: enable OffscreenCanvas
        }
        /**
         * Return a reference to the rendering context
         */
        static getRenderingContext() {
            return RenderWebGL.crc3;
        }
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        static getCanvasRect() {
            let canvas = RenderWebGL.crc3.canvas;
            return FudgeCore.Rectangle.GET(0, 0, canvas.width, canvas.height);
        }
        /**
         * Set the size of the offscreen-canvas.
         */
        static setCanvasSize(_width, _height) {
            RenderWebGL.crc3.canvas.width = _width;
            RenderWebGL.crc3.canvas.height = _height;
        }
        /**
         * Set the area on the offscreen-canvas to render the camera image to.
         * @param _rect
         */
        static setRenderRectangle(_rect) {
            Object.assign(RenderWebGL.rectRender, _rect);
            RenderWebGL.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         */
        static clear(_color = null) {
            RenderWebGL.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        /**
         * Reset the offscreen framebuffer to the original RenderingContext
         */
        static resetFrameBuffer(_color = null) {
            RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        }
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        static getRenderRectangle() {
            return RenderWebGL.rectRender;
        }
        static setDepthTest(_test) {
            if (_test)
                RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            else
                RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
        }
        static setBlendMode(_mode) {
            switch (_mode) {
                case BLEND.OPAQUE:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
                    break;
                case BLEND.TRANSPARENT:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
                    // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
                    break;
                case BLEND.PARTICLE:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
                    break;
                default:
                    break;
            }
        }
        //#region Picking
        /**
         * Creates a texture buffer to be used as pick-buffer
         */
        static createPickTexture(_size) {
            // create to render to
            const targetTexture = FudgeCore.Render.crc3.createTexture();
            FudgeCore.Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);
            {
                const internalFormat = WebGL2RenderingContext.RGBA32I;
                const format = WebGL2RenderingContext.RGBA_INTEGER;
                const type = WebGL2RenderingContext.INT;
                FudgeCore.Render.pickBuffer = new Int32Array(_size * _size * 4);
                FudgeCore.Render.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, _size, _size, 0, format, type, FudgeCore.Render.pickBuffer);
                // set the filtering so we don't need mips
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            }
            const framebuffer = FudgeCore.Render.crc3.createFramebuffer();
            FudgeCore.Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
            const attachmentPoint = WebGL2RenderingContext.COLOR_ATTACHMENT0;
            FudgeCore.Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, targetTexture, 0);
            RenderWebGL.sizePick = _size;
            return targetTexture;
        }
        static getPicks(_size, _cmpCamera) {
            // evaluate texture by reading pixels and extract, convert and store the information about each mesh hit
            let data = new Int32Array(_size * _size * 4);
            FudgeCore.Render.crc3.readPixels(0, 0, _size, _size, WebGL2RenderingContext.RGBA_INTEGER, WebGL2RenderingContext.INT, data);
            let mtxViewToWorld = FudgeCore.Matrix4x4.INVERSION(_cmpCamera.mtxWorldToView);
            let picked = [];
            for (let i = 0; i < FudgeCore.Render.ƒpicked.length; i++) {
                let zBuffer = data[4 * i + 0] + data[4 * i + 1] / 256;
                if (zBuffer == 0) // discard misses 
                    continue;
                let pick = FudgeCore.Render.ƒpicked[i];
                pick.zBuffer = convertInt32toFloat32(data, 4 * i + 0) * 2 - 1;
                pick.color = convertInt32toColor(data, 4 * i + 1);
                pick.textureUV = FudgeCore.Recycler.get(FudgeCore.Vector2);
                pick.textureUV.set(convertInt32toFloat32(data, 4 * i + 2), convertInt32toFloat32(data, 4 * i + 3));
                pick.mtxViewToWorld = mtxViewToWorld;
                picked.push(pick);
            }
            return picked;
            function convertInt32toFloat32(_int32Array, _index) {
                let buffer = new ArrayBuffer(4);
                let view = new DataView(buffer);
                view.setInt32(0, _int32Array[_index]);
                return view.getFloat32(0);
            }
            function convertInt32toColor(_int32Array, _index) {
                let buffer = new ArrayBuffer(4);
                let view = new DataView(buffer);
                view.setInt32(0, _int32Array[_index]);
                let color = FudgeCore.Color.CSS(`rgb(${view.getUint8(0)}, ${view.getUint8(1)}, ${view.getUint8(2)})`, view.getUint8(3) / 255);
                return color;
            }
        }
        /**
        * The render function for picking a single node.
        * A cameraprojection with extremely narrow focus is used, so each pixel of the buffer would hold the same information from the node,
        * but the fragment shader renders only 1 pixel for each node into the render buffer, 1st node to 1st pixel, 2nd node to second pixel etc.
        */
        static pick(_node, _mtxMeshToWorld, _mtxWorldToView) {
            try {
                let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
                let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
                let coat = cmpMaterial.material.getCoat();
                let shader = coat instanceof FudgeCore.CoatTextured ? FudgeCore.ShaderPickTextured : FudgeCore.ShaderPick;
                shader.useProgram();
                coat.useRenderData(shader, cmpMaterial);
                let sizeUniformLocation = shader.uniforms["u_size"];
                RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);
                let mesh = cmpMesh.mesh;
                mesh.useRenderBuffers(shader, _mtxMeshToWorld, _mtxWorldToView, FudgeCore.Render.ƒpicked.length);
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
                let pick = new FudgeCore.Pick(_node);
                FudgeCore.Render.ƒpicked.push(pick);
            }
            catch (_error) {
                //
            }
        }
        //#endregion
        //#region Lights
        /**
         * Set light data in shaders
         */
        static setLightsInShader(_shader, _lights) {
            _shader.useProgram();
            let uni = _shader.uniforms;
            // Ambient
            let ambient = uni["u_ambient.color"];
            if (ambient) {
                RenderWebGL.crc3.uniform4fv(ambient, [0, 0, 0, 0]);
                let cmpLights = _lights.get(FudgeCore.LightAmbient);
                if (cmpLights) {
                    // TODO: add up ambient lights to a single color
                    let result = new FudgeCore.Color(0, 0, 0, 1);
                    for (let cmpLight of cmpLights)
                        result.add(cmpLight.light.color);
                    RenderWebGL.crc3.uniform4fv(ambient, result.getArray());
                }
            }
            // Directional
            let nDirectional = uni["u_nLightsDirectional"];
            if (nDirectional) {
                RenderWebGL.crc3.uniform1ui(nDirectional, 0);
                let cmpLights = _lights.get(FudgeCore.LightDirectional);
                if (cmpLights) {
                    let n = cmpLights.length;
                    RenderWebGL.crc3.uniform1ui(nDirectional, n);
                    for (let i = 0; i < n; i++) {
                        let cmpLight = cmpLights[i];
                        RenderWebGL.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
                        let direction = FudgeCore.Vector3.Z();
                        direction.transform(cmpLight.mtxPivot, false);
                        direction.transform(cmpLight.getContainer().mtxWorld);
                        RenderWebGL.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
                    }
                }
            }
        }
        //#endregion
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         */
        static drawMesh(_cmpMesh, cmpMaterial, _mtxMeshToWorld, _mtxWorldToView) {
            let shader = cmpMaterial.material.getShader();
            let coat = cmpMaterial.material.getCoat();
            shader.useProgram();
            _cmpMesh.mesh.useRenderBuffers(shader, _mtxMeshToWorld, _mtxWorldToView);
            coat.useRenderData(shader, cmpMaterial);
            RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _cmpMesh.mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
    }
    RenderWebGL.crc3 = RenderWebGL.initialize();
    RenderWebGL.rectRender = RenderWebGL.getCanvasRect();
    FudgeCore.RenderWebGL = RenderWebGL;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RenderWebGL.js.map