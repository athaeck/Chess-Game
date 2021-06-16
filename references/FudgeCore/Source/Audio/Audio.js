"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Extension of AudioBuffer with a load method that creates a buffer in the [[AudioManager]].default to be used with [[ComponentAudio]]
     * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Audio extends FudgeCore.Mutable {
        constructor(_url) {
            super();
            this.name = "Audio";
            this.idResource = undefined;
            this.buffer = undefined;
            this.path = undefined;
            this.url = undefined;
            this.ready = false;
            if (_url) {
                this.load(_url);
                this.name = _url.toString().split("/").pop();
            }
            FudgeCore.Project.register(this);
        }
        get isReady() {
            return this.ready;
        }
        /**
         * Asynchronously loads the audio (mp3) from the given url
         */
        async load(_url) {
            FudgeCore.Debug.fudge("AudioLoad", _url);
            this.url = _url;
            this.ready = false;
            this.path = new URL(this.url.toString(), FudgeCore.Project.baseURL);
            const response = await window.fetch(this.path.toString());
            const arrayBuffer = await response.arrayBuffer();
            let buffer = await FudgeCore.AudioManager.default.decodeAudioData(arrayBuffer);
            this.buffer = buffer;
            this.ready = true;
            this.dispatchEvent(new Event("ready" /* READY */));
        }
        //#region Transfer
        serialize() {
            return {
                url: this.url,
                idResource: this.idResource,
                name: this.name,
                type: this.type
            };
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            await this.load(_serialization.url);
            this.name = _serialization.name;
            return this;
        }
        async mutate(_mutator) {
            let url = _mutator.url; // save url for reconstruction after exclusion
            if (_mutator.url != this.url.toString())
                this.load(_mutator.url);
            // except url from mutator for further processing
            delete (_mutator.url);
            super.mutate(_mutator);
            // reconstruct, for mutator may be kept by caller
            _mutator.url = url;
        }
        reduceMutator(_mutator) {
            // delete _mutator.idResource; 
            delete _mutator.ready;
        }
    }
    FudgeCore.Audio = Audio;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Audio.js.map