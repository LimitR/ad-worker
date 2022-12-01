type ParamsConstructorPool = {
    path: string;
    quantityThread: number;
    sharedDatas?: {
        length?: number;
        type?: 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';
    },
     workerData?: any
}

export class Pool {
    /**
    * @param {Object} params
    * @param {string} params.path
    * @param {number} params.quantityThread
    * @param {Object} params.sharedData
    * @param {number} params.sharedData.length Size BufferArray
    * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} params.sharedData.type Type BufferArray
    */
    constructor(params: ParamsConstructorPool);
    /**
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(message: any, callback: (msg: any) => any): void;
    getSharedData<T = any>(): T
    #private;
}
