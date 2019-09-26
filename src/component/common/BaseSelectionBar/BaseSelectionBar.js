
export default {
  name: 'base-selection-bar',
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    openTooltip() {
      
      if (this.timer) return;
      
      this.visible = true;
      const _self = this;
      
      this.timer = setTimeout(() => {
        _self.visible = false;
        
        clearTimeout(this.timer);
        this.timer = null
      }, 2000)
    }
  },
  render() {
    return (
      <div class="base-selection-bar-container">
        <div class="content">
            您已选择
  
          <span onClick={() => this.$emit('show-panel')} onMouseover={() => this.visible = true} onMouseleave={() => this.visible = false}>
            {this.value.length}
            {this.visible && <div class="tooltip">可点击查看详情 <div class="arrow"></div></div>}
          </span>
  
          条数据
          <span class="clear-btn " onClick={() => this.$emit('toggle-selection')}>清空</span>
        </div>
      </div>
    )
  }
}