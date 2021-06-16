"use strict";
// <reference path="DebugAlert.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * The filters corresponding to debug activities, more to come
     */
    let DEBUG_FILTER;
    (function (DEBUG_FILTER) {
        DEBUG_FILTER[DEBUG_FILTER["NONE"] = 0] = "NONE";
        DEBUG_FILTER[DEBUG_FILTER["INFO"] = 1] = "INFO";
        DEBUG_FILTER[DEBUG_FILTER["LOG"] = 2] = "LOG";
        DEBUG_FILTER[DEBUG_FILTER["WARN"] = 4] = "WARN";
        DEBUG_FILTER[DEBUG_FILTER["ERROR"] = 8] = "ERROR";
        DEBUG_FILTER[DEBUG_FILTER["FUDGE"] = 16] = "FUDGE";
        DEBUG_FILTER[DEBUG_FILTER["CLEAR"] = 256] = "CLEAR";
        DEBUG_FILTER[DEBUG_FILTER["GROUP"] = 257] = "GROUP";
        DEBUG_FILTER[DEBUG_FILTER["GROUPCOLLAPSED"] = 258] = "GROUPCOLLAPSED";
        DEBUG_FILTER[DEBUG_FILTER["GROUPEND"] = 260] = "GROUPEND";
        DEBUG_FILTER[DEBUG_FILTER["MESSAGES"] = 31] = "MESSAGES";
        DEBUG_FILTER[DEBUG_FILTER["FORMAT"] = 263] = "FORMAT";
        DEBUG_FILTER[DEBUG_FILTER["ALL"] = 287] = "ALL";
    })(DEBUG_FILTER = FudgeCore.DEBUG_FILTER || (FudgeCore.DEBUG_FILTER = {}));
    FudgeCore.DEBUG_SYMBOL = {
        [DEBUG_FILTER.INFO]: "✓",
        [DEBUG_FILTER.LOG]: "✎",
        [DEBUG_FILTER.WARN]: "⚠",
        [DEBUG_FILTER.ERROR]: "❌",
        [DEBUG_FILTER.FUDGE]: "🎲"
    };
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=DebugInterfaces.js.map