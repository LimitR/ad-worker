export = ChildWorker;
declare class ChildWorker {
    onMessage(callback: (msg: any) => void): void;
    onceMessage(callback: (msg: any) => void): void;
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
