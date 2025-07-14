const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    port: 8061,
    proxy: {
      '/api/participant': {
        target: 'http://localhost:8061',
        changeOrigin: true,
      }
    }
  }
}
