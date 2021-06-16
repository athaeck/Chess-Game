"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector2 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0) {
            super();
            this.data = new Float32Array([_x, _y]);
        }
        //#region Static
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static ZERO() {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(0, 0);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(_scale, _scale)`.
         * @param _scale the scale of the vector. Default: 1
         */
        static ONE(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_scale, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, y)`.
         * @param _scale The number to write in the y coordinate. Default: 1
         * @returns A new vector with the values (0, _scale)
         */
        static Y(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(0, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(x, 0)`.
         * @param _scale The number to write in the x coordinate. Default: 1
         * @returns A new vector with the values (_scale, 0)
         */
        static X(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_scale, 0);
            return vector;
        }
        static TRANSFORMATION(_vector, _mtxTransform, _includeTranslation = true) {
            let result = FudgeCore.Recycler.get(Vector2);
            let m = _mtxTransform.get();
            let [x, y] = _vector.get();
            result.x = m[0] * x + m[3] * y;
            result.y = m[1] * x + m[4] * y;
            if (_includeTranslation) {
                result.add(_mtxTransform.translation);
            }
            return result;
        }
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO();
            try {
                let [x, y] = _vector.data;
                let factor = _length / Math.hypot(x, y);
                vector.set(_vector.x * factor, _vector.y * factor);
            }
            catch (_error) {
                FudgeCore.Debug.warn(_error);
            }
            return vector;
        }
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector, _scale) {
            let vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_vector.x * _scale, _vector.y * _scale);
            return vector;
        }
        /**
         * Returns the resulting vector attained by addition of all given vectors.
         */
        static SUM(..._vectors) {
            let result = FudgeCore.Recycler.get(Vector2);
            for (let vector of _vectors)
                result.set(result.x + vector.x, result.y + vector.y);
            return result;
        }
        /**
         * Returns the result of the subtraction of two vectors.
         */
        static DIFFERENCE(_minuend, _subtrahend) {
            let vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y;
            return scalarProduct;
        }
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSS(_a, _b) {
            let crossProduct = _a.x * _b.y - _a.y * _b.x;
            return crossProduct;
        }
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         * ↑ => ← => ↓ => → => ↑
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector, _clockwise = false) {
            let result = FudgeCore.Recycler.get(Vector2);
            if (_clockwise)
                result.set(_vector.y, -_vector.x);
            else
                result.set(-_vector.y, _vector.x);
            return result;
        }
        /**
         * Creates a cartesian vector from polar coordinates
         */
        static GEO(_angle = 0, _magnitude = 1) {
            let vector = FudgeCore.Recycler.get(Vector2);
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo2);
            geo.set(_angle, _magnitude);
            vector.geo = geo;
            FudgeCore.Recycler.store(geo);
            return vector;
        }
        //#endregion
        //#region Accessors
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        /**
         * Returns the length of the vector
         */
        get magnitude() {
            return Math.hypot(...this.data);
        }
        /**
         * Returns the square of the magnitude of the vector without calculating a square root. Faster for simple proximity evaluation.
         */
        get magnitudeSquared() {
            return Vector2.DOT(this, this);
        }
        /**
         * @returns A deep copy of the vector.
         * TODO: rename this clone and create a new method copy, which copies the values from a vector given
         */
        get copy() {
            let copy = FudgeCore.Recycler.get(Vector2);
            copy.data.set(this.data);
            return copy;
        }
        /**
         * Returns a polar representation of this vector
         */
        get geo() {
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo2);
            geo.magnitude = this.magnitude;
            if (geo.magnitude === 0)
                return geo;
            geo.angle = 180 * Math.atan2(this.y / geo.magnitude, this.x / geo.magnitude) / Math.PI;
            return geo;
        }
        /**
         * Adjust the cartesian values of this vector to represent the given as polar coordinates
         */
        set geo(_geo) {
            this.set(_geo.magnitude, 0);
            this.transform(FudgeCore.Matrix3x3.ROTATION(_geo.angle));
        }
        //#endregion
        /**
         * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
         * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
         */
        equals(_compare, _tolerance = Number.EPSILON) {
            if (Math.abs(this.x - _compare.x) > _tolerance)
                return false;
            if (Math.abs(this.y - _compare.y) > _tolerance)
                return false;
            return true;
        }
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend) {
            this.data.set([_addend.x + this.x, _addend.y + this.y]);
        }
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend) {
            this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y]);
        }
        /**
         * Scales the Vector by the given _scalar.
         */
        scale(_scalar) {
            this.data.set([_scalar * this.x, _scalar * this.y]);
        }
        /**
         * Normalizes this to the given length, 1 by default
         */
        normalize(_length = 1) {
            this.data = Vector2.NORMALIZATION(this, _length).data;
        }
        /**
         * Defines the components of this vector with the given numbers
         */
        set(_x = 0, _y = 0) {
            this.data[0] = _x;
            this.data[1] = _y;
        }
        /**
         * @returns An array of the data of the vector
         */
        get() {
            return new Float32Array(this.data);
        }
        transform(_mtxTransform, _includeTranslation = true) {
            this.data = Vector2.TRANSFORMATION(this, _mtxTransform, _includeTranslation).data;
        }
        /**
         * For each dimension, moves the component to the minimum of this and the given vector
         */
        min(_compare) {
            this.x = Math.min(this.x, _compare.x);
            this.y = Math.min(this.y, _compare.y);
        }
        /**
         * For each dimension, moves the component to the maximum of this and the given vector
         */
        max(_compare) {
            this.x = Math.max(this.x, _compare.x);
            this.y = Math.max(this.y, _compare.y);
        }
        /**
         * Adds a z-component of the given magnitude (default=0) to the vector and returns a new Vector3
         */
        toVector3(_z = 0) {
            return new FudgeCore.Vector3(this.x, this.y, _z);
        }
        toString() {
            let result = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)})`;
            return result;
        }
        //#region Transfer
        serialize() {
            let serialization = this.getMutator();
            // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
            serialization.toJSON = () => { return `[${this.x}, ${this.y}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.x, this.y] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector2 = Vector2;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Vector2.js.map