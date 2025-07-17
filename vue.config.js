const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: process.env.PORT || 8030,
    host: 'localhost',
    open: true,
    // 允许跨域请求
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization'
      }
  },
  
  // 环境变量配置
  chainWebpack: config => {
    // 定义环境变量
    config.plugin('define').tap(args => {
      args[0]['process.env'] = {
        ...args[0]['process.env'],
        BACKEND_PORT: JSON.stringify(process.env.BACKEND_PORT || '8083'),
        PORT: JSON.stringify(process.env.PORT || '8030'),
        COORDINATOR_PORT: JSON.stringify(process.env.COORDINATOR_PORT || '8060'),
        API_TIMEOUT: JSON.stringify(process.env.API_TIMEOUT || '30000'),
        AUTO_REFRESH_INTERVAL: JSON.stringify(process.env.AUTO_REFRESH_INTERVAL || '5000'),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
      return args
    })
  },
  
  // 输出配置
  outputDir: 'dist',
  assetsDir: 'static',
  
  // 生产环境配置
  productionSourceMap: false,
  
  // 公共路径
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
})
