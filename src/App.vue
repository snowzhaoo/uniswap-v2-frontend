<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >

      <vue-metamask 
          userMessage="msg" 
          @onComplete="onComplete"
      >
      </vue-metamask>
      <v-spacer></v-spacer>

      <!-- <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      > -->
        <!-- <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn> -->
      <p id="address">({{network}}) {{address}}</p>
    </v-app-bar>

    <v-content id="main">
      <!-- <HelloWorld/> -->
      <Centered ref="Centered" :web3 = "web3" />
    </v-content>

  </v-app>
</template>

<script>
// import HelloWorld from './components/HelloWorld';
import Centered from './components/Centered';
import VueMetamask from 'vue-metamask';
import Web3 from 'web3';

export default {
  name: 'App',

  components: {
    Centered,VueMetamask
  },

  data: () => ({
    address: '0x0000000000000000000000000000000000000000',
    network: "",
    web3: {},
    msg: "This is demo net work"
  }),
  methods:{
    onComplete(data){
        console.log('data:', data);
        // console.log(typeof(data.web3))
        // let web3 = new Web3(data.web3.currentProvider);    
        let web3 = new Web3(data.web3.currentProvider);      
  
        this.address = data.metaMaskAddress;
        this.$refs.Centered.initTokenList(web3);
        // this.$refs.Centered.init(data);
        
        // this.web3 = new Web3(data.web3.currentProvider);
        this.web3 = data.web3;
        switch (data.netID) {
          case '1': this.network = 'Main';break;
          case '3': this.network = 'Ropsten';break;
          case '4': this.network = 'Rinkeby';break;
          case '5': this.network = 'Goerli';break;
          case '42': this.network = 'Kovan';break;
        }
    }
  }
};
</script>

<style scoped>
#address {
  margin-bottom: 0px;
}
#main {
  margin-top: 64px;
}
</style>
