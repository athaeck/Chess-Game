"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// / <reference path="../Coat/Coat.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    var Shader_1;
    // TODO: define attribute/uniforms as layout and use those consistently in shaders
    let Shader = Shader_1 = class Shader {
        /** The type of coat that can be used with this shader to create a material */
        static getCoat() { return null; }
        static getVertexShaderSource() { return null; }
        static getFragmentShaderSource() { return null; }
        static deleteProgram() { }
        static useProgram() { }
        static createProgram() { }
        static registerSubclass(_subclass) { return Shader_1.subclasses.push(_subclass) - 1; }
    };
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    Shader.baseClass = Shader_1;
    /** list of all the subclasses derived from this class, if they registered properly*/
    Shader.subclasses = [];
    Shader = Shader_1 = __decorate([
        FudgeCore.RenderInjectorShader.decorate
    ], Shader);
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Shader.js.map