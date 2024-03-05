import { ChildWorker } from './ChildWorker.js';
const childWorker = new ChildWorker();

childWorker.onMessage(cb => {
    try {
        const res = eval(cb);
        childWorker.sendMessage(res);
    } catch(e){
        childWorker.sendMessage()
    }
})