const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/ps/',
  css: {
    loaderOptions: {
      less: {}
    }
  }
})
