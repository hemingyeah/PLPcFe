import Popper from 'popper.js';
import Page from '@model/Page';
import { debounce } from 'lodash'

const BizUserSelect = {
  name: 'biz-user-select',
  props: {
    id: {
      type: String,
      default: `biz-${Math.random() * 100000 >> 0}`
    },
    /** 组件值 */
    value: [String, Object, Array],
    /** 是否多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 获取人员数据的方法 */
    fetch: {
      type: Function,
      default() {
        // TODO: 用户默认数据源
      }
    },
    placeholder: {
      type: String,
      default: '请选择人员'
    },
  },
  data() {
    return {
      $popper: null,

      // 是否显示popper
      popperVisible: false,
      popperWidth: 0,

      page: new Page(),
      loading: false,
      params: {
        pageSize: 50,
        pageNum: 1,
        keyword: ''
      },
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore
      },

      // 组件关闭
      onClose: event => {
        let target = event.target;
        let data = this.$data;

        if (target == data.$referenceEl) return;

        this.close()
      }
    }
  },
  computed: {
    isEmpty() {
      if (this.multiple) return this.value.length == 0;
      return null == this.value || Object.keys(this.value).length == 0;
    }
  },
  methods: {
    /** 是否包含所选数据，用于渲染已选项 */
    contains(item) {
      let pk = 'userId';
      if (Array.isArray(this.value)) return this.value.findIndex(i => i[pk] == item[pk]) >= 0;
      if (typeof this.value == 'string') return this.value == item;
      if (typeof this.value == 'object') return this.value[pk] == item[pk];

      return false;
    },
    choose(value) {
      let item = {
        userId: value.userId,
        displayName: value.displayName,
        staffId: value.staffId,
        head: value.head || ''
      }

      if (!this.multiple) {
        this.$emit('input', item);
        this.close();
        return;
      }

      // 多选
      let index = this.value.findIndex(i => i.userId === item.userId);
      index >= 0 ? this.value.splice(index, 1) : this.value.push(item);

      this.$emit('input', this.value);
      this.updatePopper();
    },
    /** 删除选中项 */
    remove(event, item) {
      event.stopPropagation();

      let index = this.value.findIndex(i => item == i);
      if (index >= 0) this.value.splice(index, 1)
      this.updatePopper();
    },
    close() {
      if (!this.popperVisible) return;
      this.popperVisible = false;
    },
    /** 清空选中项 */
    clear(event) {
      event.stopPropagation();
      let value = this.multiple ? [] : {};
      this.$emit('input', value);
      this.close();
    },
    handleInput: debounce(function (event) {
      this.params.keyword = event.target.value;
      this.search()
    }, 500),
    async search() {
      this.params.pageNum = 1;
      this.page.list = [];
      this.loading = true;
      try {
        let page = await this.fetchData(this.params);
        this.page.merge(page);
        this.params.pageNum = page.pageNum;
        this.params.pageSize = page.pageSize;
      } catch (error) {
        console.error(error)
      }
      this.loading = false;
      this.loadmoreOptions.disabled = !this.page.hasNextPage;
    },
    async loadmore() {
      this.loadmoreOptions.disabled = true;
      this.loading = true;

      try {
        this.params.pageNum += 1;
        let page = await this.fetchData(this.params)
        this.page.merge(page);
        this.params.pageNum = page.pageNum;
        this.params.pageSize = page.pageSize;
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.page.hasNextPage;
    },
    async initData() {
      this.loading = true;
      try {
        let page = await this.fetchData(this.params);
        this.page.merge(page);
        this.params.pageNum = page.pageNum;
        this.params.pageSize = page.pageSize;
      } catch (error) {
        console.error(error)
      }
      this.loading = false;
      this.loadmoreOptions.disabled = !this.page.hasNextPage;
    },
    fetchData(params) {
      return this.fetch(params).then(res => {
        return null == res ? Promise.reject('[biz-user-select]: no result data.') : res
      })
        .catch(err => console.error(err));
    },
    /** 显示popper */
    showPopper(event) {
      event.stopPropagation();

      // 如果没创建popper，先创建
      if (this.$data.$popper == null) {
        document.body.appendChild(this.$refs.popper)
        this.$data.$popper = new Popper(this.$el, this.$refs.popper, {
          placement: 'bottom-start',
          removeOnDestroy: true,
          onUpdate: this.updatePopperWidth
        });

        // 取第一页数据
        this.initData()
      }

      // 更新宽度
      this.popperWidth = this.$el.offsetWidth;
      this.popperVisible = true;
      this.$data.$popper.update();
      this.$nextTick(() => this.$refs.search.focus())
    },
    updatePopper() {
      if (this.$data.$popper) {
        let oldHeight = this.$el.offsetHeight;
        this.$nextTick(() => {
          let currHeight = this.$el.offsetHeight;
          if (currHeight != oldHeight) this.$data.$popper.update()
        })
      }
    },
    updatePopperWidth() {
      this.popperWidth = this.$el.offsetWidth;
    },
    renderUserList(h, items) {
      return items.map(item => {
        let clazz = ['biz-user-select-item'];
        if (this.contains(item)) clazz.push('biz-user-select-selected');

        return <div class={ clazz } onClick={ e => this.choose(item) }>{ item.displayName }</div>
      });
    },
    /** 渲染popper */
    renderPopper(h) {
      let style = {
        display: this.popperVisible ? 'block' : 'none',
        width: `${this.popperWidth}px`
      }

      let content = (
        this.loading
          ? <div class="biz-user-select-loading">正在加载...</div>
          : null
      )

      let panelAttrs = {
        directives: [
          {
            name: 'loadmore',
            value: this.loadmoreOptions
          }
        ]
      }

      return (
        <div class="biz-user-select-popper"
          style={ style } ref="popper"

          onClick={ e => e.stopPropagation() }>
          <input
            type="text" ref="search"
            class="search-user-keyword"
            placeholder="请选择成员"
            onInput={ this.handleInput } />
          <div class="biz-user-select-panel" { ...panelAttrs }>
            { content }
            { this.renderUserList(h, this.page.list) }
          </div>
        </div>
      )
    },
    /** 清除按钮 */
    renderClear() {
      if (this.isEmpty) return null;

      return (
        <button type="button" class="biz-user-select-clear" onClick={ e => this.clear(e) } key="clear">
          <i class="iconfont icon-yemianshanchu"></i>
        </button>
      )
    },
    /** 渲染团队tag */
    renderTag(item) {
      return (
        <span class="biz-user-select-tag">
          <i class="iconfont icon-yemianshanchu" onClick={ e => this.remove(e, item) }></i>
          <span class="biz-user-select-tag-text">{ item.displayName }</span>
        </span>
      );
    },
    /** 多选时需要渲染 */
    renderMultiple() {
      let inner = (
        this.isEmpty
          ? <p class="biz-user-select-placeholder">{ this.placeholder }</p>
          : this.value.map(item => this.renderTag(item))
      )

      return (
        <div class="biz-user-select-tags" onClick={ e => this.showPopper(e) }>
          { inner }
        </div>
      );
    },
    /** 单选时渲染输入框即可 */
    renderSingle(h) {
      let value = this.value || {};
      let inner = this.isEmpty
        ? <p class="biz-user-select-placeholder">{ this.placeholder }</p>
        : <p>{ value.displayName }</p>

      return <div class="biz-user-select-input-inner">{ inner }</div>
    }
  },
  render(h) {
    let clazz = ['biz-user-select'];
    return (
      <div class={ clazz } onClick={ e => this.showPopper(e) }>
        <input id={ this.id } type="text" />
        { this.renderClear(h) }
        { this.multiple ? this.renderMultiple(h) : this.renderSingle(h) }
        { this.renderPopper(h) }
      </div>
    );
  },
  mounted() {
    document.addEventListener('click', this.onClose);
  },
  beforeDestroy() {
    // 销毁popper
    if (this.$data.$popper) {
      this.$data.$popper.destroy();
      if (this.$refs.popper && this.$refs.popper.parentNode == this.$data.$parentEl) {
        this.$data.$parentEl && this.$data.$parentEl.removeChild(this.$refs.popper);
      }
    }
  },
  destroyed() {
    document.removeEventListener('click', this.onClose);
  }
}

export default BizUserSelect;