export = Pool;
type ConstructorPoll = {
    path: string;
    quantityThread: number;
    sharedDatas: {
        length: number;
    };
    workerData: any
}
declare class Pool {
    /**
    * @param {Object} params
    * @param {string} params.path
    * @param {number} params.quantityThread
    * @param {Object} params.sharedDatas
    * @param {number} params.sharedDatas.length Size BufferArray
    * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} params.sharedData.type Type BufferArray
    */
    constructor(args: ConstructorPoll);
    /**
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(message: any, callback: (msg: any) => void): void;
    getSharedData<T = any>(): T;
    stopAllThread(): void;
    #private;
}
