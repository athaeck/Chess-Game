"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    class Recycler {
        /**
         * Fetches an object of the requested type from the depot, or returns a new one, if the depot was empty
         * @param _T The class identifier of the desired object
         */
        static get(_T) {
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (instances && instances.length > 0)
                return instances.pop();
            else
                return new _T();
        }
        /**
         * Returns a reference to an object of the requested type in the depot, but does not remove it there.
         * If no object of the requested type was in the depot, one is created, stored and borrowed.
         * For short term usage of objects in a local scope, when there will be no other call to Recycler.get or .borrow!
         * @param _T The class identifier of the desired object
         */
        static borrow(_T) {
            let t;
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (!instances || instances.length == 0) {
                t = new _T();
                Recycler.store(t);
                return t;
            }
            return instances[0];
        }
        /**
         * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope and are not referenced by any other
         * @param _instance
         */
        static store(_instance) {
            let key = _instance.constructor.name;
            //Debug.log(key);
            let instances = Recycler.depot[key] || [];
            instances.push(_instance);
            Recycler.depot[key] = instances;
            // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
            //Debug.log(this.depot);
        }
        /**
         * Emptys the depot of a given type, leaving the objects for the garbage collector. May result in a short stall when many objects were in
         * @param _T
         */
        static dump(_T) {
            let key = _T.name;
            Recycler.depot[key] = [];
        }
        /**
         * Emptys all depots, leaving all objects to the garbage collector. May result in a short stall when many objects were in
         */
        static dumpAll() {
            Recycler.depot = {};
        }
    }
    Recycler.depot = {};
    FudgeCore.Recycler = Recycler;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Recycler.js.map