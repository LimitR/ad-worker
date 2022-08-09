"use strict";
const { Worker, isMainThread } = require('node:worker_threads');
const SharedData = require("./SharedData");

module.exports = class MainWorker {
    #group;
    #sharedData = {};
    /**
     * @param {Object} params
     * @param {Object[]} params.group
     * @param {string} params.group[].name
     * @param {string} params.group[].path
     * @param {Object} [params.group[].workerData]
     * @param {string} [params.group[].workerDataLink]
     * @param {number} params.group[].mutex
     * @param {Object} params.sharedData
     * @param {number} params.sharedData.length Size BufferArray
     * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} params.sharedData.type Type BufferArray
     */
    constructor({ group = [], sharedData, mutex = 1 }) {
        this.path = __filename;
        this.#group = Object.assign({}, ...group.map(({ name, path, workerData, workerDataLink }) => {
            if (workerDataLink) {
                this.#sharedData[name] = this.#sharedData[workerDataLink];
                return { [name]: new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } }) };
            }
            if (sharedData) {
                if (mutex < 1) return Error("MainWorker: mutex can not less one - " + name);
                this.#sharedData[name] = new SharedData(sharedData.length, sharedData.type);
                this.#sharedData[name].mutex(mutex);
                this.#sharedData[name].add(workerData);
                return { [name]: new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } }) };
            }
            return { [name]: new Worker(path) };
        }));
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
    getSharedData(name, callback) {
        if (!this.#group[name]) {
            return Error("AddWorker: not found this name group - " + name);
        }
        callback(this.#sharedData[name].deserialize());
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
    newThread({ name, path, workerData, sharedData = {length: 1024, type: "int32"}, workerDataLink, mutex = 1 }) {
        if (this.#group[name] !== undefined) return Error("It's name using");
        if (workerDataLink) {
            this.#group[name] = new Worker(path, this.#sharedData[workerDataLink]);
            return;
        }
        if (workerData) {
            const shar = new SharedData(sharedData.length, sharedData.type);
            shar.mutex(mutex);
            shar.add(workerData);
            this.#sharedData[name] = shar;
            this.#group[name] = new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } });
            return;
        }
        const shar = new SharedData(sharedData.length, sharedData.type);
        shar.add({});
        shar.mutex(mutex);
        this.#sharedData[name] = shar;
        this.#group[name] = new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } });
    }

    spawn(callback){
        if(isMainThread){
            new Worker((new Error()).stack.split("\n")[2].split("/").join("/").split("(")[1].split(":")[0]);
        }else {
            return callback();
        }
    }
    pool(){}
}