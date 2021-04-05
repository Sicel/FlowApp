const sdk = require("@onflow/sdk");
const fcl = require("@onflow/fcl");
const t = require("./flowTypes.js");
const ec = require("elliptic").ec;
const sha3 = require("sha3");
const dotenv = require("dotenv");
const e = require("express");
dotenv.config();

let accountAddr;
const privKey = process.env.ACCOUNT_PRIVATE_KEY;
const keyIdx = process.env.ACCOUNT_KEY_IDX;

const EC = new ec("p256");

// All taken from https://github.com/onflow/kitty-items/blob/master/kitty-items-js/src/services/flow.ts
exports.getAuthorization = async (addr, account = {}) => {
    //accountAddr = txReq.address;
    const user = await getUser(addr);
    //console.log(user);
    const key = user.account.keys[keyIdx];
    let sequenceNum;

    //console.log("Key:" + key);

    if (Object.keys(account).length !== 0) {
        if (account.role.proposer) {
            sequenceNum = key.sequenceNumber;
        }
    }

    async function signingFunction(data) {
        return {
            addr: user.account.address,
            keyId: key.index,
            signature: signWithKey(privKey, data.message)
        }
    }
    
    return Object.assign(Object.assign({}, account), { 
        addr: user.account.address, 
        keyId: key.index, 
        sequenceNum, 
        signature: account.signature || null, 
        signingFunction, 
        resolve: null, 
        roles: account.roles 
    });
}

function signWithKey(privateKey, message) {
    const key = EC.keyFromPrivate(Buffer.from(privateKey, "hex"));
    const sig = key.sign(hashMsg(message));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    const result = Buffer.concat([r, s]).toString("hex");
    console.log("----------------------------------------\nsignWithKey: " + result)
    return result;
}  

function hashMsg(msg) {
    const sha = new sha3.SHA3(256);
    sha.update(Buffer.from(msg, "hex"));
    return sha.digest();
  };

exports.sendTx = async(user, txScript) => {
    const transac = await fcl.send([
        fcl.transaction`${txScript}`,
        fcl.payer(user),
        fcl.proposer(user),
        fcl.authorizations([user]),
        fcl.limit(9999)
    ])
    .then(fcl.decode)
    return await fcl.tx(transac).onceSealed();
}

exports.sendTxReq = async(user, txReq) => {
    let arguments = [];
    console.log(txReq);

    txReq.arguments.forEach(element => {
        let type = t.types[element.type];
        let arg = element.argument;

        console.log(element);

        if (element.type == "Array") {
            element.typeList.forEach(element => console.log(element));
            type = typeArray(element.typeList);
            console.log(type);
        }

        if (element.type == "Dictionary") {
            if (arg.length == 1) {
                arg = arg[0];
            }
            
            element.typeList.forEach(element => console.log(element));
            type = typeDictionary(element.typeList);
        }

        arguments.push(fcl.arg(arg, type));
    })

    const transac = await fcl.send([
        fcl.transaction`${txReq.script}`,
        fcl.args(arguments),
        fcl.payer(user),
        fcl.proposer(user),
        fcl.authorizations([user]),
        fcl.limit(9999)
    ])
    .then(fcl.decode)

    return await fcl.tx(transac).onceSealed();
}

function typeArray(array) {
    let typeArray = [];
    
    if (array.length == 1) {
        typeArray = t.types[array[0]];
    } else {
        array.forEach(element => typeArray.push(t.types[element]));
    }

    const arrayArg = t.types["Array"];
    return arrayArg(typeArray);
}

function typeDictionary(dict) {
    let typeDict = [];
    
    if (dict.length == 1) {
        const element = dict[0];

        typeDict = {
            key: t.types[element.key],
            value: t.types[element.value]
        };
    }

    dict.forEach(element => typeDict.push({
        key: t.types[element.key],
        value: t.types[element.value]
    }))

    const dictArg = t.types["Dictionary"];
    return dictArg(typeDict);
}

async function getUser(address) {
    return await fcl.send([fcl.getAccount(address)]);
}

exports.config =  async() => {
    //fcl.config()
    //.put("accessNode.api", "127.0.0.1:3569"); // Configure FCLs Access Node
    //.put("challeng.handshake", process.env.WALLET_DISCOVERY);

    console.log(await fcl.config().get("accessNode.api"));
}
 