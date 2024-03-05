"use strict";
import { parentPort, workerData } from 'node:worker_threads';
import v8 from 'v8';
export class ChildWorker {
    #sharedData;
    constructor() {
        this.#sharedData = Buffer.from(workerData || {})
    }
    onMessage(callback) {
        parentPort.on("message", callback);
    }
    onceMessage(callback) {
        parentPort.once("message", callback);
    }
    sendMessage(msg) {
        parentPort.postMessage(msg);
    }
    /**
     * @param {*} msg Your data
     */
    setSharedData(msg) {
        v8.serialize(msg).forEach((element, index) => {
            this.#sharedData[index] = element;
        });
    }
    getSharedData() {
        return v8.deserialize(
            Buffer.from(workerData)
        );
    }
    /**
     * @description Close thread
     */
    close() {
        parentPort.close();
    }
    /**
     * @param {callback|null} callback
     * @description Lock thread, if this owner
     */
    lock(callback) {
        this.#sharedData.lock(callback)
    }
    /**
     * @param {callback|null} callback
     * @description Unlock thread, if this owner
     */
    unlock(callback) {
        this.#sharedData.unlock(callback)
    }
}