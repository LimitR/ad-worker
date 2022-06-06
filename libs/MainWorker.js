"use strict";
const { Worker } = require('node:worker_threads');
const SharedData = require("./SharedData");

module.exports = class MainWorker {
    #group;
    #sharedData = {};
    /**
     * @param {Object} params
     * @param {Array} params.group
     * @param {Object} params.sharedData
     * @param {number} params.mutex
     */
    constructor({ group = [], sharedData, mutex = 1 }) {
        this.#group = Object.assign({}, ...group.map(({ name, path, workerData, workerDataLink }) => {
            if (workerDataLink) {
                this.#sharedData[name] = this.#sharedData[workerDataLink];
                return { [name]: new Worker(path, { workerData: { sharedData: sharedData, value: this.#sharedData[name].na_get() } }) };
            }
            if (sharedData) {
                if (mutex < 1) throw Error("MainWorker: mutex can not less one - " + name);
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
            throw Error("AddWorker: not found this name group - " + name);
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
            throw Error("AddWorker: not found this name group - " + name);
        }
        this.#group[name].on("message", callback);
    }

    /**
     * @param {string} name Name thread
     * @returns {*} Class Worker
     */
    getThread(name) {
        if (!this.#group[name]) {
            throw Error("AddWorker: not found this name group - " + name);
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
            throw Error("AddWorker: not found this name group - " + name);
        }
        return this.#group[name].terminate();
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback Fuction callback
     * @description Using for getting share data
     */
    getSharedData(name, callback) {
        if (!this.#group[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        callback(this.#sharedData[name].deserialize());
    }

    newThread({ name, path, workerData, sharedData, workerDataLink, mutex = 1 }) {
        if (this.#group[name] !== undefined) throw Error("It's name using");
        if (workerDataLink) {
            this.#group[name] = new Worker(path, this.#sharedData[workerDataLink]);
            return;
        }
        if (workerData) {
            const shar = new SharedData(sharedData);
            shar.mutex(mutex);
            shar.add(workerData);
            this.#sharedData[name] = shar;
            this.#group[name] = new Worker(path, { workerData: { sharedData: sharedData, value: shar.na_get() } });
            return;
        }
        const shar = new SharedData(...sharedData);
        shar.add({});
        this.#group[name] = new Worker(path, { workerData: { sharedData: sharedData, value: shar.na_get() } });
    }
}