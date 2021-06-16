"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Processes input signals of type number and generates an output signal of the same type using
     * proportional, integral or differential mapping, an amplification factor and a linear dampening/delay
     * ```plaintext
     *          ┌─────────────────────────────────────────────────────────────┐
     *          │   ┌───────┐   ┌─────┐      pass through (Proportional)      │
     *  Input → │ → │amplify│ → │delay│ → ⚟ sum up over time (Integral) ⚞ → │ → Output
     *          │   └───────┘   └─────┘      pass change  (Differential)      │
     *          └─────────────────────────────────────────────────────────────┘
     * ```
     */
    class Control extends EventTarget {
        constructor(_name, _factor = 1, _type = 0 /* PROPORTIONAL */, _active = true) {
            super();
            this.rateDispatchOutput = 0;
            this.valuePrevious = 0;
            this.outputBase = 0;
            this.outputTarget = 0;
            this.outputPrevious = 0;
            this.outputTargetPrevious = 0;
            this.factor = 0;
            this.time = FudgeCore.Time.game;
            this.timeValueDelay = 0;
            this.timeOutputTargetSet = 0;
            this.idTimer = undefined;
            this.dispatchOutput = (_eventOrValue) => {
                if (!this.active)
                    return;
                let timer = this.time.getTimer(this.idTimer);
                let output;
                if (typeof (_eventOrValue) == "number")
                    output = _eventOrValue;
                else
                    output = this.calculateOutput();
                let outputChanged = (output != this.outputPrevious);
                if (timer) {
                    timer.active = outputChanged;
                    if (!outputChanged)
                        return;
                }
                this.outputPrevious = output;
                let event = new CustomEvent("output" /* OUTPUT */, {
                    detail: {
                        output: output
                    }
                });
                this.dispatchEvent(event);
            };
            this.factor = _factor;
            this.type = _type;
            this.active = _active;
            this.name = _name;
        }
        /**
         * Set the time-object to be used when calculating the output in [[CONTROL_TYPE.INTEGRAL]]
         */
        setTimebase(_time) {
            this.time = _time;
            this.calculateOutput();
        }
        /**
         * Feed an input value into this control and fire the events [[EVENT_CONTROL.INPUT]] and [[EVENT_CONTROL.OUTPUT]]
         */
        setInput(_input) {
            if (!this.active)
                return;
            this.outputBase = this.calculateOutput();
            this.valuePrevious = this.getValueDelayed();
            this.outputTarget = this.factor * _input;
            this.timeOutputTargetSet = this.time.get();
            if (this.type == 2 /* DIFFERENTIAL */) {
                this.valuePrevious = this.outputTarget - this.outputTargetPrevious;
                this.outputTargetPrevious = this.outputTarget;
                this.outputTarget = 0;
            }
            this.dispatchEvent(new Event("input" /* INPUT */));
            if (this.type == 2 /* DIFFERENTIAL */)
                this.dispatchOutput(this.valuePrevious);
            else
                this.dispatchOutput(null);
        }
        pulse(_input) {
            this.setInput(_input);
            this.setInput(0);
        }
        /**
         * Set the time to take for the internal linear dampening until the final ouput value is reached
         */
        setDelay(_time) {
            this.timeValueDelay = Math.max(0, _time);
        }
        /**
         * Set the number of output-events to dispatch per second.
         * At the default of 0, the control output must be polled and will only actively dispatched once each time input occurs and the output changes.
         */
        setRateDispatchOutput(_rateDispatchOutput = 0) {
            this.rateDispatchOutput = _rateDispatchOutput;
            this.time.deleteTimer(this.idTimer);
            this.idTimer = undefined;
            if (this.rateDispatchOutput)
                this.idTimer = this.time.setTimer(1000 / this.rateDispatchOutput, 0, this.dispatchOutput);
        }
        /**
         * Set the factor to multiply the input value given with [[setInput]] with
         */
        setFactor(_factor) {
            this.factor = _factor;
        }
        /**
         * Get the value from the output of this control
         */
        getOutput() {
            return this.calculateOutput();
        }
        /**
         * Calculates the output of this control
         */
        calculateOutput() {
            let output = 0;
            let value = this.getValueDelayed();
            switch (this.type) {
                case 1 /* INTEGRAL */:
                    let timeCurrent = this.time.get();
                    let timeElapsedSinceInput = timeCurrent - this.timeOutputTargetSet;
                    output = this.outputBase;
                    if (this.timeValueDelay > 0) {
                        if (timeElapsedSinceInput < this.timeValueDelay) {
                            output += 0.5 * (this.valuePrevious + value) * timeElapsedSinceInput;
                            break;
                        }
                        else {
                            output += 0.5 * (this.valuePrevious + value) * this.timeValueDelay;
                            timeElapsedSinceInput -= this.timeValueDelay;
                        }
                    }
                    output += value * timeElapsedSinceInput;
                    // value += 0.5 * (this.inputPrevious - input) * this.timeInputDelay + input * timeElapsedSinceInput;
                    break;
                case 2 /* DIFFERENTIAL */:
                case 0 /* PROPORTIONAL */:
                default:
                    output = value;
                    break;
            }
            return output;
        }
        getValueDelayed() {
            if (this.timeValueDelay > 0) {
                let timeElapsedSinceInput = this.time.get() - this.timeOutputTargetSet;
                if (timeElapsedSinceInput < this.timeValueDelay)
                    return this.valuePrevious + (this.outputTarget - this.valuePrevious) * timeElapsedSinceInput / this.timeValueDelay;
            }
            return this.outputTarget;
        }
    }
    FudgeCore.Control = Control;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Control.js.map