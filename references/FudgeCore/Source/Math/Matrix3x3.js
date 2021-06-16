"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Simple class for 3x3 matrix operations
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Matrix3x3 extends FudgeCore.Mutable {
        constructor() {
            super();
            this.data = new Float32Array(3); // The data of the matrix.
            this.mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
            this.data = new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
            this.resetCache();
        }
        //TODO: figure out what this is used for
        static PROJECTION(_width, _height) {
            let mtxResult = new Matrix3x3;
            mtxResult.data.set([
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ]);
            return mtxResult;
        }
        static IDENTITY() {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                1, 0, 0,
                0, 1, 0,
                _translate.x, _translate.y, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, sin, 0,
                -sin, cos, 0,
                0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                _scalar.x, 0, 0,
                0, _scalar.y, 0,
                0, 0, 1
            ]);
            return mtxResult;
        }
        //#endregion
        static MULTIPLICATION(_mtxLeft, _mtxRight) {
            let a00 = _mtxLeft.data[0 * 3 + 0];
            let a01 = _mtxLeft.data[0 * 3 + 1];
            let a02 = _mtxLeft.data[0 * 3 + 2];
            let a10 = _mtxLeft.data[1 * 3 + 0];
            let a11 = _mtxLeft.data[1 * 3 + 1];
            let a12 = _mtxLeft.data[1 * 3 + 2];
            let a20 = _mtxLeft.data[2 * 3 + 0];
            let a21 = _mtxLeft.data[2 * 3 + 1];
            let a22 = _mtxLeft.data[2 * 3 + 2];
            let b00 = _mtxRight.data[0 * 3 + 0];
            let b01 = _mtxRight.data[0 * 3 + 1];
            let b02 = _mtxRight.data[0 * 3 + 2];
            let b10 = _mtxRight.data[1 * 3 + 0];
            let b11 = _mtxRight.data[1 * 3 + 1];
            let b12 = _mtxRight.data[1 * 3 + 2];
            let b20 = _mtxRight.data[2 * 3 + 0];
            let b21 = _mtxRight.data[2 * 3 + 1];
            let b22 = _mtxRight.data[2 * 3 + 2];
            let mtxResult = new Matrix3x3;
            mtxResult.data.set([
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ]);
            return mtxResult;
        }
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation() {
            if (!this.vectors.translation)
                this.vectors.translation = new FudgeCore.Vector2(this.data[6], this.data[7]);
            return this.vectors.translation.copy;
        }
        set translation(_translation) {
            this.data.set(_translation.get(), 12);
            // no full cache reset required
            this.vectors.translation = _translation;
            this.mutator = null;
        }
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngles();
            return this.vectors.rotation;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
            this.resetCache();
        }
        /**
         * - get: a copy of the calculated scale vector
         * - set: effect the matrix
         */
        get scaling() {
            if (!this.vectors.scaling)
                this.vectors.scaling = new FudgeCore.Vector2(Math.hypot(this.data[0], this.data[1]), Math.hypot(this.data[3], this.data[4]));
            return this.vectors.scaling.copy;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
            this.resetCache();
        }
        /**
         * Return a copy of this
         */
        get copy() {
            let mtxCopy = FudgeCore.Recycler.get(Matrix3x3);
            mtxCopy.set(this);
            return mtxCopy;
        }
        //#region Translation
        /**
         * Add a translation by the given vector to this matrix
         */
        translate(_by) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.TRANSLATION(_by));
            // TODO: possible optimization, translation may alter mutator instead of deleting it.
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        /**
         * Add a translation along the x-Axis by the given amount to this matrix
         */
        translateX(_x) {
            this.data[6] += _x;
            this.mutator = null;
            this.vectors.translation = null;
        }
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateY(_y) {
            this.data[7] += _y;
            this.mutator = null;
            this.vectors.translation = null;
        }
        //#endregion
        //#region Scaling
        /**
         * Add a scaling by the given vector to this matrix
         */
        scale(_by) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.SCALING(_by));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        /**
         * Add a scaling along the x-Axis by the given amount to this matrix
         */
        scaleX(_by) {
            let vector = FudgeCore.Recycler.borrow(FudgeCore.Vector2);
            vector.set(_by, 1);
            this.scale(vector);
        }
        /**
         * Add a scaling along the y-Axis by the given amount to this matrix
         */
        scaleY(_by) {
            let vector = FudgeCore.Recycler.borrow(FudgeCore.Vector2);
            vector.set(1, _by);
            this.scale(vector);
        }
        //#endregion
        //#region Rotation
        /**
         * Adds a rotation around the z-Axis to this matrix
         */
        rotate(_angleInDegrees) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.ROTATION(_angleInDegrees));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        //#endregion
        //#region Transformation
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_mtxRight) {
            this.set(Matrix3x3.MULTIPLICATION(this, _mtxRight));
            this.mutator = null;
        }
        //#endregion
        //#region Transfer
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngles() {
            let scaling = this.scaling;
            let s0 = this.data[0] / scaling.x;
            let s1 = this.data[1] / scaling.x;
            let s3 = this.data[3] / scaling.y;
            let s4 = this.data[4] / scaling.y;
            let xSkew = Math.atan2(-s3, s4);
            let ySkew = Math.atan2(s0, s1);
            let sy = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y
            let rotation;
            if (!(sy > 1e-6))
                rotation = ySkew;
            else
                rotation = xSkew;
            rotation *= 180 / Math.PI;
            return rotation;
        }
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_mtxTo) {
            // this.data = _to.get();
            this.data.set(_mtxTo.data);
            this.resetCache();
        }
        toString() {
            return `ƒ.Matrix3x3(translation: ${this.translation.toString()}, rotation: ${this.rotation.toString()}, scaling: ${this.scaling.toString()}`;
        }
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get() {
            return new Float32Array(this.data);
        }
        serialize() {
            // this.getMutator();
            let serialization = {
                translation: this.translation.serialize(),
                rotation: this.rotation,
                scaling: this.scaling.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            let mutator = {
                translation: await this.translation.deserialize(_serialization.translation),
                rotation: _serialization.rotation,
                scaling: await this.scaling.deserialize(_serialization.scaling)
            };
            this.mutate(mutator);
            return this;
        }
        getMutator() {
            if (this.mutator)
                return this.mutator;
            let mutator = {
                translation: this.translation.getMutator(),
                rotation: this.rotation,
                scaling: this.scaling.getMutator()
            };
            // cache mutator
            this.mutator = mutator;
            return mutator;
        }
        async mutate(_mutator) {
            let oldTranslation = this.translation;
            let oldRotation = this.rotation;
            let oldScaling = this.scaling;
            let newTranslation = _mutator["translation"];
            let newRotation = _mutator["rotation"];
            let newScaling = _mutator["scaling"];
            let vectors = { translation: oldTranslation, rotation: oldRotation, scaling: oldScaling };
            if (newTranslation) {
                vectors.translation = new FudgeCore.Vector2(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y);
            }
            vectors.rotation = (newRotation == undefined) ? oldRotation : newRotation;
            if (newScaling) {
                vectors.scaling = new FudgeCore.Vector2(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y);
            }
            // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
            let mtxResult = Matrix3x3.IDENTITY();
            if (vectors.translation)
                mtxResult.translate(vectors.translation);
            if (vectors.rotation) {
                mtxResult.rotate(vectors.rotation);
            }
            if (vectors.scaling)
                mtxResult.scale(vectors.scaling);
            this.set(mtxResult);
            this.vectors = vectors;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            if (_mutator.translation)
                types.translation = "Vector2";
            if (_mutator.rotation != undefined)
                types.rotation = "number";
            if (_mutator.scaling)
                types.scaling = "Vector2";
            return types;
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.vectors = { translation: null, rotation: null, scaling: null };
            this.mutator = null;
        }
    }
    FudgeCore.Matrix3x3 = Matrix3x3;
    //#endregion
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Matrix3x3.js.map