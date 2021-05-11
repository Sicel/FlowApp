const firebase = require("firebase");
const config = require("./config.js").firebaseConfig;

firebase.initializeApp(config);
const db = firebase.database();
const playerMaket = db.ref("playerMarket");

exports.getMarketItems = (res) => {
    let items = [];
    playerMaket.once('value', (snapshot) => {
        snapshot.forEach(item => {
            items.push(item.val());
        });

        res.send(items);
    })
}

exports.addMarketItem = (item) => {
    db.ref("playerMarket/" + item.id).set(item);
}

exports.removeMarketItem = (id) => {
    db.ref("playerMarket/" + id).remove();
}