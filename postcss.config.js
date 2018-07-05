/** postcss配置 @author dongls */

//https://www.npmjs.com/package/postcss-px2rem
//let px2rem = require('postcss-px2rem');

module.exports = {
  plugins: [
    require('autoprefixer'),
    //px2rem({remUnit: 10})
  ]
}