'use strict';
import Web3 from 'web3';
const abi = require(`@/abi/UniswapV2.json`)

let web3 = null;
let factory = null;

export function initService(provider) {
    web3 = new Web3(provider);      
    factory = new web3.eth.Contract(abi.factory, "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
}

export async function allPairsLength() {
    return await factory.methods.allPairsLength().call();
}

export async function allPairs(index) {
    return await factory.methods.allPairs(index).call();
}
export async function getToken(pairAddr){
    let pair = new web3.eth.Contract(abi.pair, pairAddr);
    return await Promise.all([pair.methods.token0().call(), pair.methods.token1().call()])
}
async function getErc20Info(tokenAddr) {
    let erc20 = new web3.eth.Contract(abi.erc20, tokenAddr)
    let info = await Promise.all([erc20.methods.name().call(), erc20.methods.symbol().call(), erc20.methods.decimals().call()])
    return {
        name: info[0],
        symbol: info[1],
        decimals: info[2],
        address: tokenAddr
    }
}
export async function erc20Info(tokenList) {
    let task = [];
    tokenList.map((o) => {
        task.push(getErc20Info(o))
    })

    return await Promise.all(task);
}