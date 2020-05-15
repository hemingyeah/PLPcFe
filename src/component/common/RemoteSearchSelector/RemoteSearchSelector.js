export default {
  name: 'remote-search-selector',
  props: {
    id: {
      type: String,
      default: `remote-search-selector-${Math.random() * 100000 >> 0}`
    },
    /** 组件值 */
    value: [String, Object, Array],
    /** 是否多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 一键清空 */
    clearable: {
      type: Boolean,
      default: true
    },
    /** 远程搜索的方法 **/
    searchMethod: {
      type: Function,
      default:() => {
        return Promise.reject('Didn\'t pass a function that can search data from server.')
      }
    }
  
  },
  
  data: () => ({
    message: 'Hello, JSX!'
  }),
  methods: {
    renderItem() {
      return <div>ietm</div>
    },
    renderValue() {
      const {multiple, value} = this;
      if (!multiple) return <div class="test">{value}</div>;
      return <div>value</div>
    },
  },
  render() {
    return (
      <div className="remote-search-selector-container">
        111
        <div class="base-select-main-content">
          {this.renderValue()}
        </div>
        
        
        
      </div>
    );
  }
};