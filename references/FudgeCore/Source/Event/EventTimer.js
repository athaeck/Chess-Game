"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * An event that represents a call from a Timer
     * */
    class EventTimer {
        constructor(_timer, ..._arguments) {
            this.type = "\u0192lapse" /* CALL */;
            this.firstCall = true;
            this.lastCall = false;
            this.target = _timer;
            this.arguments = _arguments;
            this.firstCall = true;
        }
    }
    FudgeCore.EventTimer = EventTimer;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=EventTimer.js.map