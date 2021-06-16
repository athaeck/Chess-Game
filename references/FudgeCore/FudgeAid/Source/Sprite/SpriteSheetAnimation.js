"use strict";
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Describes a single frame of a sprite animation
     */
    class SpriteFrame {
    }
    FudgeAid.SpriteFrame = SpriteFrame;
    /**
     * Convenience for creating a [[CoatTexture]] to use as spritesheet
     */
    function createSpriteSheet(_name, _image) {
        let coat = new ƒ.CoatTextured();
        coat.name = _name;
        let texture = new ƒ.TextureImage();
        texture.image = _image;
        coat.texture = texture;
        return coat;
    }
    FudgeAid.createSpriteSheet = createSpriteSheet;
    /**
     * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
     * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
     */
    class SpriteSheetAnimation {
        constructor(_name, _spritesheet) {
            this.frames = [];
            this.name = _name;
            this.spritesheet = _spritesheet;
        }
        /**
         * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
         */
        generate(_rects, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            this.frames = [];
            let framing = new ƒ.FramingScaled();
            framing.setScale(1 / img.width, 1 / img.height);
            let count = 0;
            for (let rect of _rects) {
                let frame = this.createFrame(this.name + `${count}`, framing, rect, _resolutionQuad, _origin);
                frame.timeScale = 1;
                this.frames.push(frame);
                count++;
            }
        }
        /**
         * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
         * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
         * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
         * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
         */
        generateByGrid(_startRect, _frames, _resolutionQuad, _origin, _offsetNext, _offsetWrap = ƒ.Vector2.ZERO()) {
            let img = this.spritesheet.texture.texImageSource;
            let rectImage = new ƒ.Rectangle(0, 0, img.width, img.height);
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.add(_offsetNext);
                if (rectImage.covers(rect))
                    continue;
                _startRect.position.add(_offsetWrap);
                rect = _startRect.copy;
                if (!rectImage.covers(rect))
                    break;
            }
            rects.forEach((_rect) => ƒ.Debug.log(_rect.toString()));
            this.generate(rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _framing, _rect, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            let rectTexture = new ƒ.Rectangle(0, 0, img.width, img.height);
            let frame = new SpriteFrame();
            frame.rectTexture = _framing.getRect(_rect);
            frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);
            let rectQuad = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
            frame.mtxPivot = ƒ.Matrix4x4.IDENTITY();
            frame.mtxPivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
            frame.mtxPivot.scaleX(rectQuad.size.x);
            frame.mtxPivot.scaleY(rectQuad.size.y);
            // ƒ.Debug.log(rectQuad.toString());
            frame.mtxTexture = ƒ.Matrix3x3.IDENTITY();
            frame.mtxTexture.translate(frame.rectTexture.position);
            frame.mtxTexture.scale(frame.rectTexture.size);
            return frame;
        }
    }
    FudgeAid.SpriteSheetAnimation = SpriteSheetAnimation;
})(FudgeAid || (FudgeAid = {}));
//# sourceMappingURL=SpriteSheetAnimation.js.map