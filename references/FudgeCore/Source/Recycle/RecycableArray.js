"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
     * Wraps a regular Javascript Array and offers very limited functionality geared solely towards avoiding garbage colletion.
     */
    class RecycableArray {
        constructor() {
            this.#length = 0;
            this.#array = new Array();
        }
        #length;
        #array;
        // #type: new () => T;
        // //tslint:disable-next-line:no-any
        // constructor(_type: new (...args: any[]) => T) {
        //   this.#type = _type;
        // }
        get length() {
            return this.#length;
        }
        /**
         * Sets the virtual length of the array to zero but keeps the entries beyond.
         */
        reset() {
            this.#length = 0;
        }
        push(_entry) {
            this.#array[this.#length] = _entry;
            this.#length++;
            return this.#length;
        }
        pop() {
            this.#length--;
            return this.#array[this.#length];
        }
        /**
         * Recycles the object following the last in the array and increases the array length
         * It must be assured, that none of the objects in the array is still in any use of any kind!
         */
        // public recycle(): T {
        //   if (this.#length < this.#array.length) {
        //     this.#length++;
        //     return this.#array[this.#length++];
        //   }
        //   this.#array.push(Recycler.get(this.#type));
        //   return this.#array[this.#length++];
        // }
        *[Symbol.iterator]() {
            for (let i = 0; i < this.#length; i++)
                yield this.#array[i];
        }
        getSorted(_sort) {
            let sorted = this.#array.slice(0, this.#length);
            sorted.sort(_sort);
            return sorted;
        }
    }
    FudgeCore.RecycableArray = RecycableArray;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=RecycableArray.js.map