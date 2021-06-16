"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    class Color extends FudgeCore.Mutable {
        constructor(_r = 1, _g = 1, _b = 1, _a = 1) {
            super();
            this.setNormRGBA(_r, _g, _b, _a);
        }
        static getHexFromCSSKeyword(_keyword) {
            Color.crc2.fillStyle = _keyword;
            return Color.crc2.fillStyle;
        }
        static CSS(_keyword, _alpha = 1) {
            let hex = Color.getHexFromCSSKeyword(_keyword);
            let color = new Color(parseInt(hex.substr(1, 2), 16) / 255, parseInt(hex.substr(3, 2), 16) / 255, parseInt(hex.substr(5, 2), 16) / 255, _alpha);
            return color;
        }
        static MULTIPLY(_color1, _color2) {
            return new Color(_color1.r * _color2.r, _color1.g * _color2.g, _color1.b * _color2.b, _color1.a * _color2.a);
        }
        setNormRGBA(_r, _g, _b, _a) {
            this.r = Math.min(1, Math.max(0, _r));
            this.g = Math.min(1, Math.max(0, _g));
            this.b = Math.min(1, Math.max(0, _b));
            this.a = Math.min(1, Math.max(0, _a));
        }
        setBytesRGBA(_r, _g, _b, _a) {
            this.setNormRGBA(_r / 255, _g / 255, _b / 255, _a / 255);
        }
        getArray() {
            return new Float32Array([this.r, this.g, this.b, this.a]);
        }
        setArrayNormRGBA(_color) {
            this.setNormRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        setArrayBytesRGBA(_color) {
            this.setBytesRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        getArrayBytesRGBA() {
            return new Uint8ClampedArray([this.r * 255, this.g * 255, this.b * 255, this.a * 255]);
        }
        add(_color) {
            this.r += _color.r;
            this.g += _color.g;
            this.b += _color.b;
            this.a += _color.a;
        }
        getCSS() {
            let bytes = this.getArrayBytesRGBA();
            return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${bytes[3]})`;
        }
        getHex() {
            let bytes = this.getArrayBytesRGBA();
            let hex = "";
            for (let byte of bytes)
                hex += byte.toString(16).padStart(2, "0");
            return hex;
        }
        setHex(_hex) {
            let bytes = this.getArrayBytesRGBA();
            let channel = 0;
            for (let byte in bytes)
                bytes[byte] = parseInt(_hex.substr(channel++ * 2, 2), 16);
            this.setArrayBytesRGBA(bytes);
        }
        copy(_color) {
            this.r = _color.r;
            this.g = _color.g;
            this.b = _color.b;
            this.a = _color.a;
        }
        toString() {
            return `(r: ${this.r.toFixed(3)}, g: ${this.g.toFixed(3)}, b: ${this.b.toFixed(3)}, a: ${this.a.toFixed(3)})`;
        }
        //#region Transfer
        serialize() {
            let serialization = this.getMutator(true);
            // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
            serialization.toJSON = () => { return `[${this.r}, ${this.g}, ${this.b}, ${this.a}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.r, this.g, this.b, this.a] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        reduceMutator(_mutator) { }
    }
    // crc2 only used for converting colors from strings predefined by CSS
    Color.crc2 = document.createElement("canvas").getContext("2d");
    FudgeCore.Color = Color;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Color.js.map