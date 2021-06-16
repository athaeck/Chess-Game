"use strict";
// /<reference path="../Event/Event.ts"/>
// /<reference path="../Time/Time.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Determines the mode a loop runs in
     */
    let LOOP_MODE;
    (function (LOOP_MODE) {
        /** Loop cycles controlled by window.requestAnimationFrame */
        LOOP_MODE["FRAME_REQUEST"] = "frameRequest";
        /** Loop cycles with the given framerate in [[Time]].game */
        LOOP_MODE["TIME_GAME"] = "timeGame";
        /** Loop cycles with the given framerate in realtime, independent of [[Time]].game */
        LOOP_MODE["TIME_REAL"] = "timeReal";
    })(LOOP_MODE = FudgeCore.LOOP_MODE || (FudgeCore.LOOP_MODE = {}));
    /**
     * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
     * It then fires [[EVENT]].LOOP\_FRAME to all added listeners at each frame
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Loop extends FudgeCore.EventTargetStatic {
        /** The gametime the loop was started, overwritten at each start */
        static get timeStartGame() { return Loop.ƒTimeStartGame; }
        /** The realtime the loop was started, overwritten at each start */
        static get timeStartReal() { return Loop.ƒTimeStartReal; }
        /** The gametime elapsed since the last loop cycle */
        static get timeFrameGame() { return Loop.ƒTimeFrameGame; }
        /** The realtime elapsed since the last loop cycle */
        static get timeFrameReal() { return Loop.ƒTimeFrameReal; }
        /** The gametime the last loop cycle started*/
        static get timeFrameStartGame() { return Loop.ƒTimeFrameStartGame; }
        /** The realtime the last loop cycle started*/
        static get timeFrameStartReal() { return Loop.ƒTimeFrameStartReal; }
        /** The average number of frames per second in gametime */
        static get fpsGameAverage() { return 1000 / Loop.ƒTimeLastFrameGameAvg; }
        /** The average number of frames per second in realtime */
        static get fpsRealAverage() { return 1000 / Loop.ƒTimeLastFrameRealAvg; }
        /** The number of frames triggered so far */
        static get frames() { return Loop.ƒFrames; }
        /**
         * Starts the loop with the given mode and fps
         * @param _mode
         * @param _fps Is only applicable in TIME-modes
         * @param _syncWithAnimationFrame Experimental and only applicable in TIME-modes. Should defer the loop-cycle until the next possible animation frame.
         */
        static start(_mode = LOOP_MODE.FRAME_REQUEST, _fps = 60, _syncWithAnimationFrame = false) {
            Loop.stop();
            Loop.ƒTimeStartGame = FudgeCore.Time.game.get();
            Loop.ƒTimeStartReal = performance.now();
            Loop.ƒTimeFrameStartGame = Loop.ƒTimeStartGame;
            Loop.ƒTimeFrameStartReal = Loop.ƒTimeStartReal;
            Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
            Loop.framesToAverage = Loop.fpsDesired;
            Loop.ƒTimeLastFrameGameAvg = Loop.ƒTimeLastFrameRealAvg = 1000 / Loop.fpsDesired;
            Loop.mode = _mode;
            Loop.syncWithAnimationFrame = _syncWithAnimationFrame;
            let log = `Loop starting in mode ${Loop.mode}`;
            if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
                log += ` with attempted ${_fps} fps`;
            FudgeCore.Debug.fudge(log);
            switch (_mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    Loop.loopFrame();
                    break;
                case LOOP_MODE.TIME_REAL:
                    Loop.idIntervall = window.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                case LOOP_MODE.TIME_GAME:
                    Loop.idIntervall = FudgeCore.Time.game.setTimer(1000 / Loop.fpsDesired, 0, Loop.loopTime);
                    Loop.loopTime();
                    break;
                default:
                    break;
            }
            Loop.running = true;
        }
        /**
         * Stops the loop
         */
        static stop() {
            if (!Loop.running)
                return;
            switch (Loop.mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_REAL:
                    window.clearInterval(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_GAME:
                    FudgeCore.Time.game.deleteTimer(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                default:
                    break;
            }
            Loop.running = false;
            FudgeCore.Debug.fudge("Loop stopped!");
        }
        static continue() {
            if (Loop.running)
                return;
            Loop.start(Loop.mode, Loop.fpsDesired, Loop.syncWithAnimationFrame);
        }
        static loop() {
            let time;
            time = performance.now();
            Loop.ƒTimeFrameReal = time - Loop.ƒTimeFrameStartReal;
            Loop.ƒTimeFrameStartReal = time;
            time = FudgeCore.Time.game.get();
            Loop.ƒTimeFrameGame = time - Loop.ƒTimeFrameStartGame;
            Loop.ƒTimeFrameStartGame = time;
            Loop.ƒTimeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameGameAvg + Loop.ƒTimeFrameGame) / Loop.framesToAverage;
            Loop.ƒTimeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameRealAvg + Loop.ƒTimeFrameReal) / Loop.framesToAverage;
            // TODO: consider LoopEvent which conveys information such as timeElapsed etc...
            Loop.ƒFrames++;
            let event = new Event("loopFrame" /* LOOP_FRAME */);
            Loop.targetStatic.dispatchEvent(event);
        }
        static loopFrame() {
            Loop.loop();
            Loop.idRequest = window.requestAnimationFrame(Loop.loopFrame);
        }
        static loopTime() {
            if (Loop.syncWithAnimationFrame)
                Loop.idRequest = window.requestAnimationFrame(Loop.loop);
            else
                Loop.loop();
        }
    }
    Loop.ƒTimeStartGame = 0;
    Loop.ƒTimeStartReal = 0;
    Loop.ƒTimeFrameGame = 0;
    Loop.ƒTimeFrameReal = 0;
    Loop.ƒTimeFrameStartGame = 0;
    Loop.ƒTimeFrameStartReal = 0;
    Loop.ƒTimeLastFrameGameAvg = 0;
    Loop.ƒTimeLastFrameRealAvg = 0;
    Loop.ƒFrames = 0;
    Loop.running = false;
    Loop.mode = LOOP_MODE.FRAME_REQUEST;
    Loop.idIntervall = 0;
    Loop.idRequest = 0;
    Loop.fpsDesired = 30;
    Loop.framesToAverage = 30;
    Loop.syncWithAnimationFrame = false;
    FudgeCore.Loop = Loop;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Loop.js.map