"use strict";
// / <reference path="DebugTarget.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let args = _args.map(_arg => _arg.toString());
                let out = _headline + " " + FudgeCore.DebugTarget.mergeArguments(_message, args);
                alert(out);
            };
            return delegate;
        }
    }
    DebugAlert.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
        [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
        [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
        [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
        [FudgeCore.DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE])
    };
    FudgeCore.DebugAlert = DebugAlert;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=DebugAlert.js.map