# ad-worker

```shell
npm i ad-worker
```
This library allows spawn threads and transfer control by name, with an isolated context, or shared data between threads.
## Example
```javascript
// main.js
const { MainWorker } = require("ad-worker");

const mainWorker = new MainWorker({
    group: [
        { name: "test", path: "./worker.js", workerData: { ok: "ok" }, mutex: 1 },
        { name: "test_2", path: "./worker_2.js", workerDataLink: "test" },
        { name: "test_3", path: "./worker.js", workerDataLink: "test" },
    ],
    sharedData: {
        length: 1024,
        type: "int32"
    }
});
// Or
const mainWorker = new MainWorker({});

mainWorker.newThread({
    name: "test",
    path: "./worker.js",
    sharedData: {
        length: 1024,
        type: "int32"
    },
    workerData: { hello: "world" }
});

mainWorker.newThread({
    name: "test",
    path: "./worker.js"
});

// Or
mainWorker.spawn(()=>{
    console.log("New thread, in this file");
});
```

```javascript
// worker.js
const { ChildWorker } = require("ad-worker");
const { workerData } = require("worker_threads");

const childWorker = new ChildWorker(workerData);

childWorker.setSharedData({ hello: "world" });
childWorker.sendMessage("change");
childWorker.lock(()=>{
    childWorker.onMessage(msg => {
        console.log(msg); // Some message
        childWorker.unlock();
    });
});

childWorker.onMessage(msg => {
    console.log(msg);
});
childWorker.sendMessage("ok");

childWorker.close();

```

```javascript
// main.js
mainWorker.onMessage("test", msg => {
    if (msg === "change") {
        mainWorker.getSharedData("test", msg => {
            console.log(msg); // {hello: "world"}
        })
        return;
    }
})

mainWorker.getSharedData("test2", msg => {
    console.log(msg); // { ok: "ok" }
})
mainWorker.getSharedData("test", msg => {
    console.log(msg); // { ok: "ok" }
})
```


```javascript
// main.js
const { Pool }  = require("ad-worker");

const threadPool = new Pool({ path: './test.js', quantityThread: 10 })
threadPool.sendMessage('SELECT * FROM table', (res) => {
    console.log(res); // ['Sasha', 'Pasha', 'Oleg']
})

// worker.js
const { ChildWorker } = require('./index.js');
const db = new Db();
const childWorker = new ChildWorker();

childWorker.onMessage(async (msg) => {
    const res = await db.query(msg);
    childWorker.sendMessage(res);
    // Or
    childWorker.setSharedData(res);
    childWorker.sendMessage('done');
});
```