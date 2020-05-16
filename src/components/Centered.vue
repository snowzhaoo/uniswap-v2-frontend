<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>

        <!-- <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4"> 
              <v-alert type="warning">
                Please enable the token first
              </v-alert>
          </v-col>
        </v-row> -->
        <v-row align="center" justify="center">

          <v-col cols="12" sm="8" md="6" >
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Token Swap</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip>

                  <template  v-slot:activator="{ on }">

                      <v-switch v-show="seen" v-model="enable" @change="approve" :label="enable ? 'enabled': 'enable\u3000'" v-on="on"></v-switch>

                  </template>

                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <v-form>

                  <v-container fluid>
                    <v-row align="center">
                      <v-col class="d-flex" cols="12" sm="8">
                        <v-text-field
                          id="input"
                          v-model="amountIn"
                          label="Input"
                          name="tokenIn"
                          prepend-icon="mdi-import"
                          type="number"
                          @input="changeAmountIn"
                        ></v-text-field>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="4">
                        <v-select
                          id="tokenIn"
                          v-model="tokenIn"
                          :items="itemsIn"
                          label="Symbol"
                          hide-selected
                          @change="changeTokenIn"
                        ></v-select>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="8">
                          <v-text-field
                            id="ouput"
                            v-model="amountOut"
                            label="Ouput"
                            name="tokenOut"
                            prepend-icon="mdi-export"
                            type="number"
                            @input="changeAmountOut"
                          ></v-text-field>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="4">
                        <v-select
                          id="tokenOut"
                          v-model="tokenOut"
                          :items="itemsOut"
                          @change="changeTokenOut"
                          hide-selected
                          label="Symbol"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
  
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="swap" color="primary">Swap</v-btn>
              </v-card-actions>
            </v-card>

          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import * as TokenListService from '@/services/TokenListService.js';
import * as SwapService from '@/services/SwapService.js';
import * as UniswapV2Service from '@/services/UniswapV2Service.js';
import Web3 from 'web3';
import Big from 'big.js';
const BN = Web3.utils.BN;
// import { ChainId, Token, TokenAmount, Pair, Trade,TradeType, Route } from '@uniswap/sdk'
// import JSBI from 'jsbi'

// const abi = require(`@/abi/UniswapV2.json`)
// import Big from 'big.js';
  export default {
    name: 'Centered',
    props: {
      source: String,
      web3: {
        type: Object
      }
    },
    data: () => ({
      itemsIn: [],
      itemsOut: [],
      tokenIn: "",
      tokenOut: "",
      amountIn: "",
      amountOut: "",
      tokenList: [],
      enable: false,
      seen: false,
      tokensDic: Object
      // lastTokenIn: "",
      // lastTokenOut: ""
    }),
    methods: {
      async init(data) {
        SwapService.initService(data);
        // TokenListService.initService(data.web3.currentProvider);
      },
      async initTokenList(currentProvider) {
        TokenListService.initService(currentProvider);
        // SwapService.initService(currentProvider);

        let pairLength = await TokenListService.allPairsLength();

        let task = [];
        for (let i = 0; i < pairLength; i++) {
          task.push(TokenListService.allPairs(i));
        }
        let pairs = await Promise.all(task);

        task = [];
        pairs.map((o) => {
          task.push(TokenListService.getToken(o))
        })

        let tokens = await Promise.all(task);
      
        console.log(tokens)


        let tokenAddrList = [];

        tokens.map((o) => {
          o.map((j,i) => {
            if (i < 2) {
              tokenAddrList.push(j)
            }
          })
        })
        tokenAddrList= Array.from(new Set(tokenAddrList));

        // console.log(tokenAddrList)
        this.items = tokenAddrList;

        this.tokenList = await TokenListService.erc20Info(tokenAddrList);

        // let tokensDic = {};
        let optionList = this.tokenList.map((o, i) => {

          this.tokensDic[o.address] = {
            decimals: o.decimals,
            name: o.name,
            symbol: o.symbol
          }
          return { text: o.symbol, value: i, disabled: false}
        })

        tokens.map((o) => {
          UniswapV2Service.pairFactory(o, this.tokensDic);
        })

        this.itemsIn = optionList;
        this.itemsOut = optionList;

        console.log("init end");

      },
      async changeAmountIn(e) {
        if (e > 0) {
          
          const tokenIn = this.tokenList[this.tokenIn]['address'];
          const tokenOut = this.tokenList[this.tokenOut]['address'];

          let amountIn = new Big(e).times(`1e${this.tokensDic[tokenIn]['decimals']}`).toFixed().toString()
          const result = UniswapV2Service.bestTradeExactIn(tokenIn, amountIn, tokenOut)

          if (result.length == 0) {
              //error
          } else {

            //TODO 
            let path = result[0]['route']['path'];
            path = path.map((o) => o.address);

            let amount = await SwapService.getAmountsOut(amountIn, path);
            this.amountOut = new Big(amount[1]).div(`1e${this.tokensDic[tokenOut]['decimals']}`).toFixed().toString();


          }
        } else {
          this.amountOut = 0;
        }

      },
      async changeAmountOut(e) {
        if (e > 0) {

          const tokenIn = this.tokenList[this.tokenIn]['address'];
          const tokenOut = this.tokenList[this.tokenOut]['address'];
          let amountOut = new Big(e).times(`1e${this.tokensDic[tokenOut]['decimals']}`).toFixed().toString();
          const result = UniswapV2Service.bestTradeExactOut(tokenIn, tokenOut, amountOut);

          if (result.length == 0) {
              //error
          } else {

            let path = result[0]['route']['path'];
            path = path.map((o) => o.address);

            let amount = await SwapService.getAmountsIn(amountOut, path);
            this.amountIn = new Big(amount[0]).div(`1e${this.tokensDic[tokenIn]['decimals']}`).toFixed().toString();
          }
        } else {
          this.amountIn = 0;
        }

      },
      async changeTokenIn(e) {
        this.itemsOut.map((o) => o.disabled = false);
        this.itemsOut[e].disabled = true;
        //get allowance
        let allowance = new BN(await SwapService.allowance(this.tokenList[this.tokenIn]['address'], "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a")) 
        this.enable = !allowance.eq(0);
        this.seen = true;

      },
      changeTokenOut(e) {
        this.itemsIn.map((o) => o.disabled = false)
        this.itemsIn[e].disabled = true;
      },
      async swap(){
//DAI 0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa
//weth 0xd0a1e359811322d97991e03f863a0c30c2cf029c
//usdc 0x75b0622cec14130172eae9cf166b92e5c112faff
        let tokenIn = this.tokenList[this.tokenIn]['address']
        let tokenOut = this.tokenList[this.tokenOut]['address']
        // console.log(this.tokenList)
        // console.log(this.tokenIn)
        // console.log(tokenInAddr)
        // console.log(tokenOutAddr)

        // await SwapService.swapExactTokensForTokens(Web3.utils.toWei(this.amountIn, 'ether'),1, [tokenInAddr, tokenOutAddr], "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")

// let result = UniswapV2Service.bestTradeExactOut(tokenIn, tokenOut, 100)
let result = UniswapV2Service.bestTradeExactIn(tokenIn, 100,tokenOut)
console.log(result)
        // await SwapService.swapExactTokensForTokens(Web3.utils.toWei(this.amountIn, 'ether'),1, ["0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa", "0xd0a1e359811322d97991e03f863a0c30c2cf029c", "0x75b0622cec14130172eae9cf166b92e5c112faff"], "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")
        // await SwapService.swapExactTokensForTokens(Web3.utils.toWei(this.amountIn, 'ether'),1, ["0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa", "0x75b0622cec14130172eae9cf166b92e5c112faff"], "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")

      },

      async approve() {
        let tokenInAddr = this.tokenList[this.tokenIn]['address']; 
        if (this.enable) {
          await SwapService.approve(tokenInAddr, "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", "115792089237316195423570985008687907853269984665640564039457584007913129639935");
        } else {
          await SwapService.approve(tokenInAddr, "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", "0");
        }
        // console.log(this.enable)
      }
    }
  }
</script>
