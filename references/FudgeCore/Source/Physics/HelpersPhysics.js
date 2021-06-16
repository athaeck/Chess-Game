"use strict";
var FudgeCore;
(function (FudgeCore) {
    class EventPhysics extends Event {
        /** Creates a new event customized for physics. Holding informations about impulses. Collision point and the body that is colliding */
        constructor(_type, _hitRigidbody, _normalImpulse, _tangentImpulse, _binormalImpulse, _collisionPoint = null, _collisionNormal = null) {
            super(_type);
            this.cmpRigidbody = _hitRigidbody;
            this.normalImpulse = _normalImpulse;
            this.tangentImpulse = _tangentImpulse;
            this.binomalImpulse = _binormalImpulse;
            this.collisionPoint = _collisionPoint;
            this.collisionNormal = _collisionNormal;
        }
    }
    FudgeCore.EventPhysics = EventPhysics;
    /**
  * Groups to place a node in, not every group should collide with every group. Use a Mask in to exclude collisions
  */
    let PHYSICS_GROUP;
    (function (PHYSICS_GROUP) {
        PHYSICS_GROUP[PHYSICS_GROUP["DEFAULT"] = 1] = "DEFAULT";
        PHYSICS_GROUP[PHYSICS_GROUP["TRIGGER"] = 60000] = "TRIGGER";
        PHYSICS_GROUP[PHYSICS_GROUP["GROUP_1"] = 2] = "GROUP_1";
        PHYSICS_GROUP[PHYSICS_GROUP["GROUP_2"] = 4] = "GROUP_2";
        PHYSICS_GROUP[PHYSICS_GROUP["GROUP_3"] = 8] = "GROUP_3";
        PHYSICS_GROUP[PHYSICS_GROUP["GROUP_4"] = 16] = "GROUP_4";
    })(PHYSICS_GROUP = FudgeCore.PHYSICS_GROUP || (FudgeCore.PHYSICS_GROUP = {}));
    /**
    * Different types of physical interaction, DYNAMIC is fully influenced by physics and only physics, STATIC means immovable,
    * KINEMATIC is moved through transform and animation instead of physics code.
    */
    let PHYSICS_TYPE;
    (function (PHYSICS_TYPE) {
        PHYSICS_TYPE[PHYSICS_TYPE["DYNAMIC"] = 0] = "DYNAMIC";
        PHYSICS_TYPE[PHYSICS_TYPE["STATIC"] = 1] = "STATIC";
        PHYSICS_TYPE[PHYSICS_TYPE["KINEMATIC"] = 2] = "KINEMATIC"; // = OIMO.RigidBodyType.KINEMATIC
    })(PHYSICS_TYPE = FudgeCore.PHYSICS_TYPE || (FudgeCore.PHYSICS_TYPE = {}));
    /**
    * Different types of collider shapes, with different options in scaling BOX = Vector3(length, height, depth),
    * SPHERE = Vector3(diameter, x, x), CAPSULE = Vector3(diameter, height, x), CYLINDER = Vector3(diameter, height, x),
    * CONE = Vector(diameter, height, x), PYRAMID = Vector3(length, height, depth); x == unused.
    * CONVEX = ComponentMesh needs to be available in the RB Property convexMesh, the points of that component are used to create a collider that matches,
    * the closest possible representation of that form, in form of a hull. Convex is experimental and can produce unexpected behaviour when vertices
    * are too close to one another and the given vertices do not form a in itself closed shape and having a genus of 0 (no holes). Vertices in the ComponentMesh can be scaled differently
    * for texturing/normal or other reasons, so the collider might be off compared to the visual shape, this can be corrected by changing the pivot scale of the ComponentRigidbody.
    */
    let COLLIDER_TYPE;
    (function (COLLIDER_TYPE) {
        COLLIDER_TYPE[COLLIDER_TYPE["CUBE"] = 0] = "CUBE";
        COLLIDER_TYPE[COLLIDER_TYPE["SPHERE"] = 1] = "SPHERE";
        COLLIDER_TYPE[COLLIDER_TYPE["CAPSULE"] = 2] = "CAPSULE";
        COLLIDER_TYPE[COLLIDER_TYPE["CYLINDER"] = 3] = "CYLINDER";
        COLLIDER_TYPE[COLLIDER_TYPE["CONE"] = 4] = "CONE";
        COLLIDER_TYPE[COLLIDER_TYPE["PYRAMID"] = 5] = "PYRAMID";
        COLLIDER_TYPE[COLLIDER_TYPE["CONVEX"] = 6] = "CONVEX";
    })(COLLIDER_TYPE = FudgeCore.COLLIDER_TYPE || (FudgeCore.COLLIDER_TYPE = {}));
    /** Displaying different types of debug information about different physic features. Default = JOINTS_AND_COLLIDER. debugDraw in the settings must be active to see anything. */
    let PHYSICS_DEBUGMODE;
    (function (PHYSICS_DEBUGMODE) {
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["COLLIDERS"] = 0] = "COLLIDERS";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["JOINTS_AND_COLLIDER"] = 1] = "JOINTS_AND_COLLIDER";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["BOUNDING_BOXES"] = 2] = "BOUNDING_BOXES";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["CONTACTS"] = 3] = "CONTACTS";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["PHYSIC_OBJECTS_ONLY"] = 4] = "PHYSIC_OBJECTS_ONLY";
    })(PHYSICS_DEBUGMODE = FudgeCore.PHYSICS_DEBUGMODE || (FudgeCore.PHYSICS_DEBUGMODE = {}));
    /** Info about Raycasts shot from the physics system. */
    class RayHitInfo {
        constructor() {
            this.rayOrigin = FudgeCore.Vector3.ZERO();
            this.rayEnd = FudgeCore.Vector3.ZERO();
            this.hit = false;
            this.hitDistance = 0;
            this.hitPoint = FudgeCore.Vector3.ZERO();
            this.hitNormal = FudgeCore.Vector3.ZERO();
        }
    }
    FudgeCore.RayHitInfo = RayHitInfo;
    /** General settings for the physic simulation and the debug of it. */
    class PhysicsSettings {
        constructor(_defGroup, _defMask) {
            /** Whether the debug informations of the physics should be displayed or not (default = false) */
            this.debugDraw = false;
            this.physicsDebugMode = PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
            this.defaultCollisionGroup = _defGroup;
            this.defaultCollisionMask = _defMask;
        }
        get debugMode() {
            return this.physicsDebugMode;
        }
        set debugMode(_value) {
            this.physicsDebugMode = _value;
        }
        /** Change if rigidbodies are able to sleep (don't be considered in physical calculations) when their movement is below a threshold. Deactivation is decreasing performance for minor advantage in precision. */
        get disableSleeping() {
            return OIMO.Setting.disableSleeping;
        }
        set disableSleeping(_value) {
            OIMO.Setting.disableSleeping = _value;
        }
        /** Sleeping Threshold for Movement Veloctiy. */
        get sleepingVelocityThreshold() {
            return OIMO.Setting.sleepingVelocityThreshold;
        }
        set sleepingVelocityThreshold(_value) {
            OIMO.Setting.sleepingVelocityThreshold = _value;
        }
        /** Sleeping Threshold for Rotation Velocity. */
        get sleepingAngularVelocityThreshold() {
            return OIMO.Setting.sleepingAngularVelocityThreshold;
        }
        set sleepingAngularVelocityThreshold(_value) {
            OIMO.Setting.sleepingAngularVelocityThreshold = _value;
        }
        /** Threshold how long the Rigidbody must be below/above the threshold to count as sleeping. */
        get sleepingTimeThreshold() {
            return OIMO.Setting.sleepingTimeThreshold;
        }
        set sleepingTimeThreshold(_value) {
            OIMO.Setting.sleepingTimeThreshold = _value;
        }
        /** Error threshold. Default is 0.05. The higher the more likely collisions get detected before actual impact at high speeds but it's visually less accurate. */
        get defaultCollisionMargin() {
            return OIMO.Setting.defaultGJKMargin;
        }
        set defaultCollisionMargin(_thickness) {
            OIMO.Setting.defaultGJKMargin = _thickness;
        }
        /** The default applied friction between two rigidbodies with the default value. How much velocity is slowed down when moving accross this surface. */
        get defaultFriction() {
            return OIMO.Setting.defaultFriction;
        }
        set defaultFriction(_value) {
            OIMO.Setting.defaultFriction = _value;
        }
        /** Bounciness of rigidbodies. How much of the impact is restituted. */
        get defaultRestitution() {
            return OIMO.Setting.defaultRestitution;
        }
        set defaultRestitution(_value) {
            OIMO.Setting.defaultRestitution = _value;
        }
        /** Groups the default rigidbody will collide with. Set it like: (PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 | PHYSICS_GROUP.GROUP_2 | PHYSICS_GROUP.GROUP_3)
         * to collide with multiple groups. Default is collision with everything but triggers.
        */
        get defaultCollisionMask() {
            return OIMO.Setting.defaultCollisionMask;
        }
        set defaultCollisionMask(_value) {
            OIMO.Setting.defaultCollisionMask = _value;
        }
        /** The group that this rigidbody belongs to. Default is the DEFAULT Group which means its just a normal Rigidbody not a trigger nor anything special. */
        get defaultCollisionGroup() {
            return OIMO.Setting.defaultCollisionGroup;
        }
        set defaultCollisionGroup(_value) {
            OIMO.Setting.defaultCollisionGroup = _value;
        }
        /** Change the type of joint solver algorithm. Default Iterative == 0, is faster but less stable. Direct == 1, slow but more stable, recommended for complex joint work. Change this setting only at the start of your game. */
        get defaultConstraintSolverType() {
            return OIMO.Setting.defaultJointConstraintSolverType;
        }
        set defaultConstraintSolverType(_value) {
            OIMO.Setting.defaultJointConstraintSolverType = _value;
        }
        /** The correction algorithm used to correct physics calculations. Change this only at the beginning of your game. Each has different approaches, so if you have problems test another
         *  Default 0 = Baumgarte (fast but less correct induces some energy errors), 1 = Split-Impulse (fast and no engery errors, but more inaccurate for joints), 2 = Non-linear Gauss Seidel (slowest but most accurate)*/
        get defaultCorrectionAlgorithm() {
            return OIMO.Setting.defaultJointPositionCorrectionAlgorithm;
        }
        set defaultCorrectionAlgorithm(_value) {
            OIMO.Setting.defaultJointPositionCorrectionAlgorithm = _value;
        }
    }
    FudgeCore.PhysicsSettings = PhysicsSettings;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=HelpersPhysics.js.map