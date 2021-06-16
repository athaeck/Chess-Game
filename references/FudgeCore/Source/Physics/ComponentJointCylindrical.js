"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
       * A physical connection between two bodies with a defined axe of rotation and rotation. Two Degrees of Freedom in the defined axis.
       * Two RigidBodies need to be defined to use it. A motor can be defined for rotation and translation, along with spring settings.
       *
       * ```plaintext
       *          JointHolder - attachedRigidbody
       *                    ----------  ↑
       *                    |        |  |
       *          <---------|        |--------------> connectedRigidbody, sliding on one Axis, 1st Degree of Freedom
       *                    |        |  |
       *                    ----------  ↓ rotating on one Axis, 2nd Degree of Freedom
       * ```
       *
       * @author Marko Fehrenbach, HFU 2020
       */
    class ComponentJointCylindrical extends FudgeCore.ComponentJoint {
        /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
        constructor(_attachedRigidbody = null, _connectedRigidbody = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_attachedRigidbody, _connectedRigidbody);
            //Internal Variables
            this.jointSpringDampingRatio = 0;
            this.jointSpringFrequency = 0;
            this.jointRotationSpringDampingRatio = 0;
            this.jointRotationSpringFrequency = 0;
            this.jointMotorLimitUpper = 10;
            this.jointMotorLimitLower = -10;
            this.jointMotorForce = 0;
            this.jointMotorSpeed = 0;
            this.jointRotationMotorLimitUpper = 360;
            this.jointRotationMotorLimitLower = 0;
            this.jointRotationMotorTorque = 0;
            this.jointRotationMotorSpeed = 0;
            this.jointBreakForce = 0;
            this.jointBreakTorque = 0;
            this.config = new OIMO.CylindricalJointConfig();
            this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
            this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
            /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
              actual constraint ain't existent until the game starts
            */
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.dirtyStatus);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.superRemove);
        }
        //#region Get/Set transfor of fudge properties to the physics engine
        /**
         * The axis connecting the the two [[Node]]s e.g. Vector3(0,1,0) to have a upward connection.
         *  When changed after initialization the joint needs to be reconnected.
         */
        get axis() {
            return new FudgeCore.Vector3(this.jointAxis.x, this.jointAxis.y, this.jointAxis.z);
        }
        set axis(_value) {
            this.jointAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The exact position where the two [[Node]]s are connected. When changed after initialization the joint needs to be reconnected.
         */
        get anchor() {
            return new FudgeCore.Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
        }
        set anchor(_value) {
            this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDamping() {
            return this.jointSpringDampingRatio;
        }
        set springDamping(_value) {
            this.jointSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalSpringDamper().dampingRatio = this.jointSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequency() {
            return this.jointSpringFrequency;
        }
        set springFrequency(_value) {
            this.jointSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalSpringDamper().frequency = this.jointSpringFrequency;
        }
        /**
        * The damping of the spring. 1 equals completly damped. Influencing TORQUE / ROTATION
        */
        get rotationSpringDamping() {
            return this.jointRotationSpringDampingRatio;
        }
        set rotationSpringDamping(_value) {
            this.jointRotationSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalSpringDamper().dampingRatio = this.jointRotationSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. Influencing TORQUE / ROTATION
        */
        get rotationSpringFrequency() {
            return this.jointRotationSpringFrequency;
        }
        set rotationSpringFrequency(_value) {
            this.jointRotationSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalSpringDamper().frequency = this.jointRotationSpringFrequency;
        }
        /**
         * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default)
        */
        get breakForce() {
            return this.jointBreakForce;
        }
        set breakForce(_value) {
            this.jointBreakForce = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setBreakForce(this.jointBreakForce);
        }
        /**
           * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default)
          */
        get breakTorque() {
            return this.jointBreakTorque;
        }
        set breakTorque(_value) {
            this.jointBreakTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setBreakTorque(this.jointBreakTorque);
        }
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        get rotationalMotorLimitUpper() {
            return this.jointRotationMotorLimitUpper * 180 / Math.PI;
        }
        set rotationalMotorLimitUpper(_value) {
            this.jointRotationMotorLimitUpper = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalLimitMotor().upperLimit = this.jointRotationMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get rotationalMotorLimitLower() {
            return this.jointRotationMotorLimitLower * 180 / Math.PI;
        }
        set rotationalMotorLimitLower(_value) {
            this.jointRotationMotorLimitLower = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalLimitMotor().lowerLimit = this.jointRotationMotorLimitLower;
        }
        /**
          * The target rotational speed of the motor in m/s.
         */
        get rotationalMotorSpeed() {
            return this.jointRotationMotorSpeed;
        }
        set rotationalMotorSpeed(_value) {
            this.jointRotationMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalLimitMotor().motorSpeed = this.jointRotationMotorSpeed;
        }
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get rotationalMotorTorque() {
            return this.jointRotationMotorTorque;
        }
        set rotationalMotorTorque(_value) {
            this.jointRotationMotorTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getRotationalLimitMotor().motorTorque = this.jointRotationMotorTorque;
        }
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get translationMotorLimitUpper() {
            return this.jointMotorLimitUpper;
        }
        set translationMotorLimitUpper(_value) {
            this.jointMotorLimitUpper = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalLimitMotor().upperLimit = this.jointMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get translationMotorLimitLower() {
            return this.jointMotorLimitUpper;
        }
        set translationMotorLimitLower(_value) {
            this.jointMotorLimitLower = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalLimitMotor().lowerLimit = this.jointMotorLimitLower;
        }
        /**
          * The target speed of the motor in m/s.
         */
        get translationMotorSpeed() {
            return this.jointMotorSpeed;
        }
        set translationMotorSpeed(_value) {
            this.jointMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalLimitMotor().motorSpeed = this.jointMotorSpeed;
        }
        /**
          * The maximum motor force in Newton. force <= 0 equals disabled.
         */
        get translationMotorForce() {
            return this.jointMotorForce;
        }
        set translationMotorForce(_value) {
            this.jointMotorForce = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTranslationalLimitMotor().motorForce = this.jointMotorForce;
        }
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
         */
        get internalCollision() {
            return this.jointInternalCollision;
        }
        set internalCollision(_value) {
            this.jointInternalCollision = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setAllowCollision(this.jointInternalCollision);
        }
        //#endregion
        /**
         * Initializing and connecting the two rigidbodies with the configured joint properties
         * is automatically called by the physics system. No user interaction needed.
         */
        connect() {
            if (this.connected == false) {
                this.constructJoint();
                this.connected = true;
                this.superAdd();
            }
        }
        /**
         * Disconnecting the two rigidbodies and removing them from the physics system,
         * is automatically called by the physics system. No user interaction needed.
         */
        disconnect() {
            if (this.connected == true) {
                this.superRemove();
                this.connected = false;
            }
        }
        /**
         * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
         * Only to be used when functionality that is not added within Fudge is needed.
        */
        getOimoJoint() {
            return this.oimoJoint;
        }
        //#region Saving/Loading
        serialize() {
            let serialization = {
                attID: super.idAttachedRB,
                conID: super.idConnectedRB,
                axis: this.axis,
                anchor: this.anchor,
                internalCollision: this.jointInternalCollision,
                springDamping: this.jointSpringDampingRatio,
                springFrequency: this.jointSpringFrequency,
                breakForce: this.jointBreakForce,
                breakTorque: this.jointBreakTorque,
                motorLimitUpper: this.jointMotorLimitUpper,
                motorLimitLower: this.jointMotorLimitLower,
                motorSpeed: this.jointMotorSpeed,
                motorForce: this.jointMotorForce,
                springDampingRotation: this.jointRotationSpringDampingRatio,
                springFrequencyRotation: this.jointRotationSpringFrequency,
                upperLimitRotation: this.jointRotationMotorLimitUpper,
                lowerLimitRotation: this.jointRotationMotorLimitLower,
                motorSpeedRotation: this.jointRotationMotorSpeed,
                motorTorque: this.jointRotationMotorTorque,
                [super.constructor.name]: super.baseSerialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            super.idAttachedRB = _serialization.attID;
            super.idConnectedRB = _serialization.conID;
            if (_serialization.attID != null && _serialization.conID != null)
                super.setBodiesFromLoadedIDs();
            this.axis = _serialization.axis != null ? _serialization.axis : this.jointAxis;
            this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
            this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
            this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
            this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
            this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
            this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
            this.translationMotorLimitUpper = _serialization.upperLimitTranslation != null ? _serialization.upperLimitTranslation : this.jointMotorLimitUpper;
            this.translationMotorLimitLower = _serialization.lowerLimitTranslation != null ? _serialization.lowerLimitTranslation : this.jointMotorLimitLower;
            this.translationMotorSpeed = _serialization.motorSpeedTranslation != null ? _serialization.motorSpeedTranslation : this.jointMotorSpeed;
            this.jointMotorForce = _serialization.motorForceTranslation != null ? _serialization.motorForceTranslation : this.jointMotorForce;
            this.rotationSpringDamping = _serialization.springDampingRotation != null ? _serialization.springDampingRotation : this.jointRotationSpringDampingRatio;
            this.rotationSpringFrequency = _serialization.springFrequencyRotation != null ? _serialization.springFrequencyRotation : this.jointRotationSpringFrequency;
            this.rotationalMotorLimitUpper = _serialization.upperLimitRotation != null ? _serialization.upperLimitRotation : this.jointRotationMotorLimitUpper;
            this.rotationalMotorLimitLower = _serialization.lowerLimitRotation != null ? _serialization.lowerLimitRotation : this.jointRotationMotorLimitLower;
            this.rotationalMotorSpeed = _serialization.motorSpeedRotation != null ? _serialization.motorSpeedRotation : this.jointRotationMotorSpeed;
            this.rotationalMotorTorque = _serialization.motorTorque != null ? _serialization.motorTorque : this.jointRotationMotorTorque;
            super.baseDeserialize(_serialization);
            return this;
        }
        //#endregion
        dirtyStatus() {
            FudgeCore.Physics.world.changeJointStatus(this);
        }
        constructJoint() {
            this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
            this.rotationSpringDamper = new OIMO.SpringDamper().setSpring(this.jointRotationSpringFrequency, this.rotationSpringDamping);
            this.translationMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper);
            this.translationMotor.setMotor(this.jointMotorSpeed, this.jointMotorForce);
            this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointRotationMotorLimitLower, this.jointRotationMotorLimitUpper);
            this.rotationalMotor.setMotor(this.jointRotationMotorSpeed, this.jointRotationMotorTorque);
            this.config = new OIMO.CylindricalJointConfig();
            let attachedRBPos = this.attachedRigidbody.getContainer().mtxWorld.translation;
            let worldAnchor = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
            this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis);
            this.config.translationalSpringDamper = this.springDamper;
            this.config.translationalLimitMotor = this.translationMotor;
            this.config.rotationalLimitMotor = this.rotationalMotor;
            this.config.rotationalSpringDamper = this.rotationSpringDamper;
            var j = new OIMO.CylindricalJoint(this.config);
            j.setBreakForce(this.breakForce);
            j.setBreakTorque(this.breakTorque);
            j.setAllowCollision(this.jointInternalCollision);
            this.oimoJoint = j;
        }
        superAdd() {
            this.addConstraintToWorld(this);
        }
        superRemove() {
            this.removeConstraintFromWorld(this);
        }
    }
    ComponentJointCylindrical.iSubclass = FudgeCore.Component.registerSubclass(ComponentJointCylindrical);
    FudgeCore.ComponentJointCylindrical = ComponentJointCylindrical;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentJointCylindrical.js.map