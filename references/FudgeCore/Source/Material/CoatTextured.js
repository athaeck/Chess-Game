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
     * A [[Coat]] providing a texture and additional data for texturing
     */
    let CoatTextured = class CoatTextured extends FudgeCore.CoatColored {
        constructor(_color, _texture) {
            super(_color);
            // TODO: see if color should be generalized
            // public color: Color = new Color(1, 1, 1, 1);
            this.texture = null;
            this.texture = _texture || FudgeCore.TextureDefault.texture;
        }
        //#region Transfer
        //TODO: examine if using super in serialization works with decorators... should.
        serialize() {
            let serialization = super.serialize();
            delete serialization.texture;
            serialization.idTexture = this.texture.idResource;
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            if (_serialization.idTexture)
                this.texture = await FudgeCore.Project.getResource(_serialization.idTexture);
            return this;
        }
    };
    CoatTextured = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatTextured);
    FudgeCore.CoatTextured = CoatTextured;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=CoatTextured.js.map