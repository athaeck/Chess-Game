"use strict";
// / <reference path="../Time/Loop.ts"/>
// / <reference path="../Animation/Animation.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Holds a reference to an [[Animation]] and controls it. Controls playback and playmode as well as speed.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class ComponentAnimator extends FudgeCore.Component {
        constructor(_animation = new FudgeCore.Animation(""), _playmode = FudgeCore.ANIMATION_PLAYMODE.LOOP, _playback = FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
            super();
            this.speedScalesWithGlobalSpeed = true;
            this.speedScale = 1;
            this.lastTime = 0;
            //#endregion
            //#region updateAnimation
            /**
             * Updates the Animation.
             * Gets called every time the Loop fires the LOOP_FRAME Event.
             * Uses the built-in time unless a different time is specified.
             * May also be called from updateAnimation().
             */
            this.updateAnimationLoop = (_e, _time) => {
                if (this.animation.totalTime == 0)
                    return [null, 0];
                let time = _time || this.localTime.get();
                if (this.playback == FudgeCore.ANIMATION_PLAYBACK.FRAMEBASED) {
                    time = this.lastTime + (1000 / this.animation.fps);
                }
                let direction = this.animation.calculateDirection(time, this.playmode);
                time = this.animation.getModalTime(time, this.playmode, this.localTime.getOffset());
                this.executeEvents(this.animation.getEventsToFire(this.lastTime, time, this.playback, direction));
                if (this.lastTime != time) {
                    this.lastTime = time;
                    time = time % this.animation.totalTime;
                    let mutator = this.animation.getMutated(time, direction, this.playback);
                    if (this.getContainer()) {
                        this.getContainer().applyAnimation(mutator);
                    }
                    return [mutator, time];
                }
                return [null, time];
            };
            this.animation = _animation;
            this.playmode = _playmode;
            this.playback = _playback;
            this.localTime = new FudgeCore.Time();
            //TODO: update animation total time when loading a different animation?
            this.animation.calculateTotalTime();
            FudgeCore.Time.game.addEventListener("timeScaled" /* TIME_SCALED */, this.updateScale.bind(this));
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, () => this.activate(false));
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, () => {
                this.getContainer().addEventListener("childRemove" /* CHILD_REMOVE */, () => this.activate(false));
                this.activate(true);
            });
        }
        set speed(_s) {
            this.speedScale = _s;
            this.updateScale();
        }
        activate(_on) {
            super.activate(_on);
            if (!this.getContainer())
                return;
            if (_on)
                this.getContainer().addEventListener("renderPrepare" /* RENDER_PREPARE */, this.updateAnimationLoop);
            else
                this.getContainer().removeEventListener("renderPrepare" /* RENDER_PREPARE */, this.updateAnimationLoop);
        }
        /**
         * Jumps to a certain time in the animation to play from there.
         */
        jumpTo(_time) {
            this.localTime.set(_time);
            this.lastTime = _time;
            _time = _time % this.animation.totalTime;
            let mutator = this.animation.getMutated(_time, this.animation.calculateDirection(_time, this.playmode), this.playback);
            this.getContainer().applyAnimation(mutator);
        }
        /**
         * Returns the current time of the animation, modulated for animation length.
         */
        getCurrentTime() {
            return this.localTime.get() % this.animation.totalTime;
        }
        /**
         * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
         * @param _time the (unscaled) time to update the animation with.
         * @returns a Tupel containing the Mutator for Animation and the playmode corrected time.
         */
        updateAnimation(_time) {
            return this.updateAnimationLoop(null, _time);
        }
        //#region transfer
        serialize() {
            let s = super.serialize();
            s["animation"] = this.animation.serialize();
            s["playmode"] = this.playmode;
            s["playback"] = this.playback;
            s["speedScale"] = this.speedScale;
            s["speedScalesWithGlobalSpeed"] = this.speedScalesWithGlobalSpeed;
            s[super.constructor.name] = super.serialize();
            return s;
        }
        async deserialize(_s) {
            this.animation = new FudgeCore.Animation("");
            this.animation.deserialize(_s.animation);
            this.playback = _s.playback;
            this.playmode = _s.playmode;
            this.speedScale = _s.speedScale;
            this.speedScalesWithGlobalSpeed = _s.speedScalesWithGlobalSpeed;
            super.deserialize(_s[super.constructor.name]);
            return this;
        }
        /**
         * Fires all custom events the Animation should have fired between the last frame and the current frame.
         * @param events a list of names of custom events to fire
         */
        executeEvents(events) {
            for (let i = 0; i < events.length; i++) {
                this.dispatchEvent(new Event(events[i]));
            }
        }
        /**   MOVED TO ANIMATION, TODO: delete
         * Calculates the actual time to use, using the current playmodes.
         * @param _time the time to apply the playmodes to
         * @returns the recalculated time
         */
        // private applyPlaymodes(_time: number): number {
        //   switch (this.playmode) {
        //     case ANIMATION_PLAYMODE.STOP:
        //       return this.localTime.getOffset();
        //     case ANIMATION_PLAYMODE.PLAYONCE:
        //       if (_time >= this.animation.totalTime)
        //         return this.animation.totalTime - 0.01;     //TODO: this might cause some issues
        //       else return _time;
        //     case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
        //       if (_time >= this.animation.totalTime)
        //         return this.animation.totalTime + 0.01;     //TODO: this might cause some issues
        //       else return _time;
        //     default:
        //       return _time;
        //   }
        // }
        /**
         * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
         */
        updateScale() {
            let newScale = this.speedScale;
            if (this.speedScalesWithGlobalSpeed)
                newScale *= FudgeCore.Time.game.getScale();
            this.localTime.setScale(newScale);
        }
    }
    ComponentAnimator.iSubclass = FudgeCore.Component.registerSubclass(ComponentAnimator);
    FudgeCore.ComponentAnimator = ComponentAnimator;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentAnimator.js.map