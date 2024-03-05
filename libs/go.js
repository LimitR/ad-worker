import os from 'os';
import { Pool } from'./Pool.js';

const cpuCores = os.cpus();

const threadPool = new Pool({ path: './libs/_go.js', quantityThread: cpuCores.length })

export function go(func) {
    return new Promise(resolve => {
        if (typeof func !== 'function') {
            throw Error('Argument is not a function')
        }
    
        threadPool.sendMessage('('+func.toString()+')()', resolve);
    })
}
