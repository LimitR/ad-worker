"use strict";
import { Worker, isMainThread } from 'node:worker_threads';
import { SharedData } from "./SharedData.js";

export class MainWorker {
    #group = {};
    #sharedData = {};
    constructor(params) {
        if (params) {
            const { group = [], sharedData, mutex = 1 } = params;
            this.path = __filename;
            this.#group = Object.assign({}, ...group.map(({ name, path, workerData, workerDataLink }) => {
                if (workerDataLink) {
                    this.#sharedData[name] = this.#sharedData[workerDataLink];
                    return { [name]: new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } }) };
                }
                if (sharedData) {
                    if (mutex < 1) return Error("MainWorker: mutex can not less one - " + name);
                    this.#sharedData[name] = new SharedData(sharedData.length, sharedData.type);
                    // this.#sharedData[name].mutex(mutex);
                    this.#sharedData[name].na_add(workerData);
                    return { [name]: new Worker(path, { workerData: this.#sharedData[name].na_get() }) };
                }
                return { [name]: new Worker(path) };
            }));
        } else {

        }
    }

    /**
     * @param {string} name Name thread
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(name, message) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        this.#group[name].postMessage(message);
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback
     * @description Event "message"
     */
    onMessage(name, callback) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        this.#group[name].on("message", callback);
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback
     * @description Event "message"
     */
    onceMessage(name, callback) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        this.#group[name].once("message", callback);
    }

    /**
     * @param {string} name Name thread
     * @returns {*} Class Worker
     */
    getThread(name) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        return this.#group[name];
    }

    /**
     * @param {string} name Name thread
     * @returns {Promise} Returns a Promise for the exit code
     * @description Using for stoped thread
     */
    stopThread(name) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        const code = this.#group[name].terminate();
        delete this.#group[name];
        return code;
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback Fuction callback
     * @description Using for getting share data
     */
    getSharedData(name) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        return this.#sharedData[name].deserialize()
    }

    setSharedData(name, msg) {
        this.#sharedData[name].na_add(msg);
    }

    /**
     * @param {Object} params
     * @param {string} params.name
     * @param {string} params.path
     * @param {Object} [params.workerData]
     * @param {string} [params.workerDataLink]
     * @param {number} params.mutex
     * @param {Object} params.sharedData
     * @param {number} params.sharedData.length Size BufferArray
     * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} params.sharedData.type Type BufferArray
     */
    newThread(params) {
        const { name, path, workerData, sharedData = { length: 1024, type: "int32" }, workerDataLink, mutex = 1 } = params;
        if (this.#group[name] !== undefined) return Error("It's name using");
        if (workerDataLink) {
            this.#group[name] = new Worker(path, this.#sharedData[workerDataLink]);
            return;
        }
        if (workerData) {
            const shar = new SharedData(sharedData.length, sharedData.type);
            // shar.mutex(mutex);
            shar.na_add(workerData);
            this.#sharedData[name] = shar;
            this.#group[name] = new Worker(path, { workerData: this.#sharedData[name].na_get() });
            return;
        }
        const shar = new SharedData(sharedData.length, sharedData.type);
        shar.na_add({});
        // shar.mutex(mutex);
        this.#sharedData[name] = shar;
        this.#group[name] = new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } });
    }

    spawn(callback) {
        if (isMainThread) {
            new Worker((new Error()).stack.split("\n")[2].split("/").join("/").split("(")[1].split(":")[0]);
        } else {
            return callback();
        }
    }
}