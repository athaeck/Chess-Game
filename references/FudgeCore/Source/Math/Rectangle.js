"use strict";
///<reference path="../Recycle/Recycler.ts"/>
///<reference path="Vector2.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines the origin of a rectangle
     */
    let ORIGIN2D;
    (function (ORIGIN2D) {
        ORIGIN2D[ORIGIN2D["TOPLEFT"] = 0] = "TOPLEFT";
        ORIGIN2D[ORIGIN2D["TOPCENTER"] = 1] = "TOPCENTER";
        ORIGIN2D[ORIGIN2D["TOPRIGHT"] = 2] = "TOPRIGHT";
        ORIGIN2D[ORIGIN2D["CENTERLEFT"] = 16] = "CENTERLEFT";
        ORIGIN2D[ORIGIN2D["CENTER"] = 17] = "CENTER";
        ORIGIN2D[ORIGIN2D["CENTERRIGHT"] = 18] = "CENTERRIGHT";
        ORIGIN2D[ORIGIN2D["BOTTOMLEFT"] = 32] = "BOTTOMLEFT";
        ORIGIN2D[ORIGIN2D["BOTTOMCENTER"] = 33] = "BOTTOMCENTER";
        ORIGIN2D[ORIGIN2D["BOTTOMRIGHT"] = 34] = "BOTTOMRIGHT";
    })(ORIGIN2D = FudgeCore.ORIGIN2D || (FudgeCore.ORIGIN2D = {}));
    /**
     * Defines a rectangle with position and size and add comfortable methods to it
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Rectangle extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            super();
            this.position = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.size = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.setPositionAndSize(_x, _y, _width, _height, _origin);
        }
        /**
         * Returns a new rectangle created with the given parameters
         */
        static GET(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            let rect = FudgeCore.Recycler.get(Rectangle);
            rect.setPositionAndSize(_x, _y, _width, _height);
            return rect;
        }
        get x() {
            return this.position.x;
        }
        get y() {
            return this.position.y;
        }
        get width() {
            return this.size.x;
        }
        get height() {
            return this.size.y;
        }
        /**
         * Return the leftmost expansion, respecting also negative values of width
         */
        get left() {
            if (this.size.x > 0)
                return this.position.x;
            return (this.position.x + this.size.x);
        }
        /**
         * Return the topmost expansion, respecting also negative values of height
         */
        get top() {
            if (this.size.y > 0)
                return this.position.y;
            return (this.position.y + this.size.y);
        }
        /**
         * Return the rightmost expansion, respecting also negative values of width
         */
        get right() {
            if (this.size.x > 0)
                return (this.position.x + this.size.x);
            return this.position.x;
        }
        /**
         * Return the lowest expansion, respecting also negative values of height
         */
        get bottom() {
            if (this.size.y > 0)
                return (this.position.y + this.size.y);
            return this.position.y;
        }
        set x(_x) {
            this.position.x = _x;
        }
        set y(_y) {
            this.position.y = _y;
        }
        set width(_width) {
            this.size.x = _width;
        }
        set height(_height) {
            this.size.y = _height;
        }
        set left(_value) {
            this.size.x = this.right - _value;
            this.position.x = _value;
        }
        set top(_value) {
            this.size.y = this.bottom - _value;
            this.position.y = _value;
        }
        set right(_value) {
            this.size.x = this.position.x + _value;
        }
        set bottom(_value) {
            this.size.y = this.position.y + _value;
        }
        get copy() {
            return Rectangle.GET(this.x, this.y, this.width, this.height);
        }
        /**
         * Sets the position and size of the rectangle according to the given parameters
         */
        setPositionAndSize(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            this.size.set(_width, _height);
            switch (_origin & 0x03) {
                case 0x00:
                    this.position.x = _x;
                    break;
                case 0x01:
                    this.position.x = _x - _width / 2;
                    break;
                case 0x02:
                    this.position.x = _x - _width;
                    break;
            }
            switch (_origin & 0x30) {
                case 0x00:
                    this.position.y = _y;
                    break;
                case 0x10:
                    this.position.y = _y - _height / 2;
                    break;
                case 0x20:
                    this.position.y = _y - _height;
                    break;
            }
        }
        pointToRect(_point, _target) {
            let result = _point.copy;
            result.subtract(this.position);
            result.x *= _target.width / this.width;
            result.y *= _target.height / this.height;
            result.add(_target.position);
            return result;
        }
        /**
         * Returns true if the given point is inside of this rectangle or on the border
         * @param _point
         */
        isInside(_point) {
            return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
        }
        /**
         * Returns true if this rectangle collides with the rectangle given
         * @param _rect
         */
        collides(_rect) {
            if (this.left > _rect.right)
                return false;
            if (this.right < _rect.left)
                return false;
            if (this.top > _rect.bottom)
                return false;
            if (this.bottom < _rect.top)
                return false;
            return true;
        }
        /**
         * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
         */
        getIntersection(_rect) {
            if (!this.collides(_rect))
                return null;
            let intersection = new Rectangle();
            intersection.x = Math.max(this.left, _rect.left);
            intersection.y = Math.max(this.top, _rect.top);
            intersection.width = Math.min(this.right, _rect.right) - intersection.x;
            intersection.height = Math.min(this.bottom, _rect.bottom) - intersection.y;
            return intersection;
        }
        /**
     * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
     */
        covers(_rect) {
            if (this.left > _rect.left)
                return false;
            if (this.right < _rect.right)
                return false;
            if (this.top > _rect.top)
                return false;
            if (this.bottom < _rect.bottom)
                return false;
            return true;
        }
        /**
         * Creates a string representation of this rectangle
         */
        toString() {
            let result = `ƒ.Rectangle(position:${this.position.toString()}, size:${this.size.toString()}`;
            result += `, left:${this.left.toPrecision(5)}, top:${this.top.toPrecision(5)}, right:${this.right.toPrecision(5)}, bottom:${this.bottom.toPrecision(5)}`;
            return result;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Rectangle = Rectangle;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Rectangle.js.map