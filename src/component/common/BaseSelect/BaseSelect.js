import Vue from 'vue';
import {Select} from 'element-ui'


export default new Vue({
  mixins: [Select],
  data: function () {
    return {
      message: 'goodbye',
      bar: 'def'
    }
  },
  created: function () {
    console.log(this.$data)
    // => { message: "goodbye", foo: "abc", bar: "def" }
  }
})