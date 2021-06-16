"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    let MIPMAP;
    (function (MIPMAP) {
        MIPMAP[MIPMAP["CRISP"] = 0] = "CRISP";
        MIPMAP[MIPMAP["MEDIUM"] = 1] = "MEDIUM";
        MIPMAP[MIPMAP["BLURRY"] = 2] = "BLURRY";
    })(MIPMAP = FudgeCore.MIPMAP || (FudgeCore.MIPMAP = {}));
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    let Texture = class Texture extends FudgeCore.Mutable {
        constructor(_name = "Texture") {
            super();
            this.idResource = undefined;
            this.mipmap = MIPMAP.CRISP;
            this.name = _name;
        }
        useRenderData() { }
        //#region Transfer
        serialize() {
            return {};
        }
        async deserialize(_serialization) {
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.idResource;
        }
    };
    Texture = __decorate([
        FudgeCore.RenderInjectorTexture.decorate
    ], Texture);
    FudgeCore.Texture = Texture;
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture {
        constructor(_url) {
            super();
            this.image = null;
            if (_url) {
                this.load(_url);
                this.name = _url.toString().split("/").pop();
            }
            FudgeCore.Project.register(this);
        }
        get texImageSource() {
            return this.image;
        }
        /**
         * Asynchronously loads the image from the given url
         */
        async load(_url) {
            this.url = _url;
            this.image = new Image();
            // const response: Response = await window.fetch(this.url);
            // const blob: Blob = await response.blob();
            // let objectURL: string = URL.createObjectURL(blob);
            // this.image.src = objectURL;
            return new Promise((resolve, reject) => {
                this.image.addEventListener("load", () => {
                    this.renderData = null; // refresh render data on next draw call
                    resolve();
                });
                this.image.addEventListener("error", () => reject());
                this.image.src = new URL(this.url.toString(), FudgeCore.Project.baseURL).toString();
            });
        }
        //#region Transfer
        serialize() {
            return {
                url: this.url,
                idResource: this.idResource,
                name: this.name,
                type: this.type // serialize for editor views
            };
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            await this.load(_serialization.url);
            this.name = _serialization.name;
            // this.type is an accessor of Mutable doesn't need to be deserialized
            return this;
        }
        async mutate(_mutator) {
            if (_mutator.url != this.url.toString())
                await this.load(_mutator.url);
            // except url from mutator for further processing
            delete (_mutator.url);
            super.mutate(_mutator);
            // TODO: examine necessity to reconstruct, if mutator is kept by caller
            // _mutator.url = this.url; 
        }
    }
    FudgeCore.TextureImage = TextureImage;
    /**
     * Texture created from a canvas
     */
    class TextureBase64 extends Texture {
        constructor(_name, _base64, _mipmap = MIPMAP.CRISP) {
            super(_name);
            this.image = new Image();
            this.image.src = _base64;
            this.mipmap = _mipmap;
        }
        get texImageSource() {
            return this.image;
        }
    }
    FudgeCore.TextureBase64 = TextureBase64;
    /**
     * Texture created from a canvas
     */
    class TextureCanvas extends Texture {
        constructor(_name, _crc2) {
            super(_name);
            this.crc2 = _crc2;
        }
        get texImageSource() {
            return this.crc2.canvas;
        }
    }
    FudgeCore.TextureCanvas = TextureCanvas;
    /**
     * Texture created from a FUDGE-Sketch
     */
    class TextureSketch extends TextureCanvas {
        get texImageSource() {
            return null;
        }
    }
    FudgeCore.TextureSketch = TextureSketch;
    /**
     * Texture created from an HTML-page
     */
    class TextureHTML extends TextureCanvas {
        get texImageSource() {
            return null;
        }
    }
    FudgeCore.TextureHTML = TextureHTML;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Texture.js.map