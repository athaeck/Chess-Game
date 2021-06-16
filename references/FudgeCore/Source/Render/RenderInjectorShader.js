"use strict";
var FudgeCore;
(function (FudgeCore) {
    //gives WebGL Buffer the data from the [[Shader]]
    class RenderInjectorShader {
        static decorate(_constructor) {
            Object.defineProperty(_constructor, "useProgram", {
                value: RenderInjectorShader.useProgram
            });
            Object.defineProperty(_constructor, "deleteProgram", {
                value: RenderInjectorShader.deleteProgram
            });
            Object.defineProperty(_constructor, "createProgram", {
                value: RenderInjectorShader.createProgram
            });
        }
        static useProgram() {
            if (!this.program)
                this.createProgram();
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            crc3.useProgram(this.program);
            crc3.enableVertexAttribArray(this.attributes["a_position"]);
        }
        static deleteProgram() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.program) {
                crc3.deleteProgram(this.program);
                delete this.attributes;
                delete this.uniforms;
            }
        }
        static createProgram() {
            FudgeCore.Debug.fudge("Create shader program", this.name);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let program = crc3.createProgram();
            try {
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
                crc3.linkProgram(program);
                let error = FudgeCore.RenderWebGL.assert(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                this.program = program;
                this.attributes = detectAttributes();
                this.uniforms = detectUniforms();
            }
            catch (_error) {
                FudgeCore.Debug.error(_error);
                debugger;
            }
            function compileShader(_shaderCode, _shaderType) {
                let webGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error = FudgeCore.RenderWebGL.assert(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
                // Check for any compilation errors.
                if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
                    alert(crc3.getShaderInfoLog(webGLShader));
                    return null;
                }
                return webGLShader;
            }
            function detectAttributes() {
                let detectedAttributes = {};
                let attributeCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
                for (let i = 0; i < attributeCount; i++) {
                    let attributeInfo = FudgeCore.RenderWebGL.assert(crc3.getActiveAttrib(program, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms() {
                let detectedUniforms = {};
                let uniformCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    let info = FudgeCore.RenderWebGL.assert(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = FudgeCore.RenderWebGL.assert(crc3.getUniformLocation(program, info.name));
                }
                return detectedUniforms;
            }
        }
    }
    FudgeCore.RenderInjectorShader = RenderInjectorShader;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RenderInjectorShader.js.map