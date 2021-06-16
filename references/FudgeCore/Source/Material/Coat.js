"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    /**
     * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].
     * [[Material]]s reference [[Coat]] and [[Shader]].
     * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
     */
    class Coat extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.name = "Coat";
            //#endregion
        }
        useRenderData(_shader, _cmpMaterial) { }
        //#region Transfer
        serialize() {
            let serialization = { name: this.name };
            return serialization;
        }
        async deserialize(_serialization) {
            this.name = _serialization.name;
            return this;
        }
        reduceMutator() { }
    }
    FudgeCore.Coat = Coat;
    /**
     * The simplest [[Coat]] providing just a color
     */
    let CoatColored = class CoatColored extends Coat {
        constructor(_color) {
            super();
            this.color = _color || new FudgeCore.Color();
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.color = this.color.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            this.color.deserialize(_serialization.color);
            return this;
        }
    };
    CoatColored = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatColored);
    FudgeCore.CoatColored = CoatColored;
    /**
     * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral). Set shadeSmooth to 1 for smooth shading.
     */
    let CoatMatCap = class CoatMatCap extends Coat {
        constructor(_texture, _color, _shadeSmooth) {
            super();
            this.texture = null;
            this.color = new FudgeCore.Color();
            this.texture = _texture || new FudgeCore.TextureImage();
            this.color = _color || new FudgeCore.Color();
            this.shadeSmooth = _shadeSmooth || 0;
        }
    };
    CoatMatCap = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatMatCap);
    FudgeCore.CoatMatCap = CoatMatCap;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Coat.js.map