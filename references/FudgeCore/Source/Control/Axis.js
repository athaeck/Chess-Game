"use strict";
///<reference path="Control.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Handles multiple controls as inputs and creates an output from that.
     * As a subclass of [[Control]], axis calculates the ouput summing up the inputs and processing the result using its own settings.
     * Dispatches [[EVENT_CONTROL.OUTPUT]] and [[EVENT_CONTROL.INPUT]] when one of the controls dispatches them.
     * ```plaintext
     *           ┌───────────────────────────────────────────┐
     *           │ ┌───────┐                                 │
     *   Input → │ │control│\                                │
     *           │ └───────┘ \                               │
     *           │ ┌───────┐  \┌───┐   ┌─────────────────┐   │
     *   Input → │ │control│---│sum│ → │internal control │ → │ → Output
     *           │ └───────┘  /└───┘   └─────────────────┘   │
     *           │ ┌───────┐ /                               │
     *   Input → │ │control│/                                │
     *           │ └───────┘                                 │
     *           └───────────────────────────────────────────┘
     * ```
     */
    class Axis extends FudgeCore.Control {
        constructor() {
            super(...arguments);
            this.controls = new Map();
            this.sumPrevious = 0;
            this.hndOutputEvent = (_event) => {
                if (!this.active)
                    return;
                let control = _event.target;
                let event = new CustomEvent("output" /* OUTPUT */, { detail: {
                        control: control,
                        input: _event.detail.output,
                        output: this.getOutput()
                    } });
                this.dispatchEvent(event);
            };
            this.hndInputEvent = (_event) => {
                if (!this.active)
                    return;
                let event = new Event("input" /* INPUT */, _event);
                this.dispatchEvent(event);
            };
        }
        /**
         * Add the control given to the list of controls feeding into this axis
         */
        addControl(_control) {
            this.controls.set(_control.name, _control);
            _control.addEventListener("input" /* INPUT */, this.hndInputEvent);
            _control.addEventListener("output" /* OUTPUT */, this.hndOutputEvent);
        }
        /**
         * Returns the control with the given name
         */
        getControl(_name) {
            return this.controls.get(_name);
        }
        /**
         * Removes the control with the given name
         */
        removeControl(_name) {
            let control = this.getControl(_name);
            if (control) {
                control.removeEventListener("input" /* INPUT */, this.hndInputEvent);
                control.removeEventListener("output" /* OUTPUT */, this.hndOutputEvent);
                this.controls.delete(_name);
            }
        }
        /**
         * Returns the value of this axis after summing up all inputs and processing the sum according to the axis' settings
         */
        getOutput() {
            let sumInput = 0;
            for (let control of this.controls) {
                if (control[1].active)
                    sumInput += control[1].getOutput();
            }
            if (sumInput != this.sumPrevious)
                super.setInput(sumInput);
            this.sumPrevious = sumInput;
            return super.getOutput();
        }
    }
    FudgeCore.Axis = Axis;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Axis.js.map