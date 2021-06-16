"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores a 4x4 transformation matrix and provides operations for it.
     * ```plaintext
     * [ 0, 1, 2, 3 ] ← row vector x
     * [ 4, 5, 6, 7 ] ← row vector y
     * [ 8, 9,10,11 ] ← row vector z
     * [12,13,14,15 ] ← translation
     *            ↑  homogeneous column
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends FudgeCore.Mutable {
        constructor() {
            super();
            this.data = new Float32Array(16); // The data of the matrix.
            this.mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
            this.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            this.resetCache();
        }
        //#region STATICS
        /**
         * Retrieve a new identity matrix
         */
        static IDENTITY() {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Constructs a new matrix according to the translation, rotation and scaling vectors given
         */
        static CONSTRUCTION(_vectors) {
            let result = Matrix4x4.IDENTITY();
            result.mutate(_vectors);
            return result;
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _mtxLeft The matrix to multiply.
         * @param _mtxRight The matrix to multiply by.
         */
        static MULTIPLICATION(_mtxLeft, _mtxRight) {
            let a = _mtxLeft.data;
            let b = _mtxRight.data;
            // let matrix: Matrix4x4 = new Matrix4x4();
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let a00 = a[0 * 4 + 0];
            let a01 = a[0 * 4 + 1];
            let a02 = a[0 * 4 + 2];
            let a03 = a[0 * 4 + 3];
            let a10 = a[1 * 4 + 0];
            let a11 = a[1 * 4 + 1];
            let a12 = a[1 * 4 + 2];
            let a13 = a[1 * 4 + 3];
            let a20 = a[2 * 4 + 0];
            let a21 = a[2 * 4 + 1];
            let a22 = a[2 * 4 + 2];
            let a23 = a[2 * 4 + 3];
            let a30 = a[3 * 4 + 0];
            let a31 = a[3 * 4 + 1];
            let a32 = a[3 * 4 + 2];
            let a33 = a[3 * 4 + 3];
            let b00 = b[0 * 4 + 0];
            let b01 = b[0 * 4 + 1];
            let b02 = b[0 * 4 + 2];
            let b03 = b[0 * 4 + 3];
            let b10 = b[1 * 4 + 0];
            let b11 = b[1 * 4 + 1];
            let b12 = b[1 * 4 + 2];
            let b13 = b[1 * 4 + 3];
            let b20 = b[2 * 4 + 0];
            let b21 = b[2 * 4 + 1];
            let b22 = b[2 * 4 + 2];
            let b23 = b[2 * 4 + 3];
            let b30 = b[3 * 4 + 0];
            let b31 = b[3 * 4 + 1];
            let b32 = b[3 * 4 + 2];
            let b33 = b[3 * 4 + 3];
            mtxResult.data.set([
                b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
                b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
                b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
                b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            ]);
            return mtxResult;
        }
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _mtx The matrix to compute the inverse of.
         */
        static INVERSION(_mtx) {
            let m = _mtx.data;
            let m00 = m[0 * 4 + 0];
            let m01 = m[0 * 4 + 1];
            let m02 = m[0 * 4 + 2];
            let m03 = m[0 * 4 + 3];
            let m10 = m[1 * 4 + 0];
            let m11 = m[1 * 4 + 1];
            let m12 = m[1 * 4 + 2];
            let m13 = m[1 * 4 + 3];
            let m20 = m[2 * 4 + 0];
            let m21 = m[2 * 4 + 1];
            let m22 = m[2 * 4 + 2];
            let m23 = m[2 * 4 + 3];
            let m30 = m[3 * 4 + 0];
            let m31 = m[3 * 4 + 1];
            let m32 = m[3 * 4 + 2];
            let m33 = m[3 * 4 + 3];
            let tmp0 = m22 * m33;
            let tmp1 = m32 * m23;
            let tmp2 = m12 * m33;
            let tmp3 = m32 * m13;
            let tmp4 = m12 * m23;
            let tmp5 = m22 * m13;
            let tmp6 = m02 * m33;
            let tmp7 = m32 * m03;
            let tmp8 = m02 * m23;
            let tmp9 = m22 * m03;
            let tmp10 = m02 * m13;
            let tmp11 = m12 * m03;
            let tmp12 = m20 * m31;
            let tmp13 = m30 * m21;
            let tmp14 = m10 * m31;
            let tmp15 = m30 * m11;
            let tmp16 = m10 * m21;
            let tmp17 = m20 * m11;
            let tmp18 = m00 * m31;
            let tmp19 = m30 * m01;
            let tmp20 = m00 * m21;
            let tmp21 = m20 * m01;
            let tmp22 = m00 * m11;
            let tmp23 = m10 * m01;
            let t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
                (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
            let t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
                (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
            let t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
                (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
            let t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
                (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
            let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
                d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
                d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
                d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
                d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
                d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
                d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
                d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
                d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
                d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
                d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)) // [15]
            ]);
            return mtxResult;
        }
        /**
         * Computes and returns a matrix with the given translation, its z-axis pointing directly at the given target,
         * and a minimal angle between its y-axis and the given up-Vector, respetively calculating yaw and pitch.
         */
        static LOOK_AT(_translation, _target, _up = FudgeCore.Vector3.Y()) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_target, _translation);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            let yAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            mtxResult.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _translation.x,
                _translation.y,
                _translation.z,
                1
            ]);
            return mtxResult;
        }
        /**
         * Computes and returns a matrix with the given translation, its y-axis matching the given up-vector
         * and its z-axis facing towards the given target at a minimal angle, respetively calculating yaw only.
         */
        static SHOW_TO(_translation, _target, _up = FudgeCore.Vector3.Y()) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_target, _translation);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            // let yAxis: Vector3 = Vector3.NORMALIZATION(Vector3.CROSS(zAxis, xAxis));
            zAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(xAxis, _up));
            mtxResult.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                _up.x, _up.y, _up.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _translation.x,
                _translation.y,
                _translation.z,
                1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _translate.x, _translate.y, _translate.z, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_X(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         */
        static ROTATION_Y(_angleInDegrees) {
            let mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_Z(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                _scalar.x, 0, 0, 0,
                0, _scalar.y, 0, 0,
                0, 0, _scalar.z, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        /**
         * Returns a representation of the given matrix relative to the given base.
         * If known, pass the inverse of the base to avoid unneccesary calculation
         */
        static RELATIVE(_mtx, _mtxBase, _mtxInverse) {
            let mtxResult = _mtxInverse ? _mtxInverse : Matrix4x4.INVERSION(_mtxBase);
            mtxResult = Matrix4x4.MULTIPLICATION(mtxResult, _mtx);
            return mtxResult;
        }
        //#endregion
        //#region PROJECTIONS
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace border on the z-axis.
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        static PROJECTION_CENTRAL(_aspect, _fieldOfViewInDegrees, _near, _far, _direction) {
            //TODO: camera looks down negative z-direction, should be positive
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv = 1.0 / (_near - _far);
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                f, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            if (_direction == FudgeCore.FIELD_OF_VIEW.DIAGONAL) {
                _aspect = Math.sqrt(_aspect);
                mtxResult.data[0] = f / _aspect;
                mtxResult.data[5] = f * _aspect;
            }
            else if (_direction == FudgeCore.FIELD_OF_VIEW.VERTICAL)
                mtxResult.data[0] = f / _aspect;
            else //FOV_DIRECTION.HORIZONTAL
                mtxResult.data[5] = f * _aspect;
            // HACK: matrix should look in positive z-direction, preferably the matrix should be calculated like that right away
            mtxResult.rotateY(180);
            return mtxResult;
        }
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return mtxResult;
        }
        //#endregion
        //#region  Accessors
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        set translation(_translation) {
            this.data.set(_translation.get(), 12);
            // no full cache reset required
            this.vectors.translation = _translation.copy;
            this.mutator = null;
        }
        get translation() {
            if (!this.vectors.translation) {
                this.vectors.translation = FudgeCore.Recycler.get(FudgeCore.Vector3);
                this.vectors.translation.set(this.data[12], this.data[13], this.data[14]);
            }
            return this.vectors.translation.copy;
        }
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngles();
            return this.vectors.rotation.copy;
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
            if (!this.vectors.scaling) {
                this.vectors.scaling = FudgeCore.Recycler.get(FudgeCore.Vector3);
                this.vectors.scaling.set(Math.hypot(this.data[0], this.data[1], this.data[2]), Math.hypot(this.data[4], this.data[5], this.data[6]), Math.hypot(this.data[8], this.data[9], this.data[10]));
            }
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
            let mtxCopy = FudgeCore.Recycler.get(Matrix4x4);
            mtxCopy.set(this);
            return mtxCopy;
        }
        //#endregion
        //#region Rotation
        /**
         * Rotate this matrix by given vector in the order Z, Y, X. Right hand rotation is used, thumb points in axis direction, fingers curling indicate rotation
         * The rotation is appended to already applied transforms, thus multiplied from the right. Set _fromLeft to true to switch and put it in front.
         */
        rotate(_by, _fromLeft = false) {
            this.rotateZ(_by.z, _fromLeft);
            this.rotateY(_by.y, _fromLeft);
            this.rotateX(_by.x, _fromLeft);
        }
        /**
         * Adds a rotation around the x-axis to this matrix
         */
        rotateX(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_X(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        /**
         * Adds a rotation around the y-axis to this matrix
         */
        rotateY(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_Y(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        /**
         * Adds a rotation around the z-axis to this matrix
         */
        rotateZ(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_Z(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        /**
         * Adjusts the rotation of this matrix to point the z-axis directly at the given target and tilts it to accord with the given up vector,
         * respectively calculating yaw and pitch. If no up vector is given, the previous up-vector is used.
         * When _preserveScaling is false, a rotated identity matrix is the result.
         */
        lookAt(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            const mtxResult = Matrix4x4.LOOK_AT(this.translation, _target, _up);
            if (_preserveScaling)
                mtxResult.scale(this.scaling);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        // TODO: testing lookat that really just rotates the matrix rather than creating a new one
        lookAtRotate(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            let scaling = this.scaling;
            let difference = FudgeCore.Vector3.DIFFERENCE(_target, this.translation);
            difference.normalize();
            let cos = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getZ()), difference);
            let sin = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getX()), difference);
            // console.log(sin, cos);
            let mtxRotation = FudgeCore.Recycler.borrow(Matrix4x4);
            mtxRotation.data.set([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            this.multiply(mtxRotation, false);
            cos = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getZ()), difference);
            sin = -FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getY()), difference);
            // console.log(sin, cos);
            mtxRotation.data.set([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            this.multiply(mtxRotation, false);
            this.scaling = scaling;
        }
        /**
         * Adjusts the rotation of this matrix to match its y-axis with the given up-vector and facing its z-axis toward the given target at minimal angle,
         * respectively calculating yaw only. If no up vector is given, the previous up-vector is used.
         * When _preserveScaling is false, a rotated identity matrix is the result.
         */
        showTo(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            const mtxResult = Matrix4x4.SHOW_TO(this.translation, _target, _up);
            if (_preserveScaling)
                mtxResult.scale(this.scaling);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        //#endregion
        //#region Translation
        /**
         * Add a translation by the given vector to this matrix.
         * If _local is true, translation occurs according to the current rotation and scaling of this matrix,
         * according to the parent otherwise.
         */
        translate(_by, _local = true) {
            if (_local) {
                let mtxTranslation = Matrix4x4.TRANSLATION(_by);
                this.multiply(mtxTranslation);
                FudgeCore.Recycler.store(mtxTranslation);
            }
            else {
                this.data[12] += _by.x;
                this.data[13] += _by.y;
                this.data[14] += _by.z;
                this.mutator = null;
                if (this.vectors.translation)
                    FudgeCore.Recycler.store(this.vectors.translation);
                this.vectors.translation = null;
            }
            // const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.TRANSLATION(_by));
            // // TODO: possible optimization, translation may alter mutator instead of deleting it.
            // this.set(matrix);
            // Recycler.store(matrix);
        }
        /**
         * Add a translation along the x-axis by the given amount to this matrix
         */
        translateX(_x, _local = true) {
            let translation = FudgeCore.Vector3.X(_x);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        /**
         * Add a translation along the y-axis by the given amount to this matrix
         */
        translateY(_y, _local = true) {
            let translation = FudgeCore.Vector3.Y(_y);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        /**
         * Add a translation along the z-axis by the given amount to this matrix
         */
        translateZ(_z, _local = true) {
            let translation = FudgeCore.Vector3.Z(_z);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        //#endregion
        //#region Scaling
        /**
         * Add a scaling by the given vector to this matrix
         */
        scale(_by) {
            const mtxResult = Matrix4x4.MULTIPLICATION(this, Matrix4x4.SCALING(_by));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        /**
         * Add a scaling along the x-axis by the given amount to this matrix
         */
        scaleX(_by) {
            let vector = FudgeCore.Recycler.borrow(FudgeCore.Vector3);
            vector.set(_by, 1, 1);
            this.scale(vector);
        }
        /**
         * Add a scaling along the y-axis by the given amount to this matrix
         */
        scaleY(_by) {
            let vector = FudgeCore.Recycler.borrow(FudgeCore.Vector3);
            vector.set(1, _by, 1);
            this.scale(vector);
        }
        /**
         * Add a scaling along the z-axis by the given amount to this matrix
         */
        scaleZ(_by) {
            let vector = FudgeCore.Recycler.borrow(FudgeCore.Vector3);
            vector.set(1, 1, _by);
            this.scale(vector);
        }
        //#endregion
        //#region Transformation
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_matrix, _fromLeft = false) {
            const mtxResult = _fromLeft ? Matrix4x4.MULTIPLICATION(_matrix, this) : Matrix4x4.MULTIPLICATION(this, _matrix);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
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
            let s2 = this.data[2] / scaling.x;
            let s6 = this.data[6] / scaling.y;
            let s10 = this.data[10] / scaling.z;
            let sy = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y
            let singular = sy < 1e-6; // If
            let x1, y1, z1;
            let x2, y2, z2;
            if (!singular) {
                x1 = Math.atan2(s6, s10);
                y1 = Math.atan2(-s2, sy);
                z1 = Math.atan2(s1, s0);
                x2 = Math.atan2(-s6, -s10);
                y2 = Math.atan2(-s2, -sy);
                z2 = Math.atan2(-s1, -s0);
                if (Math.abs(x2) + Math.abs(y2) + Math.abs(z2) < Math.abs(x1) + Math.abs(y1) + Math.abs(z1)) {
                    x1 = x2;
                    y1 = y2;
                    z1 = z2;
                }
            }
            else {
                x1 = Math.atan2(-this.data[9] / scaling.z, this.data[5] / scaling.y);
                y1 = Math.atan2(-this.data[2] / scaling.x, sy);
                z1 = 0;
            }
            let rotation = FudgeCore.Recycler.get(FudgeCore.Vector3);
            rotation.set(x1, y1, z1);
            rotation.scale(180 / Math.PI);
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
            return `ƒ.Matrix4x4(translation: ${this.translation.toString()}, rotation: ${this.rotation.toString()}, scaling: ${this.scaling.toString()}`;
        }
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get() {
            return new Float32Array(this.data);
        }
        /**
         * Return cardinal x-axis
         */
        getX() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[0], this.data[1], this.data[2]);
            return result;
        }
        /**
         * Return cardinal y-axis
         */
        getY() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[4], this.data[5], this.data[6]);
            return result;
        }
        /**
         * Return cardinal z-axis
         */
        getZ() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[8], this.data[9], this.data[10]);
            return result;
        }
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapXY() {
            let temp = [this.data[0], this.data[1], this.data[2]]; // store x-axis
            this.data.set([this.data[4], this.data[5], this.data[6]], 0); // overwrite x-axis with y-axis
            this.data.set(temp, 4); // overwrite Y with temp
            this.data.set([-this.data[8], -this.data[9], -this.data[10]], 8); // reverse z-axis
        }
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapXZ() {
            let temp = [this.data[0], this.data[1], this.data[2]]; // store x-axis
            this.data.set([this.data[8], this.data[9], this.data[10]], 0); // overwrite x-axis with z-axis
            this.data.set(temp, 8); // overwrite Z with temp
            this.data.set([-this.data[4], -this.data[5], -this.data[6]], 4); // reverse y-axis
        }
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapYZ() {
            let temp = [this.data[4], this.data[5], this.data[6]]; // store y-axis
            this.data.set([this.data[8], this.data[9], this.data[10]], 4); // overwrite y-axis with z-axis
            this.data.set(temp, 8); // overwrite Z with temp
            this.data.set([-this.data[0], -this.data[1], -this.data[2]], 0); // reverse x-axis
        }
        getTranslationTo(_mtxTarget) {
            let difference = FudgeCore.Recycler.get(FudgeCore.Vector3);
            difference.set(_mtxTarget.data[12] - this.data[12], _mtxTarget.data[13] - this.data[13], _mtxTarget.data[14] - this.data[14]);
            return difference;
        }
        serialize() {
            // this.getMutator();
            let serialization = {
                translation: this.translation.serialize(),
                rotation: this.rotation.serialize(),
                scaling: this.scaling.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            let mutator = {
                translation: await this.translation.deserialize(_serialization.translation),
                rotation: await this.rotation.deserialize(_serialization.rotation),
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
                rotation: this.rotation.getMutator(),
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
                vectors.translation = FudgeCore.Recycler.get(FudgeCore.Vector3);
                vectors.translation.set(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y, newTranslation.z != undefined ? newTranslation.z : oldTranslation.z);
            }
            if (newRotation) {
                vectors.rotation = FudgeCore.Recycler.get(FudgeCore.Vector3);
                vectors.rotation.set(newRotation.x != undefined ? newRotation.x : oldRotation.x, newRotation.y != undefined ? newRotation.y : oldRotation.y, newRotation.z != undefined ? newRotation.z : oldRotation.z);
            }
            if (newScaling) {
                vectors.scaling = FudgeCore.Recycler.get(FudgeCore.Vector3);
                vectors.scaling.set(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y, newScaling.z != undefined ? newScaling.z : oldScaling.z);
            }
            // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
            let mtxResult = Matrix4x4.IDENTITY();
            if (vectors.translation)
                mtxResult.translate(vectors.translation);
            if (vectors.rotation) {
                mtxResult.rotateZ(vectors.rotation.z);
                mtxResult.rotateY(vectors.rotation.y);
                mtxResult.rotateX(vectors.rotation.x);
            }
            if (vectors.scaling)
                mtxResult.scale(vectors.scaling);
            this.set(mtxResult);
            this.vectors = vectors;
            FudgeCore.Recycler.store(mtxResult);
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            if (_mutator.translation)
                types.translation = "Vector3";
            if (_mutator.rotation)
                types.rotation = "Vector3";
            if (_mutator.scaling)
                types.scaling = "Vector3";
            return types;
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.vectors = { translation: null, rotation: null, scaling: null };
            this.mutator = null;
        }
    }
    FudgeCore.Matrix4x4 = Matrix4x4;
    //#endregion
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Matrix4x4.js.map