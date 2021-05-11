const flow = require("./flow/flow.js");
const t = require("./flow/flowTypes.js");
const playerMarketDB = require("./db/Roguelike/database.js");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 300;

let accountAddr;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Connected to Unity");
});

app.get("/flow", (req, res) => {
    res.send("Connected to flow transaction client")
})

app.get("/roguelike/", (req, res) => {
    res.send("Connected to Roguelike client")
})

app.get("/roguelike/market/", (req, res) => {
    playerMarketDB.getMarketItems(res);
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
    const to = txReq.to;

    try {
        const user = await flow.getAuthorization(accountAddr);
        console.log(user);
        response = await flow.sendTxReq(user, txReq);
    } catch (error) {
        response = error;
    }

    console.log("---------------\nResponse:\n" + response);
    res.send(response);
});

app.post("/roguelike/market/add", (req, res) => {
    console.log(req.body);
    playerMarketDB.addMarketItem(req.body);
})

app.post("/roguelike/market/remove", (req, res) => {
    let id;
    if (req.body.id === undefined) {
        id = req.query.id;
    } else {
        id = req.body.id;
    }
    console.log(id);
    playerMarketDB.removeMarketItem(id);
})

app.listen(PORT, () => { 
    flow.config();
    console.log("-----------------------------------------\nWorking as intended");
    //playerMarketDB.init();
});