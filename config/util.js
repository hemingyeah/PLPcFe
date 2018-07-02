const path = require('path');

module.exports = {
  /** 生成sass-resources-loader */
  genSassResourceLoader(){
    return {
      loader: 'sass-resources-loader',
      options: {
        resources: [
          path.resolve(__dirname, '../src/assets/scss/_variables.scss'), 
          path.resolve(__dirname, '../src/assets/scss/_mixins.scss')
        ]
      }
    }
  }
}