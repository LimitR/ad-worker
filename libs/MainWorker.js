"use strict";
const { Worker } = require('node:worker_threads');
const SharedData = require("./SharedData");

module.exports = class MainWorker {
    #gruop;
    #sharedData = {};
    /**
     * @param {Object} params
     * @param {Array} params.gruop
     * @param {Object} params.sharedData
     * @param {number} params.mutex
     */
    constructor({ gruop = [], sharedData, mutex = 1 }) {
        this.#gruop = Object.assign({}, ...gruop.map(({ name, path, workerData, workerDataLink }) => {
            if (workerDataLink) {
                this.#sharedData[name] = this.#sharedData[workerDataLink];
                return { [name]: new Worker(path, { workerData: {sharedData: sharedData, value: this.#sharedData[name].na_get()} }) };
            }
            if (sharedData) {
                if (mutex < 1) throw Error("MainWorker: mutex can not less one - " + name);
                this.#sharedData[name] = new SharedData(sharedData.length, sharedData.type);
                this.#sharedData[name].mutex(mutex);
                this.#sharedData[name].add(workerData);
                return { [name]: new Worker(path, { workerData: {sharedData: sharedData, value: this.#sharedData[name].na_get()} }) };
            }
            return { [name]: new Worker(path) };
        }));
    }

    /**
     * @param {string} name Name thread
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(name, message) {
        if (!this.#gruop[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        this.#gruop[name].postMessage(message);
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback
     * @description Event "message"
     */
    onMessage(name, callback) {
        if (!this.#gruop[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        this.#gruop[name].on("message", callback);
    }

    /**
     * @param {string} name Name thread
     * @returns {*} Class Worker
     */
    getThread(name) {
        if (!this.#gruop[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        return this.#gruop[name];
    }

    /**
     * @param {string} name Name thread
     * @returns {Promise} Returns a Promise for the exit code
     * @description Using for stoped thread
     */
    stopThread(name) {
        if (!this.#gruop[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        return this.#gruop[name].terminate();
    }

    /**
     * @param {string} name Name thread
     * @param {*} callback Fuction callback
     * @description Using for getting share data
     */
    getSharedData(name, callback) {
        if (!this.#gruop[name]) {
            throw Error("AddWorker: not found this name group - " + name);
        }
        callback(this.#sharedData[name].deserialize());
    }
}