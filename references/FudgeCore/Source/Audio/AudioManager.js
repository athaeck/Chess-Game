"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Extends the standard AudioContext for integration with FUDGE-graphs.
     * Creates a default object at startup to be addressed as AudioManager default.
     * Other objects of this class may be create for special purposes.
     */
    class AudioManager extends AudioContext {
        constructor(contextOptions) {
            super(contextOptions);
            this.graph = null;
            this.cmpListener = null;
            /**
             * Determines FUDGE-graph to listen to. Each [[ComponentAudio]] in the graph will connect to this contexts master gain, all others disconnect.
             */
            this.listenTo = (_graph) => {
                if (this.graph)
                    this.graph.broadcastEvent(new Event("childRemoveFromAudioGraph" /* CHILD_REMOVE */));
                if (!_graph)
                    return;
                this.graph = _graph;
                this.graph.broadcastEvent(new Event("childAppendToAudioGraph" /* CHILD_APPEND */));
            };
            /**
             * Retrieve the FUDGE-graph currently listening to
             */
            this.getGraphListeningTo = () => {
                return this.graph;
            };
            /**
             * Set the [[ComponentAudioListener]] that serves the spatial location and orientation for this contexts listener
             */
            this.listenWith = (_cmpListener) => {
                this.cmpListener = _cmpListener;
            };
            /**
             * Updates the spatial settings of the AudioNodes effected in the current FUDGE-graph
             */
            this.update = () => {
                this.graph.broadcastEvent(new Event("updateAudioGraph" /* UPDATE */));
                if (this.cmpListener)
                    this.cmpListener.update(this.listener);
            };
            this.gain = this.createGain();
            this.gain.connect(this.destination);
        }
        /**
         * Set the master volume
         */
        set volume(_value) {
            this.gain.gain.value = _value;
        }
        /**
         * Get the master volume
         */
        get volume() {
            return this.gain.gain.value;
        }
    }
    /** The default context that may be used throughout the project without the need to create others */
    AudioManager.default = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    FudgeCore.AudioManager = AudioManager;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=AudioManager.js.map