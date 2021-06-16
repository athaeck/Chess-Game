"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.
     * Supports [[Timer]]s similar to window.setInterval but with respect to the scaled time.
     * All time values are given in milliseconds
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time extends FudgeCore.EventTargetƒ {
        constructor() {
            super();
            this.timers = {};
            this.idTimerAddedLast = 0;
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }
        /**
         * Returns the game-time-object which starts automatically and serves as base for various internal operations.
         */
        // public static get game(): Time {
        //   return Time.gameTime;
        // }
        static getUnits(_milliseconds) {
            let units = {};
            units.asSeconds = _milliseconds / 1000;
            units.asMinutes = units.asSeconds / 60;
            units.asHours = units.asMinutes / 60;
            units.hours = Math.floor(units.asHours);
            units.minutes = Math.floor(units.asMinutes) % 60;
            units.seconds = Math.floor(units.asSeconds) % 60;
            units.fraction = _milliseconds % 1000;
            units.thousands = _milliseconds % 10;
            units.hundreds = _milliseconds % 100 - units.thousands;
            units.tenths = units.fraction - units.hundreds - units.thousands;
            return units;
        }
        //#region Get/Set time and scaling
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get() {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        /**
         * Returns the remaining time to the given point of time
         */
        getRemainder(_to) {
            return _to - this.get();
        }
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time = 0) {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1)
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale = 1.0) {
            this.set(this.get());
            this.scale = _scale;
            //TODO: catch scale=0
            this.rescaleAllTimers();
            this.getElapsedSincePreviousCall();
            this.dispatchEvent(new Event("timeScaled" /* TIME_SCALED */));
        }
        /**
         * Retrieves the current scaling of this time
         */
        getScale() {
            return this.scale;
        }
        /**
         * Retrieves the offset of this time
         */
        getOffset() {
            return this.offset;
        }
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall() {
            let current = this.get();
            let elapsed = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
        //#endregion
        //#region Timers
        /**
         * Returns a Promise<void> to be resolved after the time given. To be used with async/await
         */
        delay(_lapse) {
            return new Promise(_resolve => this.setTimer(_lapse, 1, () => _resolve()));
        }
        // TODO: examine if web-workers would enhance performance here!
        /**
         * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers() {
            for (let id in this.timers) {
                this.deleteTimer(Number(id));
            }
        }
        /**
         * Deletes [[Timer]] found using the internal id of the connected interval-object
         * @param _id
         */
        deleteTimerByItsInternalId(_id) {
            for (let id in this.timers) {
                let timer = this.timers[id];
                if (timer.id == _id) {
                    timer.clear();
                    delete this.timers[id];
                    // TODO: check if an early out is OK here... should be!
                }
            }
        }
        /**
         * Installs a timer at this time object
         * @param _lapse The object-time to elapse between the calls to _callback
         * @param _count The number of calls desired, 0 = Infinite
         * @param _handler The function to call each the given lapse has elapsed
         * @param _arguments Additional parameters to pass to callback function
         */
        setTimer(_lapse, _count, _handler, ..._arguments) {
            // tslint:disable-next-line: no-unused-expression
            new FudgeCore.Timer(this, _lapse, _count, _handler, _arguments);
            //this.addTimer(timer);
            return this.idTimerAddedLast;
        }
        /**
         * This method is called internally by [[Time]] and [[Timer]] and must not be called otherwise
         */
        addTimer(_timer) {
            this.timers[++this.idTimerAddedLast] = _timer;
            return this.idTimerAddedLast;
        }
        /**
         * Deletes the timer with the id given by this time object
         */
        deleteTimer(_id) {
            let timer = this.timers[_id];
            if (!timer)
                return;
            timer.clear();
            delete this.timers[_id];
        }
        /**
         * Returns a reference to the timer with the given id or null if not found.
         */
        getTimer(_id) {
            return this.timers[_id];
        }
        /**
         * Returns a copy of the list of timers currently installed on this time object
         */
        getTimers() {
            let result = {};
            return Object.assign(result, this.timers);
        }
        /**
         * Returns true if there are [[Timers]] installed to this
         */
        hasTimers() {
            return (Object.keys(this.timers).length > 0);
        }
        /**
         * Recreates [[Timer]]s when scaling changes
         */
        rescaleAllTimers() {
            for (let id in this.timers) {
                let timer = this.timers[id];
                timer.clear();
                if (!this.scale)
                    // Time has stopped, no need to replace cleared timers
                    continue;
                this.timers[id] = timer.installCopy();
            }
        }
    }
    /** Standard game time starting automatically with the application */
    Time.game = new Time();
    FudgeCore.Time = Time;
    //#endregion
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Time.js.map