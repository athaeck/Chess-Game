"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
       * Acts as the physical representation of a connection between two [[Node]]'s.
       * The type of conncetion is defined by the subclasses like prismatic joint, cylinder joint etc.
       * A Rigidbody on the [[Node]] that this component is added to is needed. Setting the connectedRigidbody and
       * initializing the connection creates a physical connection between them. This differs from a connection through hierarchy
       * in the node structure of fudge. Joints can have different DOF's (Degrees Of Freedom), 1 Axis that can either twist or swing is a degree of freedom.
       * A joint typically consists of a motor that limits movement/rotation or is activly trying to move to a limit. And a spring which defines the rigidity.
       * @author Marko Fehrenbach, HFU 2020
       */
    class ComponentJoint extends FudgeCore.Component {
        /** Create a joint connection between the two given RigidbodyComponents. */
        constructor(_attachedRigidbody = null, _connectedRigidbody = null) {
            super();
            this.singleton = false; //Multiple joints can be attached to one Node
            this.idAttachedRB = 0;
            this.idConnectedRB = 0;
            this.connected = false;
            this.attachedRigidbody = _attachedRigidbody;
            this.connectedRigidbody = _connectedRigidbody;
        }
        /** Get/Set the first ComponentRigidbody of this connection. It should always be the one that this component is attached too in the sceneTree. */
        get attachedRigidbody() {
            return this.attachedRB;
        }
        set attachedRigidbody(_cmpRB) {
            this.idAttachedRB = _cmpRB != null ? _cmpRB.id : 0;
            this.attachedRB = _cmpRB;
            this.disconnect();
            this.dirtyStatus();
        }
        /** Get/Set the second ComponentRigidbody of this connection. */
        get connectedRigidbody() {
            return this.connectedRB;
        }
        set connectedRigidbody(_cmpRB) {
            this.idConnectedRB = _cmpRB != null ? _cmpRB.id : 0;
            this.connectedRB = _cmpRB;
            this.disconnect();
            this.dirtyStatus();
        }
        /** Get/Set if the two bodies collide with each other or only with the world but not with themselves. Default = no internal collision.
         *  In most cases it's prefered to declare a minimum and maximum angle/length the bodies can move from one another instead of having them collide.
         */
        get selfCollision() {
            return this.collisionBetweenConnectedBodies;
        }
        set selfCollision(_value) {
            this.collisionBetweenConnectedBodies = _value;
        }
        /** Check if connection is dirty, so when either rb is changed disconnect and reconnect. Internally used no user interaction needed. */
        checkConnection() {
            return this.connected;
        }
        /** Adding the given Fudge ComponentJoint to the oimoPhysics World */
        addConstraintToWorld(cmpJoint) {
            FudgeCore.Physics.world.addJoint(cmpJoint);
        }
        /** Removing the given Fudge ComponentJoint to the oimoPhysics World */
        removeConstraintFromWorld(cmpJoint) {
            FudgeCore.Physics.world.removeJoint(cmpJoint);
        }
        /** Setting both bodies to the bodies that belong to the loaded IDs and reconnecting them */
        setBodiesFromLoadedIDs() {
            FudgeCore.Debug.log("Set From: " + this.idAttachedRB + " / " + this.idConnectedRB);
            this.attachedRigidbody = FudgeCore.Physics.world.getBodyByID(this.idAttachedRB);
            this.connectedRigidbody = FudgeCore.Physics.world.getBodyByID(this.idConnectedRB);
        }
        /** Deserialize Base Class Information - Component, since Typescript does not give the ability to call super.super */
        baseDeserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        /** Serialize Base Class Information - Component, since Typescript does not give the ability to call super.super in Child classes of e.g. ComponentJointPrismatic */
        baseSerialize() {
            let serialization;
            serialization = super.serialize();
            return serialization;
        }
    }
    ComponentJoint.iSubclass = FudgeCore.Component.registerSubclass(ComponentJoint);
    FudgeCore.ComponentJoint = ComponentJoint;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentJoint.js.map