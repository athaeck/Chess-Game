"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * a subclass of DragEvent .A event that represents a drag and drop interaction
     */
    class EventDragDrop extends DragEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.EventDragDrop = EventDragDrop;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=EventDragDrop.js.map