module.exports = {
    publicPath: '/uniswap-v2-frontend/',
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    open: true, //是否自动弹出浏览器页面
    host: "localhost", 
    port: '8080', 
    https: false,   //是否使用https协议
    hotOnly: false, //是否开启热更新
    proxy: null,
  }
}