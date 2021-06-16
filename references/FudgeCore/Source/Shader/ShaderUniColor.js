"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderUniColor extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatColored;
        }
        static getVertexShaderSource() {
            return `#version 300 es
        in vec3 a_position;
        uniform mat4 u_projection;
        
        void main() {   
            gl_Position = u_projection * vec4(a_position, 1.0);
        }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;
        
        uniform vec4 u_color;
        out vec4 frag;
        
        void main() {
          // if (gl_FragCoord.x < 200.0)
          frag = u_color;
         //    frag = vec4(1.0,1.0,1.0,1.0);
        }`;
        }
    }
    ShaderUniColor.iSubclass = FudgeCore.Shader.registerSubclass(ShaderUniColor);
    FudgeCore.ShaderUniColor = ShaderUniColor;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ShaderUniColor.js.map