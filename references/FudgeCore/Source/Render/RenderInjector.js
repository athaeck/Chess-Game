"use strict";
var FudgeCore;
(function (FudgeCore) {
    //Baseclass for [[RenderInjectorCoat]] and [[RenderInjectorTexture]]
    class RenderInjector {
        static inject(_constructor, _injector) {
            let injection = Reflect.get(_injector, "inject" + _constructor.name);
            if (!injection) {
                FudgeCore.Debug.error("No injection decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: injection
            });
        }
    }
    FudgeCore.RenderInjector = RenderInjector;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RenderInjector.js.map