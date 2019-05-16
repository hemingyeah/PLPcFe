import Vue from '@src/common/entry';

const app = new Vue({
  el: '#app',
  methods: {
    createWindow(){
      this.$createWindow({
        title: `window-${Math.random() * 10000 >> 0}`
      })
    }
  },
  render(){
    return (
      <div>
        <button type="button" onClick={this.createWindow}>创建窗口</button>
      </div>
    )
  }
})

export default app;
