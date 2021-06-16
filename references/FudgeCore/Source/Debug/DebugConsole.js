"use strict";
// / <reference path="DebugTarget.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends FudgeCore.DebugTarget {
        /**
         * Displays critical information about failures, which is emphasized e.g. by color
         */
        static fudge(_message, ..._args) {
            console.debug("🎲", _message, ..._args);
            // let trace: string[] = new Error("Test").stack.split("\n");
            // console.log(trace[4]);
            // console.trace("Test");
        }
    }
    DebugConsole.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: console.info,
        [FudgeCore.DEBUG_FILTER.LOG]: console.log,
        [FudgeCore.DEBUG_FILTER.WARN]: console.warn,
        [FudgeCore.DEBUG_FILTER.ERROR]: console.error,
        [FudgeCore.DEBUG_FILTER.FUDGE]: DebugConsole.fudge,
        [FudgeCore.DEBUG_FILTER.CLEAR]: console.clear,
        [FudgeCore.DEBUG_FILTER.GROUP]: console.group,
        [FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED]: console.groupCollapsed,
        [FudgeCore.DEBUG_FILTER.GROUPEND]: console.groupEnd
    };
    FudgeCore.DebugConsole = DebugConsole;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=DebugConsole.js.map