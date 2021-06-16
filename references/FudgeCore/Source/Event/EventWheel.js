"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * A supclass of WheelEvent. Events that occur due to the user moving a mouse wheel or similar input device.
     * */
    class EventWheel extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.EventWheel = EventWheel;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=EventWheel.js.map