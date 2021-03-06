'use strict';
// import Web3 from 'web3';
const abi = require(`@/abi/UniswapV2.json`)


let web3 = null;
// let factory = null;
let router = null;

export function initService(web3Instance) {
    // this.data = data;
    // web3 = new Web3(data.web3.currentProvider);      
    web3 = web3Instance
    // factory = new web3.eth.Contract(abi.factory, "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
    router = new web3.eth.Contract(abi.router, "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a");
}

export async function swapExactTokensForTokens(amountIn, amountOutMin, path, to) {
    await router.methods.swapExactTokensForTokens(amountIn, amountOutMin, path , to, Date.now()+1000*60*2).send({from: "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E"});
}
export async function swapTokensForExactTokens(amountOut, amountInMax, path, to) {
    await router.methods.swapExactTokensForTokens(amountOut, amountInMax, path , to, Date.now()+1000*60*2).send({from: "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E"});
}

export async function approve(tokenAddr, spender, amount) {
    let token = new web3.eth.Contract(abi.erc20, tokenAddr);
    await token.methods.approve(spender, amount).send({from: "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E"});
}
export async function allowance(tokenAddr, spender) {
    let token = new web3.eth.Contract(abi.erc20, tokenAddr);
    return await token.methods.allowance("0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E", spender).call();
}
export async function getAmountsOut(amountIn, path) {
    return await router.methods.getAmountsOut(amountIn, path).call();
}
export async function getAmountsIn(amountIn, path) {
    return await router.methods.getAmountsIn(amountIn, path).call();
}