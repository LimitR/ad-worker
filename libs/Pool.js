"use strict";
const { Worker } = require('node:worker_threads');
const SharedData = require("./SharedData");

module.exports = class Pool {
    #pool = {};
    #sharedData;
    /**
    * @param {Object} params
    * @param {string} params.path
    * @param {number} params.quantityThread
    * @param {Object} params.sharedDatas
    * @param {number} params.sharedDatas.length Size BufferArray
    * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} params.sharedData.type Type BufferArray
    */
    constructor({ path, sharedDatas, quantityThread, workerData }) {
        this.#sharedData = new SharedData(sharedDatas?.length || 1024, sharedDatas?.type || 'int32');
        this.#sharedData.mutex(1);
        this.#sharedData.na_add(workerData || {});
        for (let i = 0; i < quantityThread; i++) {
            this.#pool[i] =
            {
                thread: new Worker(path, { workerData: this.#sharedData.na_get() }),
                count: 0,
                id: i
            }
        }
    }
    /**
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(message, callback) {
        const pool = this.#choiceThread()
        pool.count += 1;
        pool.thread.postMessage(message);
        const _cb = (res) => {
            pool.count -= 1;
            return callback( pool.id + " " +res)
        }
        pool.thread.once("message", _cb);
    }
    getSharedData() {
        return this.#sharedData.deserialize()
    }
    stopAllThread() {
        for (const key of Object.keys(this.#pool)) {
            this.#pool[key].thread.terminate()
        }
    }
    #choiceThread() {
        let min = 999999
        let id
        for (const key of Object.keys(this.#pool)) {
            if(this.#pool[key].count < min){
                min = this.#pool[key].count
                id = this.#pool[key].id
            }
        }
        return this.#pool[id]
    }
}