import * as util from './util';
import _ from 'lodash'

import Popper from 'popper.js';
import Page from '@model/Page';
import * as TeamApi from '@src/api/TeamApi'
import BaseTreeDept from '../../common/BaseTreeDept';
import Clickoutside from '@src/util/clickoutside'
import http from '@src/util/http'
/**
 * TODO: item option render(jsx、template)
*/
const BizTeamSelect = {
  name: 'biz-team-select',
  props: {
    /** 定位点元素 */
    reference: [String, HTMLElement],
    /** 父元素，默认为body */
    parent: [String, HTMLElement],
    /** 选择框的id */
    id: String,
    /** 选择框的name */
    name: String,
    /** 是否多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false
    },
    /** 样式名，添加输入框上 */
    className: {
      type: Array,
      default: () => []
    },
    /** 样式名，添加希腊区域上 */
    popperClassName: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择部门'
    },
    value: {
      type: Array,
      default: () => []
    },
    /** 是否折叠tag */
    collapse: {
      type: Boolean,
      default: false
    },
    fetchFunc: {
      type: Function,
      default(params){ 
        return TeamApi.tagList(params)
      }
    },
    serializer: {
      type: Function,
      default(params){
        return Array.isArray(params) ? params.map(i => i.id).join(',') : params.id;
      }
    },
    /** 
     * popper options
     * @see https://github.com/FezVrasta/popper.js/blob/master/docs/_includes/popper-documentation.md
     */
    popperOptions: {
      type: Object,
      default: () => ({})
    },
    isAutoSelectChild: {
      type: Boolean,
      default: false
    }

  },
  data(){
    return {
      $parentEl: util.getParentEl(this.parent),
      $popper: null,
      
      // 是否显示popper
      popperVisible: false,
      popperWidth: 0,
      loading: false,
      page: new Page(),
      params: {
        keyword: '',
        seeAllOrg: true
      },
      
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore
      },
      // 组件关闭
      onClose: event => {
        let target = event.target;
        let data = this.$data;
        if (target == data.$referenceEl || this.$refs.popper.contains(target)) return;
        
        this.close()
      }
    }
  },
  computed: {
    isEmpty() {
      return null == this.value || this.value.length == 0;
    },
    formValue() {
      return this.serializer(this.value)
    }
  },
  directives: { Clickoutside },
  methods: {
    getValue(isArray = false){
      if(!isArray) return this.value;
      
      return (
        Array.isArray(this.value) 
          ? this.value 
          : null != this.value ? [this.value] : []
      )
    },
    loadmore() {
      this.loadmoreOptions.disabled = true;
      this.loading = true;
      this.params.pageNum += 1;
      
      this.fetchTeam('merge');
    },
    handleInput: _.debounce(function (event) {
      event.stopPropagation();
      this.params.keyword = event.target.value;
      this.params.pageNum = 1;
      this.fetchTeam('cover');

      if (this.$refs.selectPanel) {
        this.$refs.selectPanel.scrollTop = 0;
      }
    }, 300),
    close(){
      if(!this.popperVisible) return;
      this.popperVisible = false;
      this.$emit('close')
    },
    choose(value){
      // 单选
      if(!this.multiple){
        let data = this.value.every(s => s.id !== value.id) ? [value] : [];
        this.close();
        return this.$emit('input', data);
      }
      
      // 多选
      let index = this.value.findIndex(item => item.id === value.id);
      if (this.isAutoSelectChild) {
        this.chooseValueHandler(index, value)
      } else {
        index >= 0 ? this.value.splice(index, 1) : this.value.push(value);
      }
      
      this.$emit('input', this.value);
      this.updatePopper();
    },
    chooseValueHandler(index = -1, value = {}) {
      let children = value.children || [];
      // 是否 已选中
      let isSelected = index >= 0;
      // 是否为 主团队且有子团队
      let isParentAndHasValue = Array.isArray(children) && children.length > 0;

      isSelected ? this.value.splice(index, 1) : this.value.push(value);

      // 如果允许 自动选择子团队 且 子团队有数据
      if (this.isAutoSelectChild && isParentAndHasValue) {
        this.chooseParentTeamValueHandler(index, value, isSelected);
      }
    },
    // 选中主团队处理
    chooseParentTeamValueHandler(index = -1, value = {}, isSelected = false) {
      let children = value.children || [];
      let currentValue = this.value || [];

      for (let i = 0; i < children.length; i++) {
        let item = children[i];
        let itemIndex = currentValue.findIndex(v => v.id === item.id);
        itemIndex > -1 && currentValue.splice(itemIndex, 1);
      }

      if (!isSelected) {
        this.value = [...this.value, ...children];
      }

    },
    /** 删除选中项 */
    remove(event, item){
      event.stopPropagation()
      
      let index = this.value.findIndex(i => item == i)
      if(index >= 0) this.value.splice(index, 1)
      this.updatePopper();
      this.$emit('input', this.value.filter(value => {
        return value.id !== item.id
      }));
    },
    /** 清空选中项 */
    clear(event){
      event.stopPropagation();
      this.$emit('input', []);
      this.close();
    },
    getSeeAllOrg() {
      return http.post('/setting/user/getSeeAllOrg').then((result) => {
        return result
      })
    },
    /** 获取团队数据 */
    async fetchTeam(action){
      try {
        this.loading = true;
        try {
          let result = await this.getSeeAllOrg()
          this.params.seeAllOrg = result.data
        } catch (error) {
          this.params.seeAllOrg = true
        }
        let page = await this.fetchFunc(this.params);
        if (!page) return;
        this.page = page; 
        this.loadmoreOptions.disabled = !this.page.hasNextPage;
        this.loading = false;
      } catch(err) {
        console.error(err)
      }
    },
    
    /** 显示popper */
    showPopper(event){
      if (this.disabled) return
      // 已显示 则需要关闭
      if (this.popperVisible) return this.close()
      
      this.$emit('open')
      
      // 如果没创建popper，先创建
      if(this.$data.$popper == null){
        let options = {
          placement: 'bottom-start',
          removeOnDestroy: true,
          onUpdate: this.updatePopperWidth
        }
        
        this.$data.$parentEl.appendChild(this.$refs.popper)
        this.$data.$popper = new Popper(this.$el, this.$refs.popper, {...options, ...this.popperOptions });
      }
      
      // 更新宽度
      this.popperWidth = this.$el.offsetWidth
      this.popperVisible = true
      this.$data.$popper.scheduleUpdate()
      this.$nextTick(() => {
        this.$refs.search.focus()
        if(this.$refs.selectPanel) this.$refs.selectPanel.scrollTop = 0
      })
      
      if(this.page.hasNextPage && !this.page.list.length ) {
        this.fetchTeam('merge')
      }
    },
    /** 更新popper定位 */
    updatePopper(){
      if(this.$data.$popper) {
        let oldHeight = this.$el.offsetHeight;
        this.$nextTick(() => {
          let currHeight = this.$el.offsetHeight;
          if(currHeight != oldHeight) this.$data.$popper.scheduleUpdate()
        })
      }
    },
    updatePopperWidth(){
      this.popperWidth = this.$el.offsetWidth;
    },
    toggleExpand(event, item){
      event.stopPropagation();
      this.$set(item, 'expand', item.expand === false)
    },
    renderPrefix(item){
      if(null == item.children || item.children.length == 0) return null;
      let icon = ['iconfont', item.expand !== false ? 'icon-shouqi' : 'icon-zhankai'];
      return (
        <span onClick={e => this.toggleExpand(e, item)} class="biz-team-select-expand">
          { <i class={icon}></i> }
        </span>
      )
    },
    /** 渲染popper */
    renderPopper(h) {
      let clazz = ['biz-team-select-popper', this.popperClassName].filter(cn => cn);
      
      let style = {
        display: this.popperVisible ? 'block' : 'none',
        width: `${this.popperWidth}px`
      }
      
      let content = (
        this.loading
          ? <div class="biz-team-select-loading">正在加载...</div>
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
        <div class={clazz}
          style={style} ref="popper"
          onClick={e => e.stopPropagation()}
        >
          <input
            type="text" class="search-team-keyword"
            placeholder="请输入关键字搜索..." ref="search"
            onInput={this.handleInput} />
          <div class="biz-team-select-panel" {...panelAttrs} ref="selectPanel">
            {content}
            {/* {this.renderTree(h, this.page.list)} */}
            <base-tree-dept data={this.page.list} expand={true} selected={this.value} on-node-selected={this.choose} nodeRender={this.nodeRender}/>
          </div>
        </div>
      )
    },
    nodeRender(h, node) {
      return (<span>{node.tagName}</span>);
    },
    /** 清除按钮 */
    renderClear() {
      if (this.isEmpty) return null;
      
      return (
        <button type="button" class="biz-team-select-clear" onClick={e => this.clear(e)} key="clear">
          <i class="iconfont icon-circle-delete"></i>
        </button>
      )
    },
    /** 渲染团队tag */
    renderTag(item) {
      return (
        <div class="biz-team-select-tag" key={item.id}>
          <span class="biz-team-select-tag-text">{item.tagName || item.name}</span>
          <i class="iconfont icon-circle-delete" onClick={e => this.remove(e, item)}></i>
        </div>
      );
    },
    /** 多选时需要渲染 */
    renderMultiple() {
      let inner = (
        this.isEmpty
          ? <p class="biz-team-select-placeholder">{this.placeholder}</p>
          : this.collapse
            ? this.renderTag(this.value[0])
            : this.value.map(item => this.renderTag(item))
      );

      let collapseTags = (
        this.value.length > 1 && this.collapse
          ? <div class="biz-team-select-tag">+ {this.value.length - 1}</div>
          : null
      );

      return (
        <div class="biz-team-select-tags">
          {inner}
          {collapseTags}
        </div>
      );
    },
    /** 单选时渲染输入框即可 */
    renderSingle(h) {
      let value = Array.isArray(this.value) ? this.value[0] : this.value;
      let inner = this.isEmpty 
        ? <p class="biz-team-select-placeholder">{ this.placeholder }</p>
        : <p>{ value ? value.tagName : '' }</p>;
        
      return <div class="biz-team-select-input-inner">{ inner }</div>
    },
    /* 渲染箭头 */
    renderArrow(h) {
      return (
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i class={['el-select__caret', 'el-input__icon', 'el-icon-arrow-up', this.popperVisible ? 'is-reverse' : '']}></i>
          </span>
        </span>
      )
    }
  },
  render(h){
    let clazz = ['biz-team-select', 'el-input', 'el-input__inner']
    
    if (this.disabled) {
      clazz.push('biz-team-select-disabled')
    }

    if (Array.isArray(this.className) && this.className.length > 0) {
      clazz = clazz.concat(this.className)
    }
    
    if(this.popperVisible) clazz.push('biz-team-select-open')
    
    return (
      <div class='el-select el-input--small el-input--suffix biz-team-select-block'>
        <div class={clazz} onClick={e => this.showPopper(e)}>
          <input id={this.id} name={this.name} type="text" value={this.formValue}/>
          { this.renderClear(h) }
          { this.multiple ? this.renderMultiple(h) : this.renderSingle(h) }
          { this.renderPopper(h) }
          { this.renderArrow(h) }
        </div>
      </div>
    )
  },
  mounted() {
    document.addEventListener('click', this.onClose, true);
  },
  beforeDestroy() {
    // 销毁popper
    if (this.$data.$popper) {
      this.$data.$popper.destroy();
      if (this.$refs.popper && this.$refs.popper.parentNode == this.$data.$parentEl) {
        this.$data.$parentEl.removeChild(this.$refs.popper);
      }
    }
  },
  destroyed() {
    document.removeEventListener('click', this.onClose, true);
  },
  components: {
    [BaseTreeDept.name]: BaseTreeDept
  }
}

export default BizTeamSelect;
