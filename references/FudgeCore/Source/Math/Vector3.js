"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores and manipulates a threedimensional vector comprised of the components x, y and z
     * ```plaintext
     *            +y
     *             |__ +x
     *            /
     *          +z
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0) {
            super();
            this.data = new Float32Array([_x, _y, _z]);
        }
        //#region Static
        /**
         * Creates and returns a vector with the given length pointing in x-direction
         */
        static X(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_scale, 0, 0);
            return vector;
        }
        /**
         * Creates and returns a vector with the given length pointing in y-direction
         */
        static Y(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(0, _scale, 0);
            return vector;
        }
        /**
         * Creates and returns a vector with the given length pointing in z-direction
         */
        static Z(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.data.set([0, 0, _scale]);
            return vector;
        }
        /**
         * Creates and returns a vector with the value 0 on each axis
         */
        static ZERO() {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(0, 0, 0);
            return vector;
        }
        /**
         * Creates and returns a vector of the given size on each of the three axis
         */
        static ONE(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_scale, _scale, _scale);
            return vector;
        }
        /**
         * Creates and returns a vector through transformation of the given vector by the given matrix
         */
        static TRANSFORMATION(_vector, _mtxTransform, _includeTranslation = true) {
            let result = FudgeCore.Recycler.get(Vector3);
            let m = _mtxTransform.get();
            let [x, y, z] = _vector.get();
            result.x = m[0] * x + m[4] * y + m[8] * z;
            result.y = m[1] * x + m[5] * y + m[9] * z;
            result.z = m[2] * x + m[6] * y + m[10] * z;
            if (_includeTranslation) {
                result.add(_mtxTransform.translation);
            }
            return result;
        }
        /**
         * Creates and returns a vector which is a copy of the given vector scaled to the given length
         */
        static NORMALIZATION(_vector, _length = 1) {
            let magnitude = _vector.magnitude;
            let vector;
            try {
                if (magnitude == 0)
                    throw (new RangeError("Impossible normalization"));
                vector = Vector3.ZERO();
                let factor = _length / _vector.magnitude;
                vector.set(_vector.x * factor, _vector.y * factor, _vector.z * factor);
            }
            catch (_error) {
                FudgeCore.Debug.warn(_error);
            }
            return vector;
        }
        /**
         * Returns the resulting vector attained by addition of all given vectors.
         */
        static SUM(..._vectors) {
            let result = FudgeCore.Recycler.get(Vector3);
            for (let vector of _vectors)
                result.set(result.x + vector.x, result.y + vector.y, result.z + vector.z);
            return result;
        }
        /**
         * Returns the result of the subtraction of two vectors.
         */
        static DIFFERENCE(_minuend, _subtrahend) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y, _minuend.z - _subtrahend.z);
            return vector;
        }
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector, _scaling) {
            let scaled = FudgeCore.Recycler.get(Vector3);
            scaled.set(_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling);
            return scaled;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         */
        static CROSS(_a, _b) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_a.y * _b.z - _a.z * _b.y, _a.z * _b.x - _a.x * _b.z, _a.x * _b.y - _a.y * _b.x);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Calculates and returns the reflection of the incoming vector at the given normal vector. The length of normal should be 1.
         *     __________________
         *           /|\
         * incoming / | \ reflection
         *         /  |  \
         *          normal
         *
         */
        static REFLECTION(_incoming, _normal) {
            let dot = -Vector3.DOT(_incoming, _normal);
            let reflection = Vector3.SUM(_incoming, Vector3.SCALE(_normal, 2 * dot));
            return reflection;
        }
        /**
         * Divides the dividend by the divisor component by component and returns the result
         */
        static RATIO(_dividend, _divisor) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_dividend.x / _divisor.x, _dividend.y / _divisor.y, _dividend.z / _divisor.z);
            return vector;
        }
        /**
         * Creates a cartesian vector from geographic coordinates
         */
        static GEO(_longitude = 0, _latitude = 0, _magnitude = 1) {
            let vector = FudgeCore.Recycler.get(Vector3);
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo3);
            geo.set(_longitude, _latitude, _magnitude);
            vector.geo = geo;
            FudgeCore.Recycler.store(geo);
            return vector;
        }
        //#endregion
        //#region Accessors
        // TODO: implement equals-functions
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        get z() {
            return this.data[2];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        set z(_z) {
            this.data[2] = _z;
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
            return Vector3.DOT(this, this);
        }
        /**
         * Returns a copy of this vector
         * TODO: rename this clone and create a new method copy, which copies the values from a vector given
         */
        get copy() {
            let copy = FudgeCore.Recycler.get(Vector3);
            copy.data.set(this.data);
            return copy;
        }
        /**
         * - get: returns a geographic representation of this vector
         * - set: adjust the cartesian values of this vector to represent the given as geographic coordinates
         */
        set geo(_geo) {
            this.set(0, 0, _geo.magnitude);
            this.transform(FudgeCore.Matrix4x4.ROTATION_X(-_geo.latitude));
            this.transform(FudgeCore.Matrix4x4.ROTATION_Y(_geo.longitude));
        }
        get geo() {
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo3);
            geo.magnitude = this.magnitude;
            if (geo.magnitude === 0)
                return geo;
            geo.longitude = 180 * Math.atan2(this.x / geo.magnitude, this.z / geo.magnitude) / Math.PI;
            geo.latitude = 180 * Math.asin(this.y / geo.magnitude) / Math.PI;
            return geo;
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
            if (Math.abs(this.z - _compare.z) > _tolerance)
                return false;
            return true;
        }
        /**
         * Returns true if the position described by this is within a cube with the opposite corners 1 and 2
         */
        isInsideCube(_corner1, _corner2) {
            let diagonal = Vector3.DIFFERENCE(_corner2, _corner1);
            let relative = Vector3.DIFFERENCE(this, _corner1);
            let ratio = Vector3.RATIO(relative, diagonal);
            if (ratio.x > 1 || ratio.x < 0)
                return false;
            if (ratio.y > 1 || ratio.y < 0)
                return false;
            if (ratio.z > 1 || ratio.z < 0)
                return false;
            return true;
        }
        /**
         * Returns true if the position described by this is within a sphere with the given center and radius
         */
        isInsideSphere(_center, _radius) {
            let difference = Vector3.DIFFERENCE(this, _center);
            return difference.magnitudeSquared < (_radius * _radius);
        }
        /**
         * Adds the given vector to this
         */
        add(_addend) {
            this.data.set([_addend.x + this.x, _addend.y + this.y, _addend.z + this.z]);
        }
        /**
         * Subtracts the given vector from this
         */
        subtract(_subtrahend) {
            this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z]);
        }
        /**
         * Scales this vector by the given scalar
         */
        scale(_scalar) {
            this.data.set([_scalar * this.x, _scalar * this.y, _scalar * this.z]);
        }
        /**
         * Normalizes this to the given length, 1 by default
         */
        normalize(_length = 1) {
            this.data = Vector3.NORMALIZATION(this, _length).data;
        }
        /**
         * Defines the components of this vector with the given numbers
         */
        set(_x = 0, _y = 0, _z = 0) {
            this.data[0] = _x;
            this.data[1] = _y;
            this.data[2] = _z;
        }
        /**
         * Returns this vector as a new Float32Array (copy)
         */
        get() {
            return new Float32Array(this.data);
        }
        /**
         * Transforms this vector by the given matrix, including or exluding the translation.
         * Including is the default, excluding will only rotate and scale this vector.
         */
        transform(_mtxTransform, _includeTranslation = true) {
            this.data = Vector3.TRANSFORMATION(this, _mtxTransform, _includeTranslation).data;
        }
        /**
         * Drops the z-component and returns a Vector2 consisting of the x- and y-components
         */
        toVector2() {
            return new FudgeCore.Vector2(this.x, this.y);
        }
        /**
         * Reflects this vector at a given normal. See [[REFLECTION]]
         */
        reflect(_normal) {
            const reflected = Vector3.REFLECTION(this, _normal);
            this.set(reflected.x, reflected.y, reflected.z);
            FudgeCore.Recycler.store(reflected);
        }
        /**
         * Shuffles the components of this vector
         */
        shuffle() {
            let a = Array.from(this.data);
            this.set(FudgeCore.Random.default.splice(a), FudgeCore.Random.default.splice(a), a[0]);
        }
        /**
         * For each dimension, moves the component to the minimum of this and the given vector
         */
        min(_compare) {
            this.x = Math.min(this.x, _compare.x);
            this.y = Math.min(this.y, _compare.y);
            this.z = Math.min(this.z, _compare.z);
        }
        /**
         * For each dimension, moves the component to the maximum of this and the given vector
         */
        max(_compare) {
            this.x = Math.max(this.x, _compare.x);
            this.y = Math.max(this.y, _compare.y);
            this.z = Math.max(this.z, _compare.z);
        }
        /**
         * Returns a formatted string representation of this vector
         */
        toString() {
            let result = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)}, ${this.z.toPrecision(5)})`;
            return result;
        }
        /**
         * Uses the standard array.map functionality to perform the given function on all components of this vector
         */
        map(_function) {
            let copy = FudgeCore.Recycler.get(Vector3);
            copy.data = this.data.map(_function);
            return copy;
        }
        //#region Transfer
        serialize() {
            let serialization = this.getMutator();
            // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
            serialization.toJSON = () => { return `[${this.x}, ${this.y}, ${this.z}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.x, this.y, this.z] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1], z: this.data[2]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector3 = Vector3;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Vector3.js.map