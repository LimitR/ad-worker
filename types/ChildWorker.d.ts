export class ChildWorker {
    constructor(_workerData?: {
        sharedData: {
            length: number;
            type: string;
        };
        value: any;
    });
    onMessage(callback: any): void;
    onceMessage(callback: any): void;
    sendMessage(msg: any): void;
    /**
     * @param {*} msg Your data
     */
    setSharedData(msg: any): void;
    getSharedData(): any;
    /**
     * @description Close thread
     */
    close(): void;
    /**
     * @param {callback|null} callback
     * @description Lock thread, if this owner
     */
    lock(callback: any): void;
    /**
     * @param {callback|null} callback
     * @description Unlock thread, if this owner
     */
    unlock(callback: any): void;
    #private;
}
