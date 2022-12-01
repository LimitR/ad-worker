"use strict";
const v8 = require('v8');
module.exports = class SharedData {
    #data;
    #shareDataBuffer;
    /**
     * @param {number} length Size BufferArray
     * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} type Type BufferArray
     * @default type int32
     * @default length 1024
     */
    constructor(length = 1024, type = "int32") {
        this.#type = type;
        this.#shareDataBuffer = new SharedArrayBuffer(length);
        this.#data = Buffer.from(this.#shareDataBuffer);
        this.#owner = false;
    }
    /**
     * @param {workerData} data
     * @description It's method return new class SharedData, with SharedArrayBuffer
     * @returns {SharedData}
     */
    new(data) {
        this.#data = Buffer.from(data);
        return this;
    }
    /**
     * @param {Object|Array|string|number|boolean} data
     * @returns {array}
     */
    add(data) {
        Atomics.wait(this.#data, 0, 0);
        Atomics.sub(this.#data, 0, 1);
        v8.serialize(data).forEach((element, index) => {
            Atomics.store(this.#data, index, element)
        });
        Atomics.add(this.#data, 0, 1);
        Atomics.notify(this.#data, 0, 1);

    }
    /**
     * @param {Object|Array|string|number|boolean} data
     * @description Not atomics method
     */
    na_add(data) {
        v8.serialize(data || this.#data).forEach((element, index) => {
            this.#data[index] = element;
        });
    }
    /**
     * @description Not atomics method
     * @returns {number[]} Array bytes
     */
    na_get() {
        return this.#shareDataBuffer;
    }
    /**
     * @param {number} from from index
     * @param {number} to to index
     * @returns {array} number[] - Array bytes
     */
    get(from, to) {
        Atomics.wait(this.#data, 0, 0)
        const result = [];
        while (from < to) {
            result.push(Atomics.load(this.#data, from))
            from++;
        }
        Atomics.notify(this.#data, 0, 1);

        return result;
    }
    /**
     * @param {SharedArrayBuffer|null} data
     * @description Method return data from class SharedData, or serialized data from argument
     * @returns {*}
     * @returns {Promise} Any data from argument or a class context
     */
    deserialize(data) {
        return v8.deserialize(
            Buffer.from(data || this.#shareDataBuffer)
        );
    }
    // mutex(size) {
    //     this.#data[0] = size;
    // };
    // lock(callback = () => { }) {
    //     Atomics.wait(this.#data, 0, 0);
    //     Atomics.sub(this.#data, 0, 1);
    //     Atomics.notify(this.#data, 0)
    //     this.#owner = true;
    //     setTimeout(callback, 0);
    // }
    // unlock(callback = () => { }) {
    //     if (this.#owner) {
    //         Atomics.add(this.#data, 0, 1);
    //         Atomics.notify(this.#data, 0)
    //         this.#owner = false
    //         setTimeout(callback, 0);
    //     }
    // }
}