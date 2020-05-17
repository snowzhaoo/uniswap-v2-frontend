<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid>

        <v-row :style="alertSeen" align="center" justify="center">
          <v-col cols="12" sm="8" md="6"> 
              <v-alert type="warning">
                Please enable the token first
              </v-alert>
          </v-col>
        </v-row>
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
                      <v-col class="d-flex" cols="12" sm="6">
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

                      <v-col class="d-flex" cols="12" sm="6">
                        <v-select
                          id="tokenIn"
                          v-model="tokenIn"
                          :items="itemsIn"
                          label="Symbol"
                          hide-selected
                          @change="changeTokenIn"
                        ></v-select>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="6">
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

                      <v-col class="d-flex" cols="12" sm="6">
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
import { truncate } from '@/utils/StringHelper.js';
// import Web3 from 'web3';
import Big from 'big.js';
// const BN = Web3.utils.BN;
  export default {
    name: 'Centered',
    props: {
      source: String,
      web3: {
        type: Object
      }
    },
    data: () => ({
      itemsIn: [{text: "ETH", value:0,disabled: false}],
      itemsOut: [{text: "ETH", value:0,disabled: false}],

      tokenIn: 0,
      tokenOut: 0,

      amountIn: 0,
      amountOut: 0,

      tokenList: [],
      enable: false,
      seen: false,
      tokensDic: Object,
      exacAmount: '',
      path: [],

      alertSeen: {visibility: "hidden"},

    }),
    methods: {
      alert30Seconds() {
          this.alertSeen = {visibility: "visible"}
        setTimeout(() => {
          this.alertSeen = {visibility: "hidden"}
        }, 1000 * 3)
      },
      // async init(data) {
      //   SwapService.initService(data);
        
      //   // TokenListService.initService(data.web3.currentProvider);
      // },
      // async initTokenList(currentProvider) {
      async initTokenList(web3) {
        TokenListService.initService(web3);
        SwapService.initService(web3);
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
      
        // console.log(tokens)


        let tokenAddrList = [];

        tokens.map((o) => {
          o.map((j,i) => {
            if (i < 2) {
              tokenAddrList.push(j)
            }
          })
        })
        tokenAddrList= Array.from(new Set(tokenAddrList));

        this.items = tokenAddrList;

        this.tokenList = await TokenListService.erc20Info(tokenAddrList);
        let optionList = [{text: "ETH", value:0,disabled: false}]
        let optionTokenList = this.tokenList.map((o, i) => {
          this.tokensDic[o.address] = {
            decimals: o.decimals,
            name: o.name,
            symbol: o.symbol
          }
          return { text: `${o.symbol}\u3000${truncate(o.address, 13, 12, 3)}`, value: ++i, disabled: false}
        })
        optionList = optionList.concat(optionTokenList);
      console.log(optionList)
        tokens.map((o) => {
          UniswapV2Service.pairFactory(o, this.tokensDic);
        })

        this.itemsIn = optionList;
        this.itemsOut = optionList;

        console.log("init end");

      },
      async changeAmountIn(e) {
        if (e > 0) {

          // console.log("hello") 
          // console.log(this.tokenOut) 
          const tokenIn = this.tokenList[this.tokenIn]['address'];
          const tokenOut = this.tokenList[this.tokenOut]['address'];

          let amountIn = new Big(e).times(`1e${this.tokensDic[tokenIn]['decimals']}`).toFixed().toString()
          const result = UniswapV2Service.bestTradeExactIn(tokenIn, amountIn, tokenOut)

          if (result.length == 0) {
              //error
          } else {
            //TODO 
            let path = result[0]['route']['path'];
            this.path = path.map((o) => o.address);

            let amount = await SwapService.getAmountsOut(amountIn, this.path);
            this.amountOut = new Big(amount[1]).div(`1e${this.tokensDic[tokenOut]['decimals']}`).toFixed().toString();
            this.exacAmount = 'in';

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
            this.path = path.map((o) => o.address);

            let amount = await SwapService.getAmountsIn(amountOut, this.path);
            this.amountIn = new Big(amount[0]).div(`1e${this.tokensDic[tokenIn]['decimals']}`).toFixed().toString();
            this.exacAmount = 'out';

          }
        } else {
          this.amountIn = 0;
        }

      },
      async changeTokenIn(e) {
        this.itemsOut.map((o) => o.disabled = false);
        this.itemsOut[e].disabled = true;
        //get allowance
        let allowance = new Big(await SwapService.allowance(this.tokenList[this.tokenIn]['address'], "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a")) 
        this.enable = !allowance.eq(0);

        this.seen = this.tokenIn == 0 ? false: true;
        this.amountIn = 0;
        this.amountOut = 0;
      },
      changeTokenOut(e) {
        this.itemsIn.map((o) => o.disabled = false)
        this.itemsIn[e].disabled = true;
        this.amountIn = 0;
        this.amountOut = 0;
      },
      async swap(){

        let allowance = new Big(await SwapService.allowance(this.tokenList[this.tokenIn]['address'], "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a")) 
        if (allowance.eq(0)) {
          this.alert30Seconds()
        } else {

          let tokenIn = this.tokenList[this.tokenIn]['address']
          let tokenOut = this.tokenList[this.tokenOut]['address']

          switch (this.exacAmount) {
            case 'in' : {
              let amountIn = new Big(this.amountIn).times(`1e${this.tokensDic[tokenIn]['decimals']}`).toFixed().toString()
              await SwapService.swapExactTokensForTokens(amountIn, 1, this.path, "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")
            }break;
            case 'out': {
            let amountOut = new Big(this.amountOut).times(`1e${this.tokensDic[tokenOut]['decimals']}`).toFixed().toString();
            await SwapService.swapTokensForExactTokens(amountOut, new Big(this.amountIn).times(1.1).toFixed().toString(), this.path, "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")
            }break;
          }
        }

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
