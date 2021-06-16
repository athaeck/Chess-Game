"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * a subclass of PointerEvent. The state of a DOM event produced by a pointer such as the geometry of the contact point
     * */
    class EventPointer extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.EventPointer = EventPointer;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=EventPointer.js.map