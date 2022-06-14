"use strict";
const { parentPort, workerData } = require('node:worker_threads');
const SharedData = require("./SharedData");
module.exports = class ChildWorker {
    #sharedData;
    constructor(_workerData = {sharedData: {length: 1024, type: "int32"}, value: workerData || {}}) {
        this.#sharedData = new SharedData(_workerData.sharedData.length, _workerData.sharedData.type);
        this.#sharedData.add(_workerData.value || workerData);
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
    getSharedData() {
        return this.#sharedData.deserialize();
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