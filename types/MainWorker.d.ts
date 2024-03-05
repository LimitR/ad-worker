export = MainWorker;
declare class MainWorker {
    constructor(params: any);
    path: string;
    /**
     * @param {string} name Name thread
     * @param {*} message Your message (string|object|nubmer)
     */
    sendMessage(name: string, message: any): Error;
    /**
     * @param {string} name Name thread
     * @param {*} callback
     * @description Event "message"
     */
    onMessage(name: string, callback: any): Error;
    /**
     * @param {string} name Name thread
     * @param {*} callback
     * @description Event "message"
     */
    onceMessage(name: string, callback: any): Error;
    /**
     * @param {string} name Name thread
     * @returns {*} Class Worker
     */
    getThread(name: string): any;
    /**
     * @param {string} name Name thread
     * @returns {Promise} Returns a Promise for the exit code
     * @description Using for stoped thread
     */
    stopThread(name: string): Promise<any>;
    /**
     * @param {string} name Name thread
     * @param {*} callback Fuction callback
     * @description Using for getting share data
     */
    getSharedData(name: string): any;
    setSharedData(name: any, msg: any): void;
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
    newThread(params: {
        name: string;
        path: string;
        workerData?: any;
        workerDataLink?: string;
        mutex: number;
        sharedData: {
            length: number;
            type: 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';
        };
    }): Error;
    spawn(callback: any): any;
    #private;
}
