"use strict";
///<reference path="../../../Physics/OIMOPhysics.d.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
      * Main Physics Class to hold information about the physical representation of the scene
      * @author Marko Fehrenbach, HFU 2020
      */
    class Physics {
        constructor() {
            this.bodyList = new Array();
            this.triggerBodyList = new Array();
            this.jointList = new Array();
        }
        /**
         * Creating a physical world to represent the [[Node]] Scene Tree. Call once before using any physics functions or
         * rigidbodies.
         */
        static initializePhysics() {
            if (typeof OIMO !== "undefined" && this.world == null) { //Check if OIMO Namespace was loaded, else do not use any physics. Check is needed to ensure FUDGE can be used without Physics
                this.world = new Physics();
                this.settings = new FudgeCore.PhysicsSettings(FudgeCore.PHYSICS_GROUP.DEFAULT, (FudgeCore.PHYSICS_GROUP.DEFAULT | FudgeCore.PHYSICS_GROUP.GROUP_1 | FudgeCore.PHYSICS_GROUP.GROUP_2 | FudgeCore.PHYSICS_GROUP.GROUP_3 | FudgeCore.PHYSICS_GROUP.GROUP_4));
                this.world.createWorld(); //create the actual oimoPhysics World
                this.world.debugDraw = new FudgeCore.PhysicsDebugDraw(); //Create a Fudge Physics debugging handling object
                this.world.oimoWorld.setDebugDraw(this.world.debugDraw.oimoDebugDraw); //Tell OimoPhysics where to debug to and how it will be handled
            }
            return this.world;
        }
        /**
        * Cast a RAY into the physical world from a origin point in a certain direction. Receiving informations about the hit object and the
        * hit point. Do not specify a _group to raycast the whole world, else only bodies within the specific group can be hit.
        */
        static raycast(_origin, _direction, _length = 1, _group = FudgeCore.PHYSICS_GROUP.DEFAULT) {
            let hitInfo = new FudgeCore.RayHitInfo();
            let ray = new OIMO.RayCastClosest();
            let begin = new OIMO.Vec3(_origin.x, _origin.y, _origin.z);
            let end = this.getRayEndPoint(begin, new FudgeCore.Vector3(_direction.x, _direction.y, _direction.z), _length);
            ray.clear();
            if (_group == FudgeCore.PHYSICS_GROUP.DEFAULT) { //Case 1: Raycasting the whole world, normal mode
                Physics.world.oimoWorld.rayCast(begin, end, ray);
            }
            else { //Case2: Raycasting on each body in a specific group
                let allHits = new Array();
                this.world.bodyList.forEach(function (value) {
                    if (value.collisionGroup == _group) {
                        hitInfo = value.raycastThisBody(_origin, _direction, _length);
                        if (hitInfo.hit == true) { //Every hit is could potentially be the closest
                            allHits.push(hitInfo);
                        }
                    }
                });
                allHits.forEach(function (value) {
                    if (value.hitDistance < hitInfo.hitDistance || hitInfo.hit == false) {
                        hitInfo = value;
                    }
                });
            }
            if (ray.hit) { //Fill in informations on the hit
                hitInfo.hit = true;
                hitInfo.hitPoint = new FudgeCore.Vector3(ray.position.x, ray.position.y, ray.position.z);
                hitInfo.hitNormal = new FudgeCore.Vector3(ray.normal.x, ray.normal.y, ray.normal.z);
                hitInfo.hitDistance = this.getRayDistance(_origin, hitInfo.hitPoint);
                hitInfo.rigidbodyComponent = ray.shape.userData;
                hitInfo.rayEnd = new FudgeCore.Vector3(end.x, end.y, end.z);
                hitInfo.rayOrigin = _origin;
            }
            else {
                hitInfo.rayOrigin = _origin;
                hitInfo.hitPoint = new FudgeCore.Vector3(end.x, end.y, end.z);
            }
            if (Physics.settings.debugDraw) { //Handle debugging
                Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
            }
            return hitInfo;
        }
        /**
          * Adjusts the transforms of the [[ComponentRigidbody]]s in the given branch to match their nodes or meshes
          */
        static adjustTransforms(_branch, _toMesh = false) {
            FudgeCore.Render.prepare(_branch, { ignorePhysics: true });
            for (let node of FudgeCore.Render.nodesPhysics)
                node.getComponent(FudgeCore.ComponentRigidbody).updateFromWorld(_toMesh);
            // this.world.updateWorldFromWorldMatrix(_toMesh);
            // for (let body of this.world.bodyList)
            //   body.updateFromWorld(_toMesh);
        }
        /** Internal function to calculate the endpoint of mathematical ray. By adding the multiplied direction to the origin.
           * Used because OimoPhysics defines ray by start/end. But GameEngines commonly use origin/direction.
           */
        static getRayEndPoint(start, direction, length) {
            let origin = new FudgeCore.Vector3(start.x, start.y, start.z);
            let scaledDirection = direction;
            scaledDirection.scale(length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, origin);
            return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
        }
        /** Internal function to get the distance in which a ray hit by subtracting points from each other and get the square root of the squared product of each component. */
        static getRayDistance(origin, hitPoint) {
            let dx = origin.x - hitPoint.x;
            let dy = origin.y - hitPoint.y;
            let dz = origin.z - hitPoint.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        /** Returns all the ComponentRigidbodies that are known to the physical space. */
        getBodyList() {
            return this.bodyList;
        }
        /** Returns all the ComponentRigidbodies that are in the specific group of triggers. */
        getTriggerList() {
            return this.triggerBodyList;
        }
        /**
        * Getting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
        */
        getSolverIterations() {
            return Physics.world.oimoWorld.getNumPositionIterations();
        }
        /**
        * Setting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
        */
        setSolverIterations(_value) {
            Physics.world.oimoWorld.setNumPositionIterations(_value);
            Physics.world.oimoWorld.setNumVelocityIterations(_value);
        }
        /**
        * Get the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
        */
        getGravity() {
            let tmpVec = Physics.world.oimoWorld.getGravity();
            return new FudgeCore.Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
        }
        /**
        * Set the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
        */
        setGravity(_value) {
            let tmpVec = new OIMO.Vec3(_value.x, _value.y, _value.z);
            Physics.world.oimoWorld.setGravity(tmpVec);
        }
        /**
        * Adding a new OIMO Rigidbody to the OIMO World, happens automatically when adding a FUDGE Rigidbody Component
        */
        addRigidbody(_cmpRB) {
            this.bodyList.push(_cmpRB);
            Physics.world.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
        }
        /**
        * Removing a OIMO Rigidbody to the OIMO World, happens automatically when removing a FUDGE Rigidbody Component
        */
        removeRigidbody(_cmpRB) {
            let id = this.bodyList.indexOf(_cmpRB);
            this.bodyList.splice(id, 1);
            Physics.world.oimoWorld.removeRigidBody(_cmpRB.getOimoRigidbody());
        }
        /**
        * Adding a new OIMO Joint/Constraint to the OIMO World, happens automatically when adding a FUDGE Joint Component
        */
        addJoint(_cmpJoint) {
            Physics.world.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
        }
        /**
          * Removing a OIMO Joint/Constraint to the OIMO World, happens automatically when removeing a FUDGE Joint Component
          */
        removeJoint(_cmpJoint) {
            Physics.world.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
        }
        /** Returns the actual used world of the OIMO physics engine. No user interaction needed.*/
        getOimoWorld() {
            return this.oimoWorld;
        }
        /**
        * Simulates the physical world. _deltaTime is the amount of time between physical steps, default is 60 frames per second ~17ms
        */
        simulate(_deltaTime = 1 / 60) {
            if (this.jointList.length > 0)
                this.connectJoints(); //Connect joints if anything has happened between the last call to any of the two paired rigidbodies
            if (FudgeCore.Time.game.getScale() != 0) //If time is stopped do not simulate to avoid misbehaviour
                Physics.world.oimoWorld.step(_deltaTime * FudgeCore.Time.game.getScale()); //Update the simulation by the given deltaTime and the Fudge internal TimeScale
            if (Physics.world.mainCam != null && Physics.settings.debugDraw == true) { //Get Cam from viewport instead of setting it for physics
                Physics.world.debugDraw.begin(); //Updates info about the current projection, resetting the points/lines/triangles that need to be drawn from debug
                Physics.world.oimoWorld.debugDraw(); //Filling the physics world debug informations into the debug rendering handler
            }
        }
        /** Make the given ComponentRigidbody known to the world as a body that is not colliding, but only triggering events. Used internally no interaction needed. */
        registerTrigger(_rigidbody) {
            if (this.triggerBodyList.indexOf(_rigidbody) == -1)
                this.triggerBodyList.push(_rigidbody);
        }
        /** Remove the given ComponentRigidbody the world as viable triggeringBody. Used internally no interaction needed. */
        unregisterTrigger(_rigidbody) {
            let id = this.bodyList.indexOf(_rigidbody);
            this.bodyList.splice(id, 1);
        }
        /** Connect all joints that are not connected yet. Used internally no user interaction needed. This functionality is called and needed to make sure joints connect/disconnect
         * if any of the two paired ComponentRigidbodies change.
         */
        connectJoints() {
            let jointsToConnect = new Array(); //Copy original Array because removing/readding in the connecting process
            this.jointList.forEach(function (value) {
                jointsToConnect.push(value);
            });
            this.jointList.splice(0, this.jointList.length);
            jointsToConnect.forEach((value) => {
                if (value.checkConnection() == false) {
                    value.connect();
                }
            });
        }
        /**
        * Called internally to inform the physics system that a joint has a change of core properties like ComponentRigidbody and needs to
        * be recreated.
        */
        changeJointStatus(_cmpJoint) {
            this.jointList.push(_cmpJoint);
        }
        /** Giving a ComponentRigidbody a specific identification number so it can be referenced in the loading process. And removed rb's can receive a new id. */
        distributeBodyID() {
            let freeId = 0;
            let free = false;
            this.bodyList.forEach((_value) => {
                if (_value.id != freeId) {
                    free = true;
                }
                else {
                    free = false;
                }
                if (!free) {
                    freeId++;
                }
            });
            return freeId;
        }
        /** Returns the ComponentRigidbody with the given id. Used internally to reconnect joints on loading in the editor. */
        getBodyByID(_id) {
            let body = null;
            this.bodyList.forEach((value) => {
                if (value.id == _id) {
                    body = value;
                }
            });
            return body;
        }
        /** Updates all [[Rigidbodies]] known to the Physics.world to match their containers or meshes transformations */
        // private updateWorldFromWorldMatrix(_toMesh: boolean = false): void {
        //   for (let body of this.bodyList)
        //     body.updateFromWorld(_toMesh);
        // }
        /** Create a oimoPhysics world. Called once at the beginning if none is existend yet. */
        createWorld() {
            if (Physics.world.oimoWorld != null) {
                //Resetting the world so a new world can be created, fix for re-opening a project in editor, making sure there are no old things calculated
                let jointsWorld = Physics.world.oimoWorld.getNumJoints();
                let bodiesWorld = Physics.world.oimoWorld.getNumRigidBodies();
                this.bodyList = null;
                this.jointList = null;
                this.triggerBodyList = null;
                for (let i = 0; i < jointsWorld; i++) {
                    Physics.world.oimoWorld.removeJoint(Physics.world.oimoWorld.getJointList());
                }
                for (let i = 0; i < bodiesWorld; i++) {
                    Physics.world.oimoWorld.removeRigidBody(Physics.world.oimoWorld.getRigidBodyList());
                }
            }
            Physics.world.oimoWorld = new OIMO.World();
        }
    }
    /** The PHYSICAL WORLD that gives every [[Node]] with a ComponentRigidbody a physical representation and moves them accordingly to the laws of the physical world. */
    Physics.world = Physics.initializePhysics();
    FudgeCore.Physics = Physics;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Physics.js.map