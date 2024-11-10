// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
        '__VUE_OPTIONS_API__': JSON.stringify(true),  // Cambia a false si no usas Options API
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false)
      })
    ]
  }
});
