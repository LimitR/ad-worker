"use strict";
const { parentPort } = require('node:worker_threads');
const SharedData = require("./SharedData");
module.exports = class ChildWorker {
    #sharedData;
    constructor(workerData) {
        this.#sharedData = new SharedData(workerData.sharedData).new(workerData.value);
    }
    onMessage(callback) {
        parentPort.on("message", callback);
    }
    sendMessage(msg) {
        parentPort.postMessage(msg);
    }
    /**
     * @param {*} msg Your data
     */
    setSharedData(msg) {
        this.#sharedData.add(msg);
    }
    /**
     * @description Close thread
     */
    close(){
        parentPort.close();
    }
    /**
     * @param {callback|null} callback
     * @description Lock thread, if this owner
     */
    lock(callback){
        this.#sharedData.lock(callback)
    }
    /**
     * @param {callback|null} callback
     * @description Unlock thread, if this owner
     */
    unlock(callback){
        this.#sharedData.unlock(callback)
    }
}