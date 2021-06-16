"use strict";
var FudgeCore;
(function (FudgeCore) {
    //gives WebGL Buffer the data from the [[coat]]
    class RenderInjectorCoat extends FudgeCore.RenderInjector {
        static decorate(_constructor) {
            FudgeCore.RenderInjector.inject(_constructor, RenderInjectorCoat);
        }
        static injectCoatColored(_shader, _cmpMaterial) {
            let colorUniformLocation = _shader.uniforms["u_color"];
            let color = FudgeCore.Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(colorUniformLocation, color.getArray());
        }
        static injectCoatTextured(_shader, _cmpMaterial) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            // if (this.renderData) {
            // buffers exist
            // TODO: find a way to use inheritance through decorator, thus calling methods injected in superclass
            let colorUniformLocation = _shader.uniforms["u_color"];
            let color = FudgeCore.Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(colorUniformLocation, color.getArray());
            // crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
            // crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
            this.texture.useRenderData();
            crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            crc3.uniformMatrix3fv(_shader.uniforms["u_pivot"], false, _cmpMaterial.mtxPivot.get());
            // }
            // else {
            //   this.renderData = {};
            //   (<CoatTextured>this).texture.useRenderData();
            //   this.useRenderData(_shader, _cmpMaterial);
            // }
        }
        static injectCoatMatCap(_shader, _cmpMaterial) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let colorUniformLocation = _shader.uniforms["u_tint_color"];
            let { r, g, b, a } = this.color;
            let tintColorArray = new Float32Array([r, g, b, a]);
            crc3.uniform4fv(colorUniformLocation, tintColorArray);
            let floatUniformLocation = _shader.uniforms["shade_smooth"];
            let shadeSmooth = this.shadeSmooth;
            crc3.uniform1i(floatUniformLocation, shadeSmooth);
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = FudgeCore.Render.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_error) {
                    FudgeCore.Debug.error(_error);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_shader, _cmpMaterial);
            }
        }
    }
    FudgeCore.RenderInjectorCoat = RenderInjectorCoat;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RenderInjectorCoat.js.map