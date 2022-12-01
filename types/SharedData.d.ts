export class SharedData {
    /**
     * @param {number} length Size BufferArray
     * @param {'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'|'float64'} type Type BufferArray
     * @default type int32
     * @default length 1024
     */
    constructor(length?: number, type?: 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64');
    /**
     * @param {workerData} data
     * @description It's method return new class SharedData, with SharedArrayBuffer
     * @returns {SharedData}
     */
    new(data: any): SharedData;
    /**
     * @param {Object|Array|string|number|boolean} data
     * @returns {array}
     */
    add(data: any | any[] | string | number | boolean): any[];
    /**
     * @param {Object|Array|string|number|boolean} data
     * @description Atomics method
     */
    na_add(data: any | any[] | string | number | boolean): void;
    /**
     * @description Not atomics method
     * @returns {number[]} Array bytes
     */
    na_get(): number[];
    /**
     * @param {number} from from index
     * @param {number} to to index
     * @returns {number[]} number[] - Array bytes
     */
    get(from: number, to: number): any[];
    /**
     * @param {SharedArrayBuffer|null} data
     * @description Method return data from class SharedData, or serialized data from argument
     * @returns {*}
     * @returns {Promise} Any data from argument or a class context
     */
    deserialize(data: SharedArrayBuffer | null): any;
    mutex(size: any): void;
    lock(callback?: () => void): void;
    unlock(callback?: () => void): void;
    #private;
}
