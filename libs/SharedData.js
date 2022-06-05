"use strict";
const v8 = require('v8');
module.exports = class SharedData {
    #data;
    #owner;
    #typeConfigurator = {
        "int8": (data) => new Int8Array(data),
        "int16": (data) => new Int16Array(data),
        "int32": (data) => new Int32Array(data),
        "uint8": (data) => new Uint8Array(data),
        "uint16": (data) => new Uint16Array(data),
        "uint32": (data) => new Uint32Array(data),
        "float32": (data) => new Float32Array(data),
        "float64": (data) => new Float64Array(data),
    };
    #type;
    /**
     * @param {number} length Size BufferArray
     * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} type Type BufferArray
     * @default type int32
     * @default length 1024
     */
    constructor(length = 1024, type) {
        this.#type = type || "int32";
        this.#data = this.#typeConfigurator[type || "int32"](new SharedArrayBuffer(length));
        this.#data[0] = 1;
        this.#owner = false;
    }
    /**
     * @param {workerData} data
     * @description It's method return new class SharedData, with SharedArrayBuffer
     * @returns {SharedData}
     */
    new(data) {
        this.#data = data;
        return this;
    }
    /**
     * @param {Object|Array|string|number|boolean} data
     * @returns {array}
     */
    add(data) {
        Atomics.wait(this.#data, 0, 0);
        Atomics.sub(this.#data, 0, 1);
        v8.serialize(data).map((element, index) => {
            Atomics.store(this.#data, index + 1, element)
        });
        Atomics.add(this.#data, 0, 1);
        Atomics.notify(this.#data, 0, 1);

    }
    /**
     * @param {Object|Array|string|number|boolean} data
     * @description Not atomics method
     */
    na_add(data) {
        v8.serialize(data).map((element, index) => {
            this.#data[index + 1] = element;
        });
    }
    /**
     * @description Not atomics method
     * @returns {number[]} Array bytes
     */
    na_get() {
        return this.#data;
    }
    /**
     * @param {number} from from index
     * @param {number} to to index
     * @returns {array} number[] - Array bytes
     */
    get(from, to) {
        Atomics.wait(this.#data, 0, 0)
        const result = [];
        this.#data[0] -= 1
        while (from < to) {
            result.push(Atomics.load(this.#data, from + 1))
            from++;
        }
        this.#data[0] += 1
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
            new Buffer.from(
                this.#typeConfigurator[this.#type](data || this.#getData())
            )
        );
    }
    #getData() {
        Atomics.wait(this.#data, 0, 0);
        const result = this.#data.map((element, index) => {
            return this.#data[index + 1];
        })
        return result;
    }
    mutex(size) {
        this.#data[0] = size;
    };
    lock(callback = () => { }) {
        Atomics.wait(this.#data, 0, 0);
        Atomics.sub(this.#data, 0, 1);
        Atomics.notify(this.#data, 0)
        this.#owner = true;
        setTimeout(callback, 0);
    }
    unlock(callback = () => { }) {
        if (this.#owner) {
            Atomics.add(this.#data, 0, 1);
            Atomics.notify(this.#data, 0)
            this.#owner = false
            setTimeout(callback, 0);
        }
    }
}