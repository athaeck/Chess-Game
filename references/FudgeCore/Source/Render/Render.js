"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * The main interface to the render engine, here WebGL (see superclass [[RenderWebGL]] and the RenderInjectors
     */
    class Render extends FudgeCore.RenderWebGL {
        // TODO: research if picking should be optimized using radius picking to filter
        //#region Prepare
        /**
         * Recursively iterates over the branch starting with the node given, recalculates all world transforms,
         * collects all lights and feeds all shaders used in the graph with these lights. Sorts nodes for different
         * render passes.
         */
        static prepare(_branch, _options = {}, _mtxWorld = FudgeCore.Matrix4x4.IDENTITY(), _lights = new Map(), _shadersUsed = null) {
            let firstLevel = (_shadersUsed == null);
            if (firstLevel) {
                _shadersUsed = [];
                Render.timestampUpdate = performance.now();
                Render.nodesSimple.reset();
                Render.nodesAlpha.reset();
                Render.nodesPhysics.reset();
                Render.dispatchEvent(new Event("renderPrepareStart" /* RENDER_PREPARE_START */));
            }
            if (!_branch.isActive)
                return; // don't add branch to render list if not active
            _branch.nNodesInBranch = 1;
            _branch.radius = 0;
            _branch.dispatchEventToTargetOnly(new Event("renderPrepare" /* RENDER_PREPARE */));
            _branch.timestampUpdate = Render.timestampUpdate;
            if (_branch.cmpTransform && _branch.cmpTransform.isActive)
                _branch.mtxWorld.set(FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorld, _branch.cmpTransform.mtxLocal));
            else
                _branch.mtxWorld.set(_mtxWorld); // overwrite readonly mtxWorld of the current node
            let cmpRigidbody = _branch.getComponent(FudgeCore.ComponentRigidbody);
            if (cmpRigidbody && cmpRigidbody.isActive) { //TODO: support de-/activation throughout
                Render.nodesPhysics.push(_branch); // add this node to physics list
                if (!_options?.ignorePhysics)
                    this.transformByPhysics(_branch, cmpRigidbody);
            }
            let cmpLights = _branch.getComponents(FudgeCore.ComponentLight);
            for (let cmpLight of cmpLights) {
                if (!cmpLight.isActive)
                    continue;
                let type = cmpLight.light.getType();
                let lightsOfType = _lights.get(type);
                if (!lightsOfType) {
                    lightsOfType = [];
                    _lights.set(type, lightsOfType);
                }
                lightsOfType.push(cmpLight);
            }
            let cmpMesh = _branch.getComponent(FudgeCore.ComponentMesh);
            let cmpMaterial = _branch.getComponent(FudgeCore.ComponentMaterial);
            if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                // TODO: careful when using particlesystem, pivot must not change node position
                cmpMesh.mtxWorld = FudgeCore.Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.mtxPivot);
                let shader = cmpMaterial.material.getShader();
                if (_shadersUsed.indexOf(shader) < 0)
                    _shadersUsed.push(shader);
                _branch.radius = cmpMesh.radius;
                if (cmpMaterial.sortForAlpha)
                    Render.nodesAlpha.push(_branch); // add this node to render list
                else
                    Render.nodesSimple.push(_branch); // add this node to render list
            }
            for (let child of _branch.getChildren()) {
                Render.prepare(child, _options, _branch.mtxWorld, _lights, _shadersUsed);
                _branch.nNodesInBranch += child.nNodesInBranch;
                let cmpMeshChild = child.getComponent(FudgeCore.ComponentMesh);
                let position = cmpMeshChild ? cmpMeshChild.mtxWorld.translation : child.mtxWorld.translation;
                _branch.radius = Math.max(_branch.radius, FudgeCore.Vector3.DIFFERENCE(position, _branch.mtxWorld.translation).magnitude + child.radius);
            }
            if (firstLevel) {
                Render.dispatchEvent(new Event("renderPrepareEnd" /* RENDER_PREPARE_END */));
                for (let shader of _shadersUsed)
                    Render.setLightsInShader(shader, _lights);
            }
            //Calculate Physics based on all previous calculations    
            // Render.setupPhysicalTransform(_branch);
        }
        //#endregion
        //#region Picking
        /**
         * Used with a [[Picker]]-camera, this method renders one pixel with picking information
         * for each node in the line of sight and return that as an unsorted [[Pick]]-array
         */
        static pickBranch(_branch, _cmpCamera) {
            Render.ƒpicked = [];
            let size = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
            Render.createPickTexture(size);
            Render.setBlendMode(FudgeCore.BLEND.OPAQUE);
            for (let node of _branch.getIterator(true)) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                    let mtxMeshToView = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
                    Render.pick(node, node.mtxWorld, mtxMeshToView);
                    // RenderParticles.drawParticles();
                    FudgeCore.Recycler.store(mtxMeshToView);
                }
            }
            Render.setBlendMode(FudgeCore.BLEND.TRANSPARENT);
            let picks = Render.getPicks(size, _cmpCamera);
            Render.resetFrameBuffer();
            return picks;
        }
        //#endregion
        //#region Drawing
        static draw(_cmpCamera) {
            // TODO: Move physics rendering to RenderPhysics extension of RenderManager
            if (FudgeCore.Physics.world && FudgeCore.Physics.world.mainCam != _cmpCamera)
                FudgeCore.Physics.world.mainCam = _cmpCamera; //DebugDraw needs to know the main camera beforehand, _cmpCamera is the viewport camera. | Marko Fehrenbach, HFU 2020
            // TODO: check physics
            if (!FudgeCore.Physics.settings || FudgeCore.Physics.settings.debugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) { //Give users the possibility to only show physics displayed | Marko Fehrenbach, HFU 2020
                Render.drawList(_cmpCamera, this.nodesSimple);
                Render.drawListAlpha(_cmpCamera);
            }
            if (FudgeCore.Physics.settings && FudgeCore.Physics.settings.debugDraw == true) {
                FudgeCore.Physics.world.debugDraw.end();
            }
        }
        static drawListAlpha(_cmpCamera) {
            function sort(_a, _b) {
                return (Reflect.get(_a, "zCamera") < Reflect.get(_b, "zCamera")) ? 1 : -1;
            }
            for (let node of Render.nodesAlpha)
                Reflect.set(node, "zCamera", _cmpCamera.pointWorldToClip(node.getComponent(FudgeCore.ComponentMesh).mtxWorld.translation).z);
            let sorted = Render.nodesAlpha.getSorted(sort);
            Render.drawList(_cmpCamera, sorted);
        }
        static drawList(_cmpCamera, _list) {
            for (let node of _list) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let mtxMeshToView = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                Render.drawMesh(cmpMesh, cmpMaterial, cmpMesh.mtxWorld, mtxMeshToView);
                FudgeCore.Recycler.store(mtxMeshToView);
            }
        }
        //#region Physics
        /**
        * Physics Part -> Take all nodes with cmpRigidbody, and overwrite their local position/rotation with the one coming from
        * the rb component, which is the new "local" WORLD position.
        */
        // private static setupPhysicalTransform(_branch: Node): void {
        //   if (Physics.world != null && Physics.world.getBodyList().length >= 1) {
        //     let mutator: Mutator = {};
        //     for (let name in _branch.getChildren()) {
        //       let childNode: Node = _branch.getChildren()[name];
        //       Render.setupPhysicalTransform(childNode);
        //       let cmpRigidbody: ComponentRigidbody = childNode.getComponent(ComponentRigidbody);
        //       if (childNode.getComponent(ComponentTransform) != null && cmpRigidbody != null) {
        //         cmpRigidbody.checkCollisionEvents();
        //         cmpRigidbody.checkTriggerEvents();
        //         if (cmpRigidbody.physicsType != PHYSICS_TYPE.KINEMATIC) { //Case of Dynamic/Static Rigidbody
        //           //Override any position/rotation, Physical Objects do not know hierachy unless it's established through physics
        //           mutator["rotation"] = cmpRigidbody.getRotation();
        //           mutator["translation"] = cmpRigidbody.getPosition();
        //           childNode.mtxLocal.mutate(mutator);
        //         }
        //         if (cmpRigidbody.physicsType == PHYSICS_TYPE.KINEMATIC) { //Case of Kinematic Rigidbody
        //           cmpRigidbody.setPosition(childNode.mtxWorld.translation);
        //           cmpRigidbody.setRotation(childNode.mtxWorld.rotation);
        //         }
        //       }
        //     }
        //   }
        // }
        static transformByPhysics(_node, _cmpRigidbody) {
            if (!FudgeCore.Physics.world?.getBodyList().length)
                return;
            if (!_node.mtxLocal) {
                throw (new Error("ComponentRigidbody requires ComponentTransform at the same Node"));
            }
            _cmpRigidbody.checkCollisionEvents();
            _cmpRigidbody.checkTriggerEvents();
            if (_cmpRigidbody.physicsType == FudgeCore.PHYSICS_TYPE.KINEMATIC) { //Case of Kinematic Rigidbody
                _cmpRigidbody.setPosition(_node.mtxWorld.translation);
                _cmpRigidbody.setRotation(_node.mtxWorld.rotation);
                return;
            }
            //Override any position/rotation, disregard hierachy not established by joints
            let mutator = {};
            mutator["rotation"] = _cmpRigidbody.getRotation();
            mutator["translation"] = _cmpRigidbody.getPosition();
            _node.mtxWorld.mutate(mutator);
            // Attention, node needs parent... but would using physics without make sense ?
            _node.mtxLocal.set(FudgeCore.Matrix4x4.RELATIVE(_node.mtxWorld, _node.getParent().mtxWorld));
        }
    }
    Render.rectClip = new FudgeCore.Rectangle(-1, 1, 2, -2);
    Render.nodesPhysics = new FudgeCore.RecycableArray();
    Render.nodesSimple = new FudgeCore.RecycableArray();
    Render.nodesAlpha = new FudgeCore.RecycableArray();
    FudgeCore.Render = Render;
    //#endregion
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Render.js.map