const flow = require("./flow/flow.js");
const t = require("./flow/flowTypes.js");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 300;

let accountAddr;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Connected to Unity");
});

app.get("/flow", (req, res) => {
    
})

app.get("/flow/type/", (req, res) => {
    res.send(t.types["Address"]);
})

app.post("/flow/typeTest/", (req, res) => {
    const type = req.body.type;

    console.log(req.body);

    res.send(t.types[req.body.type])
})

app.post("/flow/user/", async (req, res) => {
    res.send(await flow.getUser(req.body.address));
})

// Sends transaction using request from Unity
app.post("/flow/transaction/", async(req, res) => {
    let response;
    let txReq = req.body;
    accountAddr = txReq.address;

    try {
        const user = await flow.getAuthorization(accountAddr);
        response = await flow.sendTxReq(user, txReq);
    } catch (error) {
        response = error;
    }

    console.log("---------------\nResponse:\n" + response);
    res.send(response);
});

app.listen(PORT, () => { 
    console.log("-----------------------------------------\nWorking as intended");
});