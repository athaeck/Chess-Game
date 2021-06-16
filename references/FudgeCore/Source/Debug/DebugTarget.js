"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    class DebugTarget {
        static mergeArguments(_message, ..._args) {
            let out = _message.toString(); //JSON.stringify(_message);
            for (let arg of _args)
                if (arg instanceof Number)
                    out += ", " + arg.toPrecision(2).toString(); //JSON.stringify(arg, null, 2);
                else
                    out += ", " + arg.toString(); //JSON.stringify(arg, null, 2);
            return out;
        }
    }
    FudgeCore.DebugTarget = DebugTarget;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=DebugTarget.js.map