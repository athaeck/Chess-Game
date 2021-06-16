"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Class for creating random values, supporting Javascript's Math.random and a deterministig pseudo-random number generator (PRNG)
     * that can be fed with a seed and then returns a reproducable set of random numbers (if the precision of Javascript allows)
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Random {
        /**
         * Create an instance of [[Random]]. If desired, creates a PRNG with it and feeds the given seed.
         * @param _ownGenerator Default is false
         * @param _seed Default is Math.random()
         */
        constructor(_ownGenerator = false, _seed = Math.random()) {
            this.generate = Math.random;
            if (_ownGenerator)
                this.generate = Random.createGenerator(_seed);
        }
        /**
         * Creates a dererminstic PRNG with the given seed
         */
        static createGenerator(_seed) {
            // TODO: replace with random number generator to generate predictable sequence
            return Math.random;
        }
        /**
         * Returns a normed random number, thus in the range of [0, 1[
         */
        getNorm() {
            return this.generate();
        }
        /**
         * Returns a random number in the range of given [_min, _max[
         */
        getRange(_min, _max) {
            return _min + this.generate() * (_max - _min);
        }
        /**
         * Returns a random integer number in the range of given floored [_min, _max[
         */
        getRangeFloored(_min, _max) {
            return Math.floor(this.getRange(_min, _max));
        }
        /**
         * Returns true or false randomly
         */
        getBoolean() {
            return this.generate() < 0.5;
        }
        /**
         * Returns -1 or 1 randomly
         */
        getSign() {
            return this.getBoolean() ? 1 : -1;
        }
        /**
         * Returns a randomly selected index into the given array
         */
        getIndex(_array) {
            if (_array.length > 0)
                return this.getRangeFloored(0, _array.length);
            return -1;
        }
        /**
         * Returns a randomly selected element of the given array
         */
        getElement(_array) {
            if (_array.length > 0)
                return _array[this.getIndex(_array)];
            return null;
        }
        /**
         * Removes a randomly selected element from the given array and returns it
         */
        splice(_array) {
            return _array.splice(this.getIndex(_array), 1)[0];
        }
        /**
         * Returns a randomly selected key from the given Map-instance
         */
        getKey(_map) {
            let keys = Array.from(_map.keys());
            return keys[this.getIndex(keys)];
        }
        /**
         * Returns a randomly selected property name from the given object
         */
        getPropertyName(_object) {
            let keys = Object.getOwnPropertyNames(_object);
            return keys[this.getIndex(keys)];
        }
        /**
         * Returns a randomly selected symbol from the given object, if symbols are used as keys
         */
        getPropertySymbol(_object) {
            let keys = Object.getOwnPropertySymbols(_object);
            return keys[this.getIndex(keys)];
        }
        /**
         * Returns a random three-dimensional vector in the limits of the box defined by the vectors given as [_corner0, _corner1[
         */
        getVector3(_corner0, _corner1) {
            return new FudgeCore.Vector3(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y), this.getRange(_corner0.z, _corner1.z));
        }
        /**
         * Returns a random two-dimensional vector in the limits of the rectangle defined by the vectors given as [_corner0, _corner1[
         */
        getVector2(_corner0, _corner1) {
            return new FudgeCore.Vector2(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y));
        }
    }
    Random.default = new Random();
    FudgeCore.Random = Random;
    /**
     * Standard [[Random]]-instance using Math.random().
     */
    FudgeCore.random = new Random();
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Random.js.map