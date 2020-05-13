<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>

        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4"> 
              <v-alert type="warning">
                Please enable the token first
              </v-alert>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">

          <v-col cols="12" sm="8" md="4" >
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Token Swap</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip>

                  <template v-slot:activator="{ on }">
                      <v-switch v-model="enable" @change="approve" :label="enable ? 'enabled': 'enable\u3000'" v-on="on"></v-switch>
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
// const abi = require(`@/abi/UniswapV2.json`)

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
      seen: false
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
        let tokenAddrList = [];

        tokens.map((o) => {
          tokenAddrList = tokenAddrList.concat(o);
        })
        tokenAddrList= Array.from(new Set(tokenAddrList));
        this.items = tokenAddrList;

        this.tokenList = await TokenListService.erc20Info(tokenAddrList);

        let optionList = this.tokenList.map((o, i) => {return { text: o.symbol, value: i, disabled: false}});

        this.itemsIn = optionList;
        this.itemsOut = optionList;

        console.log("init end");
      },
      changeTokenIn(e) {
        this.itemsOut.map((o) => o.disabled = false);
        this.itemsOut[e].disabled = true;
        // this.seen = true;
      },
      changeTokenOut(e) {
        this.itemsIn.map((o) => o.disabled = false)
        this.itemsIn[e].disabled = true;
      },
      async swap(){

        let tokenInAddr = this.tokenList[this.tokenIn]['address']
        let tokenOutAddr = this.tokenList[this.tokenOut]['address']
        console.log(this.tokenList)
        console.log(this.tokenIn)
        console.log(tokenInAddr)
        console.log(tokenOutAddr)

        // console.log(this.amountIn)
        // console.log(this.amountOut)
        // await SwapService.approve(tokenInAddr, "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", this.amountIn);
        // await SwapService.swapExactTokensForTokens(this.amountIn,1, [tokenInAddr, tokenOutAddr], "0x9e9066DF82fA9907A384778Ab65B001ceD42BD1E")


      },
      async approve() {
        console.log(this.tokenList[this.tokenIn]['address'])
        let tokenInAddr = this.tokenList[this.tokenIn]['address']; 
        // let tokenInAddr = this.tokenList[this.tokenIn]['address']
        await SwapService.approve(tokenInAddr, "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", "115792089237316195423570985008687907853269984665640564039457584007913129639935");
        // console.log(this.enable)
      }
    }
  }
</script>
