'use strict';

import { ChainId, Token, TokenAmount, Pair, Trade} from '@uniswap/sdk'
import JSBI from 'jsbi'
let pairs = [];
let tokensObj = {};
export function initService() {

}
export function pairFactory(tokenArray, dic) {

  const token0 = new Token(ChainId.KOVAN, tokenArray[0], dic[tokenArray[0]].decimals, dic[tokenArray[0]].symbol, dic[tokenArray[0]].name);  
  const token1 = new Token(ChainId.KOVAN, tokenArray[1], dic[tokenArray[1]].decimals, dic[tokenArray[1]].symbol, dic[tokenArray[1]].name);  

  tokensObj[tokenArray[0]] = token0;
  tokensObj[tokenArray[1]] = token1;
//   console.log(tokenArray)
//   console.log(tokenArray[3])
    // console.log(tokenArray[3][0])
  const pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(tokenArray[2][0])), new TokenAmount(token1, JSBI.BigInt(tokenArray[2][1])))
  pairs.push(pair_0_1)
}

export function bestTradeExactOut(tokenIn, tokenOut, amount) {
    return Trade.bestTradeExactOut(pairs, tokensObj[tokenIn], new TokenAmount(tokensObj[tokenOut], JSBI.BigInt(amount)))
}
export function bestTradeExactIn(tokenIn, amount, tokenOut) {
    return Trade.bestTradeExactIn(pairs, new TokenAmount(tokensObj[tokenIn], JSBI.BigInt(amount)), tokensObj[tokenOut])
}