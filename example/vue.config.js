const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/ps/',
  configureWebpack: {
    resolve: {
      alias: {
        vue: path.resolve('./node_modules/vue'),
      }
    }
  },
  css: {
    loaderOptions: {
      less: {}
    }
  }
})
