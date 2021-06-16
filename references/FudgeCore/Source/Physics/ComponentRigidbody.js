"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
       * Acts as the physical representation of the [[Node]] it's attached to.
       * It's the connection between the Fudge Rendered world and the Physics world.
       * For the physics to correctly get the transformations rotations need to be applied with from left = true.
       * Or rotations need to happen before scaling.
       * @author Marko Fehrenbach, HFU 2020
       */
    class ComponentRigidbody extends FudgeCore.Component {
        /** Creating a new rigidbody with a weight in kg, a physics type (default = dynamic), a collider type what physical form has the collider, to what group does it belong, is there a transform Matrix that should be used, and is the collider defined as a group of points that represent a convex mesh. */
        constructor(_mass = 1, _type = FudgeCore.PHYSICS_TYPE.DYNAMIC, _colliderType = FudgeCore.COLLIDER_TYPE.CUBE, _group = FudgeCore.Physics.settings.defaultCollisionGroup, _mtxTransform = null, _convexMesh = null) {
            super();
            /** The pivot of the physics itself. Default the pivot is identical to the transform. It's used like an offset. */
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            /** Vertices that build a convex mesh (form that is in itself closed). Needs to set in the construction of the rb if none of the standard colliders is used. */
            this.convexMesh = null;
            /** Collisions with rigidbodies happening to this body, can be used to build a custom onCollisionStay functionality. */
            this.collisions = new Array();
            /** Triggers that are currently triggering this body */
            this.triggers = new Array();
            /** Bodies that trigger this "trigger", only happening if this body is a trigger */
            this.bodiesInTrigger = new Array();
            /** ID to reference this specific ComponentRigidbody */
            this.id = 0;
            this.massData = new OIMO.MassData();
            this.rigidbodyInfo = new OIMO.RigidBodyConfig();
            this.rbType = FudgeCore.PHYSICS_TYPE.DYNAMIC;
            this.colType = FudgeCore.COLLIDER_TYPE.CUBE;
            this.colGroup = FudgeCore.PHYSICS_GROUP.DEFAULT;
            this.linDamping = 0.1;
            this.angDamping = 0.1;
            this.rotationalInfluenceFactor = FudgeCore.Vector3.ONE();
            this.gravityInfluenceFactor = 1;
            //Setting up all incoming values to be internal values
            this.convexMesh = _convexMesh;
            this.rbType = _type;
            this.collisionGroup = _group;
            this.colliderType = _colliderType;
            this.mass = _mass;
            this.bodyRestitution = FudgeCore.Physics.settings.defaultRestitution;
            this.bodyFriction = FudgeCore.Physics.settings.defaultFriction;
            this.colMask = FudgeCore.Physics.settings.defaultCollisionMask;
            //Create the actual rigidbody in the OimoPhysics Space
            this.createRigidbody(_mass, _type, this.colliderType, _mtxTransform, this.collisionGroup);
            this.id = FudgeCore.Physics.world.distributeBodyID();
            //Handling adding/removing the component
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.addRigidbodyToWorld);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.removeRigidbodyFromWorld);
        }
        /** The type of interaction between the physical world and the transform hierarchy world. DYNAMIC means the body ignores hierarchy and moves by physics. KINEMATIC it's
         * reacting to a [[Node]] that is using physics but can still be controlled by animation or transform. And STATIC means its immovable.
         */
        get physicsType() {
            return this.rbType;
        }
        set physicsType(_value) {
            this.rbType = _value;
            let oimoType;
            switch (this.rbType) {
                case FudgeCore.PHYSICS_TYPE.DYNAMIC:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
                case FudgeCore.PHYSICS_TYPE.STATIC:
                    oimoType = OIMO.RigidBodyType.STATIC;
                    break;
                case FudgeCore.PHYSICS_TYPE.KINEMATIC:
                    oimoType = OIMO.RigidBodyType.KINEMATIC;
                    break;
                default:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
            }
            this.rigidbody.setType(oimoType);
            this.rigidbody.setMassData(this.massData); //have to reset mass after changing the type, since Oimo is handling mass internally wrong when switching types
        }
        /** The shape that represents the [[Node]] in the physical world. Default is a Cube. */
        get colliderType() {
            return this.colType;
        }
        set colliderType(_value) {
            if (_value != this.colType && this.rigidbody != null)
                this.updateFromWorld();
            this.colType = _value;
        }
        /** The physics group this [[Node]] belongs to it's the default group normally which means it physically collides with every group besides trigger. */
        get collisionGroup() {
            return this.colGroup;
        }
        set collisionGroup(_value) {
            if (_value != FudgeCore.PHYSICS_GROUP.TRIGGER && this.colGroup == FudgeCore.PHYSICS_GROUP.TRIGGER) //Register/unregister triggers form the world
                FudgeCore.Physics.world.unregisterTrigger(this);
            if (_value == FudgeCore.PHYSICS_GROUP.TRIGGER)
                FudgeCore.Physics.world.registerTrigger(this);
            this.colGroup = _value;
            if (this.rigidbody != null)
                this.rigidbody.getShapeList().setCollisionGroup(this.colGroup);
        }
        /** The groups this object collides with. Groups must be writen in form of
         *  e.g. collisionMask = PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 and so on to collide with multiple groups. */
        get collisionMask() {
            return this.colMask;
        }
        set collisionMask(_value) {
            this.colMask = _value;
        }
        /**
       * Returns the physical weight of the [[Node]]
       */
        get mass() {
            return this.rigidbody.getMass();
        }
        /**
      * Setting the physical weight of the [[Node]] in kg
      */
        set mass(_value) {
            this.massData.mass = _value;
            if (this.getContainer() != null)
                if (this.rigidbody != null)
                    this.rigidbody.setMassData(this.massData);
        }
        /** Air reistance, when moving. A Body does slow down even on a surface without friction. */
        get linearDamping() {
            return this.rigidbody.getLinearDamping();
        }
        set linearDamping(_value) {
            this.linDamping = _value;
            this.rigidbody.setLinearDamping(_value);
        }
        /** Air resistance, when rotating. */
        get angularDamping() {
            return this.rigidbody.getAngularDamping();
        }
        set angularDamping(_value) {
            this.angDamping = _value;
            this.rigidbody.setAngularDamping(_value);
        }
        /** The factor this rigidbody reacts rotations that happen in the physical world. 0 to lock rotation this axis. */
        get rotationInfluenceFactor() {
            return this.rotationalInfluenceFactor;
        }
        set rotationInfluenceFactor(_influence) {
            this.rotationalInfluenceFactor = _influence;
            this.rigidbody.setRotationFactor(new OIMO.Vec3(this.rotationalInfluenceFactor.x, this.rotationalInfluenceFactor.y, this.rotationalInfluenceFactor.z));
        }
        /** The factor this rigidbody reacts to world gravity. Default = 1 e.g. 1*9.81 m/s. */
        get gravityScale() {
            return this.gravityInfluenceFactor;
        }
        set gravityScale(_influence) {
            this.gravityInfluenceFactor = _influence;
            if (this.rigidbody != null)
                this.rigidbody.setGravityScale(this.gravityInfluenceFactor);
        }
        /**
      * Get the friction of the rigidbody, which is the factor of sliding resistance of this rigidbody on surfaces
      */
        get friction() {
            return this.bodyFriction;
        }
        /**
       * Set the friction of the rigidbody, which is the factor of  sliding resistance of this rigidbody on surfaces
       */
        set friction(_friction) {
            this.bodyFriction = _friction;
            if (this.rigidbody.getShapeList() != null)
                this.rigidbody.getShapeList().setFriction(this.bodyFriction);
        }
        /**
      * Get the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
      */
        get restitution() {
            return this.bodyRestitution;
        }
        /**
       * Set the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
       */
        set restitution(_restitution) {
            this.bodyRestitution = _restitution;
            if (this.rigidbody.getShapeList() != null)
                this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
        }
        /**
        * Returns the rigidbody in the form the physics engine is using it, should not be used unless a functionality
        * is not provided through the FUDGE Integration.
        */
        getOimoRigidbody() {
            return this.rigidbody;
        }
        /** Rotating the rigidbody therefore changing it's rotation over time directly in physics. This way physics is changing instead of transform.
     *  But you are able to incremental changing it instead of a direct rotation.  Although it's always prefered to use forces in physics.
    */
        rotateBody(_rotationChange) {
            this.rigidbody.rotateXyz(new OIMO.Vec3(_rotationChange.x * Math.PI / 180, _rotationChange.y * Math.PI / 180, _rotationChange.z * Math.PI / 180));
        }
        /** Translating the rigidbody therefore changing it's place over time directly in physics. This way physics is changing instead of transform.
         *  But you are able to incremental changing it instead of a direct position. Although it's always prefered to use forces in physics. */
        translateBody(_translationChange) {
            this.rigidbody.translate(new OIMO.Vec3(_translationChange.x, _translationChange.y, _translationChange.z));
        }
        /**
       * Checking for Collision with other Colliders and dispatches a custom event with information about the collider.
       * Automatically called in the RenderManager, no interaction needed.
       */
        checkCollisionEvents() {
            let list = this.rigidbody.getContactLinkList(); //all physical contacts between colliding bodies on this rb
            let objHit; //collision consisting of 2 bodies, so Hit1/2
            let objHit2;
            let event; //The event that will be send and the informations added to it
            let normalImpulse = 0;
            let binormalImpulse = 0;
            let tangentImpulse = 0;
            let colPoint;
            //ADD NEW Collision - That just happened
            for (let i = 0; i < this.rigidbody.getNumContectLinks(); i++) {
                let collisionManifold = list.getContact().getManifold(); //Manifold = Additional informations about the contact
                objHit = list.getContact().getShape1().userData; //Userdata is used to transfer the ƒ.ComponentRigidbody, it's an empty OimoPhysics Variable
                //Only register the collision on the actual touch, not on "shadowCollide", to register in the moment of impulse calculation
                if (objHit == null || list.getContact().isTouching() == false) // only act if the collision is actual touching, so right at the moment when a impulse is happening, not when shapes overlap
                    return;
                objHit2 = list.getContact().getShape2().userData;
                if (objHit2 == null || list.getContact().isTouching() == false)
                    return;
                let points = collisionManifold.getPoints(); //All points in the collision where the two bodies are touching, used to calculate the full impact
                let normal = collisionManifold.getNormal();
                normalImpulse = 0;
                binormalImpulse = 0;
                tangentImpulse = 0;
                if (objHit.getOimoRigidbody() != this.getOimoRigidbody() && this.collisions.indexOf(objHit) == -1) { //Fire, if the hit object is not the Body itself but another and it's not already fired.
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints()); //THE point of collision is the first touching point (EXTENSION: could be the center of all touching points combined)
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((value) => {
                        normalImpulse += value.getNormalImpulse();
                        binormalImpulse += value.getBinormalImpulse();
                        tangentImpulse += value.getTangentImpulse();
                    });
                    this.collisions.push(objHit); //Tell the object that the event for this object does not need to be fired again
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision" /* COLLISION_ENTER */, objHit, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z)); //Building the actual event, with what object did collide and informations about it
                    this.dispatchEvent(event); //Sending the given event
                }
                if (objHit2 != this && this.collisions.indexOf(objHit2) == -1) { //Same as the above but for the case the SECOND hit object is not the body itself
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((value) => {
                        normalImpulse += value.getNormalImpulse();
                        binormalImpulse += value.getBinormalImpulse();
                        tangentImpulse += value.getTangentImpulse();
                    });
                    this.collisions.push(objHit2);
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision" /* COLLISION_ENTER */, objHit2, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                    this.dispatchEvent(event);
                }
                list = list.getNext(); //Start the same routine with the next collision in the list
            }
            //REMOVE OLD Collisions - That do not happen anymore
            this.collisions.forEach((value) => {
                let isColliding = false;
                list = this.rigidbody.getContactLinkList();
                for (let i = 0; i < this.rigidbody.getNumContectLinks(); i++) {
                    objHit = list.getContact().getShape1().userData;
                    objHit2 = list.getContact().getShape2().userData;
                    if (value == objHit || value == objHit2) { //If the given object in the collisions list is still one of the objHit the collision is not CollisionEXIT
                        isColliding = true;
                    }
                    list = list.getNext();
                }
                if (isColliding == false) { //The collision is exiting but was in the collision list, then EXIT Event needs to be fired
                    let index = this.collisions.indexOf(value); //Find object in the array
                    this.collisions.splice(index); //remove it from the array
                    event = new FudgeCore.EventPhysics("ColliderLeftCollision" /* COLLISION_EXIT */, value, 0, 0, 0);
                    this.dispatchEvent(event);
                }
            });
        }
        /**
          * Checking for Collision with Triggers with a overlapping test, dispatching a custom event with information about the trigger,
          * or triggered [[Node]]. Automatically called in the RenderManager, no interaction needed.
          */
        checkTriggerEvents() {
            let possibleTriggers = FudgeCore.Physics.world.getTriggerList(); //Get the array from the world that contains every trigger existing and check it with this body
            let event;
            //ADD - Similar to collision events but with overlapping instead of an actual collision
            possibleTriggers.forEach((value) => {
                let overlapping = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody()); //Check if the two colliders are overlapping
                if (overlapping && this.triggers.indexOf(value) == -1) {
                    this.triggers.push(value);
                    let enterPoint = this.getTriggerEnterPoint(this.getOimoRigidbody(), value.getOimoRigidbody());
                    event = new FudgeCore.EventPhysics("TriggerEnteredCollision" /* TRIGGER_ENTER */, value, 0, 0, 0, enterPoint);
                    this.dispatchEvent(event);
                }
            });
            //REMOVE
            this.triggers.forEach((value) => {
                let isTriggering = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
                if (isTriggering == false) {
                    let index = this.triggers.indexOf(value);
                    this.triggers.splice(index);
                    event = new FudgeCore.EventPhysics("TriggerLeftCollision" /* TRIGGER_EXIT */, value, 0, 0, 0);
                    this.dispatchEvent(event);
                }
            });
            if (this.colGroup == FudgeCore.PHYSICS_GROUP.TRIGGER) { //In case this is a trigger, it does not only need to send a trigger to everyone else but also receive a triggering for itself.
                this.checkBodiesInTrigger();
            }
        }
        /**
       * Checks that the Rigidbody is positioned correctly and recreates the Collider with new scale/position/rotation
       */
        updateFromWorld(_toMesh = false) {
            let cmpMesh = this.getContainer().getComponent(FudgeCore.ComponentMesh);
            let worldTransform = (_toMesh && cmpMesh) ? cmpMesh.mtxWorld : this.getContainer().mtxWorld; //super.getContainer() != null ? super.getContainer().mtxWorld : Matrix4x4.IDENTITY(); //The the world information about where to position/scale/rotate
            let position = worldTransform.translation; //Adding the offsets from the pivot
            position.add(this.mtxPivot.translation);
            let rotation = worldTransform.getEulerAngles();
            rotation.add(this.mtxPivot.rotation);
            let scaling = worldTransform.scaling;
            scaling.x *= this.mtxPivot.scaling.x;
            scaling.y *= this.mtxPivot.scaling.y;
            scaling.z *= this.mtxPivot.scaling.z;
            this.createCollider(new OIMO.Vec3(scaling.x / 2, scaling.y / 2, scaling.z / 2), this.colliderType); //recreate the collider
            this.collider = new OIMO.Shape(this.colliderInfo);
            let oldCollider = this.rigidbody.getShapeList();
            this.rigidbody.addShape(this.collider); //add new collider, before removing the old, so the rb is never active with 0 colliders
            this.rigidbody.removeShape(oldCollider); //remove the old collider
            this.collider.userData = this; //reset the extra information so that this collider knows to which Fudge Component it's connected
            this.collider.setCollisionGroup(this.collisionGroup);
            if (this.collisionGroup == FudgeCore.PHYSICS_GROUP.TRIGGER) //Trigger not collidering with anything so their mask is only colliding with trigger
                this.collider.setCollisionMask(FudgeCore.PHYSICS_GROUP.TRIGGER);
            else
                this.collider.setCollisionMask(this.colMask);
            if (this.rigidbody.getShapeList() != null) { //reset the informations about physics handling, has to be done because the shape is new
                this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
                this.rigidbody.getShapeList().setFriction(this.bodyFriction);
            }
            this.rigidbody.setMassData(this.massData);
            this.setPosition(position); //set the actual new rotation/position for this Rb again since it's now updated
            this.setRotation(rotation);
        }
        /**
       * Get the current POSITION of the [[Node]] in the physical space
       */
        getPosition() {
            let tmpPos = this.rigidbody.getPosition();
            return new FudgeCore.Vector3(tmpPos.x, tmpPos.y, tmpPos.z);
        }
        /**
      * Sets the current POSITION of the [[Node]] in the physical space
      */
        setPosition(_value) {
            this.rigidbody.setPosition(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        /**
         * Get the current ROTATION of the [[Node]] in the physical space. Note this range from -pi to pi, so -90 to 90.
         */
        getRotation() {
            let orientation = this.rigidbody.getOrientation();
            let tmpQuat = new FudgeCore.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
            return tmpQuat.toDegrees();
        }
        /**
         * Sets the current ROTATION of the [[Node]] in the physical space, in degree.
         */
        setRotation(_value) {
            // this.rigidbody.setRotationXyz(new OIMO.Vec3(_value.x * Math.PI / 180, _value.y * Math.PI / 180, _value.z * Math.PI / 180));
            let rotInQuat = new OIMO.Quat();
            rotInQuat.fromMat3(new OIMO.Mat3().fromEulerXyz(new OIMO.Vec3(_value.x * Math.PI / 180, _value.y * Math.PI / 180, _value.z * Math.PI / 180)));
            rotInQuat.normalize();
            this.rigidbody.setOrientation(rotInQuat);
        }
        /** Get the current SCALING in the physical space. */
        getScaling() {
            let scaling = this.getContainer().mtxWorld.scaling.copy;
            scaling.x *= this.mtxPivot.scaling.x;
            scaling.y *= this.mtxPivot.scaling.y;
            scaling.z *= this.mtxPivot.scaling.z;
            return scaling;
        }
        /** Sets the current SCALING of the [[Node]] in the physical space. Also applying this scaling to the node itself. */
        setScaling(_value) {
            let scaling = _value.copy;
            scaling.x *= this.mtxPivot.scaling.x;
            scaling.y *= this.mtxPivot.scaling.y;
            scaling.z *= this.mtxPivot.scaling.z;
            this.createCollider(new OIMO.Vec3(scaling.x / 2, scaling.y / 2, scaling.z / 2), this.colliderType); //recreate the collider
            this.collider = new OIMO.Shape(this.colliderInfo);
            let oldCollider = this.rigidbody.getShapeList();
            this.rigidbody.addShape(this.collider); //add new collider, before removing the old, so the rb is never active with 0 colliders
            this.rigidbody.removeShape(oldCollider); //remove the old collider
            this.collider.userData = this; //reset the extra information so that this collider knows to which Fudge Component it's connected
            this.collider.setCollisionGroup(this.collisionGroup);
            if (this.collisionGroup == FudgeCore.PHYSICS_GROUP.TRIGGER) //Trigger not collidering with anythign so their mask is only colliding with trigger
                this.collider.setCollisionMask(FudgeCore.PHYSICS_GROUP.TRIGGER);
            else
                this.collider.setCollisionMask(this.colMask);
            if (this.rigidbody.getShapeList() != null) { //reset the informations about physics handling, has to be done because the shape is new
                this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
                this.rigidbody.getShapeList().setFriction(this.bodyFriction);
            }
            let mutator = {};
            mutator["scaling"] = _value;
            this.getContainer().mtxLocal.mutate(mutator);
        }
        //#region Velocity and Forces
        /**
        * Get the current VELOCITY of the [[Node]]
        */
        getVelocity() {
            let velocity = this.rigidbody.getLinearVelocity();
            return new FudgeCore.Vector3(velocity.x, velocity.y, velocity.z);
        }
        /**
         * Sets the current VELOCITY of the [[Node]]
         */
        setVelocity(_value) {
            let velocity = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.rigidbody.setLinearVelocity(velocity);
        }
        /**
    * Get the current ANGULAR - VELOCITY of the [[Node]]
    */
        getAngularVelocity() {
            let velocity = this.rigidbody.getAngularVelocity();
            return new FudgeCore.Vector3(velocity.x, velocity.y, velocity.z);
        }
        /**
       * Sets the current ANGULAR - VELOCITY of the [[Node]]
       */
        setAngularVelocity(_value) {
            let velocity = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.rigidbody.setAngularVelocity(velocity);
        }
        /**
        * Applies a continous FORCE at the center of the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS.
        * The force is measured in newton, 1kg needs about 10 Newton to fight against gravity.
        */
        applyForce(_force) {
            this.rigidbody.applyForceToCenter(new OIMO.Vec3(_force.x, _force.y, _force.z));
        }
        /**
        * Applies a continous FORCE at a specific point in the world to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        */
        applyForceAtPoint(_force, _worldPoint) {
            this.rigidbody.applyForce(new OIMO.Vec3(_force.x, _force.y, _force.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
        }
        /**
        * Applies a continous ROTATIONAL FORCE (Torque) to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        */
        applyTorque(_rotationalForce) {
            this.rigidbody.applyTorque(new OIMO.Vec3(_rotationalForce.x, _rotationalForce.y, _rotationalForce.z));
        }
        /**
        * Applies a instant FORCE at a point/rigidbodycenter to the RIGIDBODY in the three dimensions. Considering the rigidbod's MASS
        * Influencing the angular speed and the linear speed.
        */
        applyImpulseAtPoint(_impulse, _worldPoint = null) {
            _worldPoint = _worldPoint != null ? _worldPoint : this.getPosition();
            this.rigidbody.applyImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
        }
        /**
        * Applies a instant FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        * Only influencing it's speed not rotation.
        */
        applyLinearImpulse(_impulse) {
            this.rigidbody.applyLinearImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z));
        }
        /**
       * Applies a instant ROTATIONAL-FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
       * Only influencing it's rotation.
       */
        applyAngularImpulse(_rotationalImpulse) {
            this.rigidbody.applyAngularImpulse(new OIMO.Vec3(_rotationalImpulse.x, _rotationalImpulse.y, _rotationalImpulse.z));
        }
        /**
       * Changing the VELOCITY of the RIGIDBODY. Only influencing the linear speed not angular
       */
        addVelocity(_value) {
            this.rigidbody.addLinearVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        /**
       * Changing the VELOCITY of the RIGIDBODY. Only influencing the angular speed not the linear
       */
        addAngularVelocity(_value) {
            this.rigidbody.addAngularVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        /** Stops the rigidbody from sleeping when movement is too minimal. Decreasing performance, for rarely more precise physics results */
        deactivateAutoSleep() {
            this.rigidbody.setAutoSleep(false);
        }
        activateAutoSleep() {
            this.rigidbody.setAutoSleep(true);
        }
        //#endregion
        //#events
        /**
         * Sends a ray through this specific body ignoring the rest of the world and checks if this body was hit by the ray,
         * returning info about the hit. Provides the same functionality and information a regular raycast does but the ray is only testing against this specific body.
         */
        raycastThisBody(_origin, _direction, _length) {
            let hitInfo = new FudgeCore.RayHitInfo();
            let geometry = this.rigidbody.getShapeList().getGeometry();
            let transform = this.rigidbody.getTransform();
            let scaledDirection = _direction.copy;
            scaledDirection.scale(_length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, _origin.copy);
            let oimoRay = new OIMO.RayCastHit();
            let hit = geometry.rayCast(new OIMO.Vec3(_origin.x, _origin.y, _origin.z), new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z), transform, oimoRay); //the actual OimoPhysics Raycast
            if (hit) { //If hit return a bunch of informations about the hit
                hitInfo.hit = true;
                hitInfo.hitPoint = new FudgeCore.Vector3(oimoRay.position.x, oimoRay.position.y, oimoRay.position.z);
                hitInfo.hitNormal = new FudgeCore.Vector3(oimoRay.normal.x, oimoRay.normal.y, oimoRay.normal.z);
                let dx = _origin.x - hitInfo.hitPoint.x; //calculate hit distance
                let dy = _origin.y - hitInfo.hitPoint.y;
                let dz = _origin.z - hitInfo.hitPoint.z;
                hitInfo.hitDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                hitInfo.rigidbodyComponent = this;
                hitInfo.rayOrigin = _origin;
                hitInfo.rayEnd = endpoint;
            }
            else { //Only tell the origin, and the hit point is the end of the ray.
                hitInfo.rayOrigin = _origin;
                hitInfo.hitPoint = new FudgeCore.Vector3(endpoint.x, endpoint.y, endpoint.z);
            }
            if (FudgeCore.Physics.settings.debugDraw) {
                FudgeCore.Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
            }
            return hitInfo;
        }
        //#region Saving/Loading - Some properties might be missing, e.g. convexMesh (Float32Array)
        serialize() {
            let serialization = {
                pivot: this.mtxPivot.serialize(),
                id: this.id,
                physicsType: this.rbType,
                mass: this.massData.mass,
                colliderType: this.colType,
                linearDamping: this.linDamping,
                angularDamping: this.angDamping,
                collisionGroup: this.colGroup,
                rotationInfluence: this.rotationalInfluenceFactor,
                gravityScale: this.gravityInfluenceFactor,
                friction: this.bodyFriction,
                restitution: this.bodyRestitution,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.mtxPivot.deserialize(_serialization.pivot);
            this.id = _serialization.id;
            this.physicsType = _serialization.physicsType;
            this.mass = _serialization.mass != null ? _serialization.mass : 1;
            this.colliderType = _serialization.colliderType != null ? _serialization.colliderType : FudgeCore.COLLIDER_TYPE.CUBE;
            this.linearDamping = _serialization.linearDamping != null ? _serialization.linearDamping : this.linDamping;
            this.angularDamping = _serialization.angularDamping != null ? _serialization.angularDamping : this.angDamping;
            this.collisionGroup = _serialization.collisionGroup != null ? _serialization.collisionGroup : this.colGroup;
            this.rotationInfluenceFactor = _serialization.rotationInfluence != null ? _serialization.rotationInfluence : this.rotationalInfluenceFactor;
            this.gravityScale = _serialization.gravityScale != null ? _serialization.gravityScale : 1;
            this.friction = _serialization.friction != null ? _serialization.friction : this.bodyFriction;
            this.restitution = _serialization.restitution != null ? _serialization.restitution : this.bodyRestitution;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        /** Change properties by an associative array */
        async mutate(_mutator) {
            if (_mutator["friction"])
                this.friction = _mutator["friction"];
            if (_mutator["restitution"])
                this.restitution = _mutator["restituion"];
            if (_mutator["mass"])
                this.mass = _mutator["mass"];
            if (_mutator["linearDamping"])
                this.linearDamping = _mutator["linearDamping"];
            if (_mutator["angularDamping"])
                this.angularDamping = _mutator["angularDamping"];
            if (_mutator["gravityScale"])
                this.gravityScale = _mutator["gravityScale"];
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
        reduceMutator(_mutator) {
            delete _mutator.convexMesh; //Convex Mesh can't be shown in the editor because float32Array is not a viable mutator
            delete _mutator.colMask;
        }
        //#endregion
        /** Creates the actual OimoPhysics Rigidbody out of informations the Fudge Component has. */
        createRigidbody(_mass, _type, _colliderType, _mtxTransform, _collisionGroup = FudgeCore.PHYSICS_GROUP.DEFAULT) {
            let oimoType; //Need the conversion from simple enum to number because if enum is defined as Oimo.RigidyBodyType you have to include Oimo to use FUDGE at all
            switch (_type) {
                case FudgeCore.PHYSICS_TYPE.DYNAMIC:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
                case FudgeCore.PHYSICS_TYPE.STATIC:
                    oimoType = OIMO.RigidBodyType.STATIC;
                    break;
                case FudgeCore.PHYSICS_TYPE.KINEMATIC:
                    oimoType = OIMO.RigidBodyType.KINEMATIC;
                    break;
                default:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
            }
            let tmpTransform = _mtxTransform == null ? super.getContainer() != null ? super.getContainer().mtxWorld : FudgeCore.Matrix4x4.IDENTITY() : _mtxTransform; //Get transform informations from the world, since physics does not care about hierarchy
            //Convert informations from Fudge to OimoPhysics and creating a collider with it, while also adding a pivot to derivate from the transform informations if needed
            let scale = new OIMO.Vec3((tmpTransform.scaling.x * this.mtxPivot.scaling.x) / 2, (tmpTransform.scaling.y * this.mtxPivot.scaling.y) / 2, (tmpTransform.scaling.z * this.mtxPivot.scaling.z) / 2);
            let position = new OIMO.Vec3(tmpTransform.translation.x + this.mtxPivot.translation.x, tmpTransform.translation.y + this.mtxPivot.translation.y, tmpTransform.translation.z + this.mtxPivot.translation.z);
            let rotation = new OIMO.Vec3(tmpTransform.rotation.x + this.mtxPivot.rotation.x, tmpTransform.rotation.y + this.mtxPivot.rotation.y, tmpTransform.rotation.z + this.mtxPivot.rotation.z);
            this.createCollider(scale, _colliderType);
            //Setting informations about mass, position/rotation and physical reaction type
            this.massData.mass = _mass; //_type != PHYSICS_TYPE.STATIC ? _mass : 0; //If a object is static it acts as if it has no mass
            this.rigidbodyInfo.type = oimoType;
            this.rigidbodyInfo.position = position;
            this.rigidbodyInfo.rotation.fromEulerXyz(new OIMO.Vec3(rotation.x, rotation.y, rotation.z)); //Convert eulerAngles in degree to the internally used quaternions
            //Creating the actual rigidbody and it's collider
            this.rigidbody = new OIMO.RigidBody(this.rigidbodyInfo);
            this.collider = new OIMO.Shape(this.colliderInfo);
            //Filling the additional settings and informations the rigidbody needs. Who is colliding, how is the collision handled (damping, influence factors)
            this.collider.userData = this;
            this.collider.setCollisionGroup(_collisionGroup);
            if (_collisionGroup == FudgeCore.PHYSICS_GROUP.TRIGGER)
                this.collider.setCollisionMask(FudgeCore.PHYSICS_GROUP.TRIGGER);
            else
                this.collider.setCollisionMask(this.colMask);
            this.rigidbody.addShape(this.collider);
            this.rigidbody.setMassData(this.massData);
            this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
            this.rigidbody.getShapeList().setFriction(this.bodyFriction);
            this.rigidbody.setLinearDamping(this.linDamping);
            this.rigidbody.setAngularDamping(this.angDamping);
            this.rigidbody.setGravityScale(this.gravityInfluenceFactor);
            this.rigidbody.setRotationFactor(new OIMO.Vec3(this.rotationalInfluenceFactor.x, this.rotationalInfluenceFactor.y, this.rotationalInfluenceFactor.z));
        }
        /** Creates a collider a shape that represents the object in the physical world.  */
        createCollider(_scale, _colliderType) {
            let shapeConf = new OIMO.ShapeConfig(); //Collider with geometry and infos like friction/restitution and more
            let geometry;
            if (this.colliderType != _colliderType) //If the collider type was changed set the internal one new, else don't so there is not infinite set calls
                this.colliderType = _colliderType;
            switch (_colliderType) { //Create a different OimoPhysics geometry based on the given type. That is only the mathematical shape of the collider
                case FudgeCore.COLLIDER_TYPE.CUBE:
                    geometry = new OIMO.BoxGeometry(_scale);
                    break;
                case FudgeCore.COLLIDER_TYPE.SPHERE:
                    geometry = new OIMO.SphereGeometry(_scale.x);
                    break;
                case FudgeCore.COLLIDER_TYPE.CAPSULE:
                    geometry = new OIMO.CapsuleGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.CYLINDER:
                    geometry = new OIMO.CylinderGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.CONE:
                    geometry = new OIMO.ConeGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.PYRAMID:
                    geometry = this.createConvexGeometryCollider(this.createPyramidVertices(), _scale);
                    break;
                case FudgeCore.COLLIDER_TYPE.CONVEX:
                    geometry = this.createConvexGeometryCollider(this.convexMesh, _scale);
                    break;
            }
            shapeConf.geometry = geometry;
            this.colliderInfo = shapeConf; //the configuration informations that are used to add an actual collider to the rigidbody in createRigidbody
        }
        /** Creating a shape that represents a in itself closed form, out of the given vertices. */
        createConvexGeometryCollider(_vertices, _scale) {
            let verticesAsVec3 = new Array(); //Convert Fudge Vector3 to OimoVec3
            for (let i = 0; i < _vertices.length; i += 3) { //3 Values for one point
                verticesAsVec3.push(new OIMO.Vec3(_vertices[i] * _scale.x, _vertices[i + 1] * _scale.y, _vertices[i + 2] * _scale.z));
            }
            return new OIMO.ConvexHullGeometry(verticesAsVec3); //Tell OimoPhysics to create a hull that involves all points but close it of. A convex shape can not have a hole in it.
        }
        /** Internal implementation of vertices that construct a pyramid. The vertices of the implemented pyramid mesh can be used too. But they are halfed and double sided, so it's more performant to use this. */
        createPyramidVertices() {
            let vertices = new Float32Array([
                /*0*/ -1, 0, 1, /*1*/ 1, 0, 1, /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
                /*4*/ 0, 2, 0
            ]);
            return vertices;
        }
        /** Adding this ComponentRigidbody to the Physiscs.world giving the oimoPhysics system the information needed */
        addRigidbodyToWorld() {
            FudgeCore.Physics.world.addRigidbody(this);
        }
        /** Removing this ComponentRigidbody from the Physiscs.world taking the informations from the oimoPhysics system */
        removeRigidbodyFromWorld() {
            if (this.colGroup == FudgeCore.PHYSICS_GROUP.TRIGGER) { //Delete check for this trigger from world if this component is removed
                FudgeCore.Physics.world.unregisterTrigger(this);
            }
            FudgeCore.Physics.world.removeRigidbody(this);
        }
        //#region private EVENT functions
        /** Check if two OimoPhysics Shapes collide with each other. By overlapping their approximations */
        collidesWith(triggerRigidbody, secondRigidbody) {
            let shape1 = triggerRigidbody.getShapeList().getAabb();
            let shape2 = secondRigidbody.getShapeList().getAabb();
            let colliding = shape1.overlap(shape2);
            return colliding;
        }
        /** Find the approximated entry point of a trigger event. To give the event a approximated information where to put something in the world when a triggerEvent has happened */
        getTriggerEnterPoint(triggerRigidbody, secondRigidbody) {
            let shape1 = triggerRigidbody.getShapeList().getAabb();
            let shape2 = secondRigidbody.getShapeList().getAabb();
            //Center of a intersection should be the origion of the collision, because the triggering just happened so one or two touching points the center of it is the entry point
            let intersect = shape1.getIntersection(shape2).getCenter();
            return new FudgeCore.Vector3(intersect.x, intersect.y, intersect.z);
        }
        /**
         * Events in case a body is in a trigger, so not only the body registers a triggerEvent but also the trigger itself.
         */
        checkBodiesInTrigger() {
            let possibleBodies = FudgeCore.Physics.world.getBodyList(); //Since this is a trigger it checks itself against everybody in the world
            let event;
            //ADD
            possibleBodies.forEach((value) => {
                let overlapping = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
                if (overlapping && this.bodiesInTrigger.indexOf(value) == -1) {
                    this.bodiesInTrigger.push(value);
                    let enterPoint = this.getTriggerEnterPoint(this.getOimoRigidbody(), value.getOimoRigidbody());
                    event = new FudgeCore.EventPhysics("TriggerEnteredCollision" /* TRIGGER_ENTER */, value, 0, 0, 0, enterPoint);
                    this.dispatchEvent(event);
                }
            });
            //REMOVE
            this.bodiesInTrigger.forEach((value) => {
                let isTriggering = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
                if (isTriggering == false) {
                    let index = this.bodiesInTrigger.indexOf(value);
                    this.bodiesInTrigger.splice(index);
                    event = new FudgeCore.EventPhysics("TriggerLeftCollision" /* TRIGGER_EXIT */, value, 0, 0, 0);
                    this.dispatchEvent(event);
                }
            });
        }
        //Calculating the center of a collision as a singular point - in case there is more than one point - by getting the geometrical center of all colliding points
        collisionCenterPoint(_colPoints, _numPoints) {
            let center;
            let totalPoints = 0;
            let totalX = 0;
            let totalY = 0;
            let totalZ = 0;
            _colPoints.forEach((value) => {
                if (totalPoints < _numPoints) {
                    totalPoints++;
                    totalX += value.getPosition2().x;
                    totalY += value.getPosition2().y;
                    totalZ += value.getPosition2().z;
                }
            });
            center = new OIMO.Vec3(totalX / _numPoints, totalY / _numPoints, totalZ / _numPoints);
            return center;
        }
    }
    ComponentRigidbody.iSubclass = FudgeCore.Component.registerSubclass(ComponentRigidbody);
    FudgeCore.ComponentRigidbody = ComponentRigidbody;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentRigidbody.js.map