"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material.
     * Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
     * @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderMatCap extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatMatCap;
        }
        static getVertexShaderSource() {
            return `#version 300 es
        in vec3 a_position;
        in vec3 a_normal;

        uniform mat4 u_projection;

        out vec2 texcoords_smooth;
        flat out vec2 texcoords_flat;

        void main() {
            texcoords_smooth = normalize(mat3(u_projection) * a_normal).xy * 0.5 - 0.5;
            texcoords_flat = texcoords_smooth;
            gl_Position = u_projection * vec4(a_position, 1.0);
        }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;
        
        uniform vec4 u_tint_color;
        uniform int shade_smooth;
        uniform sampler2D u_texture;
        
        in vec2 texcoords_smooth;
        flat in vec2 texcoords_flat;

        out vec4 frag;

        void main() {

            if (shade_smooth > 0) {
              frag = u_tint_color * texture(u_texture, texcoords_smooth) * 2.0;
            } else {
              frag = u_tint_color * texture(u_texture, texcoords_flat) * 2.0;
            }
        }`;
        }
    }
    ShaderMatCap.iSubclass = FudgeCore.Shader.registerSubclass(ShaderMatCap);
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ShaderMatCap.js.map