# ad-worker

```shell
npm i ad-worker
```

```javascript
// main.js
const { MainWorker } = require("ad-worker");

const mainWorker = new MainWorker({
    gruop: [
        { name: "test", path: "./worker.js", workerData: { ok: "ok" }, mutex: 1 },
        { name: "test_2", path: "./worker_2.js", workerDataLink: "test" },
        { name: "test_3", path: "./worker.js", workerDataLink: "test" },
    ],
    sharedData: {
        length: 1024,
        type: "int32"
    }
});
mainWorker.newThread({ name: "test_4", path: "./worker.js" })
```

```javascript
// worker.js
const { ChildWorker } = require("ad-worker");
const { workerData } = require("worker_threads");

const childWorker = new ChildWorker(workerData);

childWorker.setSharedData({ hello: "world" });
childWorker.sendMessage("change");
childWorker.lock();

childWorker.onMessage(msg => {
    console.log(msg);
});
childWorker.sendMessage("ok");

childWorker.unlock();

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