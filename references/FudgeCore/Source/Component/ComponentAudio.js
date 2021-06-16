"use strict";
var FudgeCore;
(function (FudgeCore) {
    let AUDIO_PANNER;
    (function (AUDIO_PANNER) {
        AUDIO_PANNER["CONE_INNER_ANGLE"] = "coneInnerAngle";
        AUDIO_PANNER["CONE_OUTER_ANGLE"] = "coneOuterAngle";
        AUDIO_PANNER["CONE_OUTER_GAIN"] = "coneOuterGain";
        AUDIO_PANNER["DISTANCE_MODEL"] = "distanceModel";
        AUDIO_PANNER["MAX_DISTANCE"] = "maxDistance";
        AUDIO_PANNER["PANNING_MODEL"] = "panningModel";
        AUDIO_PANNER["REF_DISTANCE"] = "refDistance";
        AUDIO_PANNER["ROLLOFF_FACTOR"] = "rolloffFactor";
    })(AUDIO_PANNER = FudgeCore.AUDIO_PANNER || (FudgeCore.AUDIO_PANNER = {}));
    let AUDIO_NODE_TYPE;
    (function (AUDIO_NODE_TYPE) {
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["SOURCE"] = 0] = "SOURCE";
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["PANNER"] = 1] = "PANNER";
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["GAIN"] = 2] = "GAIN";
    })(AUDIO_NODE_TYPE = FudgeCore.AUDIO_NODE_TYPE || (FudgeCore.AUDIO_NODE_TYPE = {}));
    /**
     * Builds a minimal audio graph (by default in [[AudioManager]].default) and synchronizes it with the containing [[Node]]
     * ```plaintext
     * ┌ AudioManager(.default) ────────────────────────┐
     * │ ┌ ComponentAudio ───────────────────┐          │
     * │ │    ┌──────┐   ┌──────┐   ┌──────┐ │ ┌──────┐ │
     * │ │    │source│ → │panner│ → │ gain │ → │ gain │ │
     * │ │    └──────┘   └──────┘   └──────┘ │ └──────┘ │
     * │ └───────────────────────────────────┘          │
     * └────────────────────────────────────────────────┘
     * ```
     * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentAudio extends FudgeCore.Component {
        constructor(_audio = null, _loop = false, _start = false, _audioManager = FudgeCore.AudioManager.default) {
            super();
            /** places and directs the panner relative to the world transform of the [[Node]]  */
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.singleton = false;
            this.playing = false;
            this.listened = false;
            //#endregion
            this.hndAudioReady = (_event) => {
                FudgeCore.Debug.fudge("Audio start", Reflect.get(_event.target, "url"));
                if (this.playing)
                    this.play(true);
            };
            this.hndAudioEnded = (_event) => {
                // Debug.fudge("Audio ended", Reflect.get(_event.target, "url"));
                this.playing = false;
            };
            /**
             * Automatically connects/disconnects AudioNodes when adding/removing this component to/from a node.
             * Therefore unused AudioNodes may be garbage collected when an unused component is collected
             */
            this.handleAttach = (_event) => {
                // Debug.log(_event);
                if (_event.type == "componentAdd" /* COMPONENT_ADD */) {
                    this.getContainer().addEventListener("childAppendToAudioGraph" /* CHILD_APPEND */, this.handleGraph, true);
                    this.getContainer().addEventListener("childRemoveFromAudioGraph" /* CHILD_REMOVE */, this.handleGraph, true);
                    this.getContainer().addEventListener("updateAudioGraph" /* UPDATE */, this.update, true);
                    this.listened = this.getContainer().isDescendantOf(FudgeCore.AudioManager.default.getGraphListeningTo());
                }
                else {
                    this.getContainer().removeEventListener("childAppendToAudioGraph" /* CHILD_APPEND */, this.handleGraph, true);
                    this.getContainer().removeEventListener("childRemoveFromAudioGraph" /* CHILD_REMOVE */, this.handleGraph, true);
                    this.getContainer().removeEventListener("updateAudioGraph" /* UPDATE */, this.update, true);
                    this.listened = false;
                }
                this.updateConnection();
            };
            /**
             * Automatically connects/disconnects AudioNodes when appending/removing the FUDGE-graph the component is in.
             */
            this.handleGraph = (_event) => {
                // Debug.log(_event);
                this.listened = (_event.type == "childAppendToAudioGraph" /* CHILD_APPEND */);
                this.updateConnection();
            };
            /**
             * Updates the panner node, its position and direction, using the worldmatrix of the container and the pivot of this component.
             */
            this.update = (_event) => {
                let mtxResult = this.mtxPivot;
                if (this.getContainer())
                    mtxResult = FudgeCore.Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.mtxPivot);
                // Debug.log(mtxResult.toString());
                let position = mtxResult.translation;
                let forward = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Z(1), mtxResult, false);
                this.panner.positionX.value = position.x;
                this.panner.positionY.value = position.y;
                this.panner.positionZ.value = position.z;
                this.panner.orientationX.value = forward.x;
                this.panner.orientationY.value = forward.y;
                this.panner.orientationZ.value = forward.z;
            };
            this.install(_audioManager);
            this.createSource(_audio, _loop);
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.handleAttach);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.handleAttach);
            if (_start)
                this.play(_start);
        }
        set volume(_value) {
            this.gain.gain.value = _value;
        }
        get volume() {
            return this.gain.gain.value;
        }
        get isPlaying() {
            return this.playing;
        }
        get isAttached() {
            return this.getContainer() != null;
        }
        get isListened() {
            return this.listened;
        }
        setAudio(_audio) {
            this.createSource(_audio, this.source.loop);
        }
        /**
         * Set the property of the panner to the given value. Use to manipulate range and rolloff etc.
         */
        setPanner(_property, _value) {
            Object.assign(this.panner, { [_property]: _value });
        }
        // TODO: may be used for serialization of AudioNodes
        getMutatorOfNode(_type) {
            let node = this.getAudioNode(_type);
            let mutator = FudgeCore.getMutatorOfArbitrary(node);
            return mutator;
        }
        /**
         * Returns the specified AudioNode of the standard graph for further manipulation
         */
        getAudioNode(_type) {
            switch (_type) {
                case AUDIO_NODE_TYPE.SOURCE: return this.source;
                case AUDIO_NODE_TYPE.PANNER: return this.panner;
                case AUDIO_NODE_TYPE.GAIN: return this.gain;
            }
        }
        /**
         * Start or stop playing the audio
         */
        play(_on) {
            if (_on) {
                if (this.audio.isReady) {
                    this.createSource(this.audio, this.source.loop);
                    this.source.start(0, 0);
                }
                else {
                    this.audio.addEventListener("ready" /* READY */, this.hndAudioReady);
                }
                this.source.addEventListener("ended" /* ENDED */, this.hndAudioEnded);
            }
            else
                try {
                    this.source.stop();
                }
                catch (_error) { /* catch exception when source hasn't been started... */ }
            this.playing = _on;
        }
        /**
         * Inserts AudioNodes between the panner and the local gain of this [[ComponentAudio]]
         * _input and _output may be the same AudioNode, if there is only one to insert,
         * or may have multiple AudioNode between them to create an effect-graph.\
         * Note that [[ComponentAudio]] does not keep track of inserted AudioNodes!
         * ```plaintext
         * ┌ AudioManager(.default) ──────────────────────────────────────────────────────┐
         * │ ┌ ComponentAudio ─────────────────────────────────────────────────┐          │
         * │ │    ┌──────┐   ┌──────┐   ┌──────┐          ┌───────┐   ┌──────┐ │ ┌──────┐ │
         * │ │    │source│ → │panner│ → │_input│ → ...  → │_output│ → │ gain │ → │ gain │ │
         * │ │    └──────┘   └──────┘   └──────┘          └───────┘   └──────┘ │ └──────┘ │
         * │ └─────────────────────────────────────────────────────────────────┘          │
         * └──────────────────────────────────────────────────────────────────────────────┘
         * ```
         */
        insertAudioNodes(_input, _output) {
            this.panner.disconnect(0);
            if (!_input && !_output) {
                this.panner.connect(this.gain);
                return;
            }
            this.panner.connect(_input);
            _output.connect(this.gain);
        }
        /**
         * Activate override. Connects or disconnects AudioNodes
         */
        activate(_on) {
            super.activate(_on);
            this.updateConnection();
        }
        /**
         * Connects this components gain-node to the gain node of the AudioManager this component runs on.
         * Only call this method if the component is not attached to a [[Node]] but needs to be heard.
         */
        connect(_on) {
            if (_on)
                this.gain.connect(this.audioManager.gain);
            else
                this.gain.disconnect(this.audioManager.gain);
        }
        //#region Transfer
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.audio.idResource;
            serialization.playing = this.playing;
            serialization.loop = this.source.loop;
            serialization.volume = this.gain.gain.value;
            // console.log(this.getMutatorOfNode(AUDIO_NODE_TYPE.PANNER));
            // TODO: serialize panner parameters
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            let audio = await FudgeCore.Project.getResource(_serialization.idResource);
            this.createSource(audio, _serialization.loop);
            this.volume = _serialization.volume;
            this.play(_serialization.playing);
            return this;
        }
        install(_audioManager = FudgeCore.AudioManager.default) {
            let active = this.isActive;
            this.activate(false);
            this.audioManager = _audioManager;
            this.panner = _audioManager.createPanner();
            this.gain = _audioManager.createGain();
            this.panner.connect(this.gain);
            this.gain.connect(_audioManager.gain);
            this.activate(active);
        }
        createSource(_audio, _loop) {
            if (this.source) {
                this.source.disconnect();
                this.source.buffer = null;
            }
            this.source = this.audioManager.createBufferSource();
            this.source.connect(this.panner);
            if (_audio) {
                this.audio = _audio;
                this.source.buffer = _audio.buffer;
            }
            this.source.loop = _loop;
        }
        updateConnection() {
            try {
                this.connect(this.isActive && this.isAttached && this.listened);
            }
            catch (_error) {
                // nop
            }
        }
    }
    ComponentAudio.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudio);
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentAudio.js.map