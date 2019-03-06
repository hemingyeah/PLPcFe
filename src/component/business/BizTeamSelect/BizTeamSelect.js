import * as util from './util';
import * as TeamApi from '@src/api/TeamApi'

import Popper from 'popper.js';
import Page from '@model/Page';

const BizTeamSelect = {
  name: 'biz-team-select',
  props: {
    /** 定位点元素 */
    reference: [String, HTMLElement],
    /** 父元素，默认为body */
    parent: [String, HTMLElement],
    /** 选择框的id */
    id: String,
    /** 是否多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 样式名，添加输入框上 */
    className: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '请选择团队'
    },
    initValue: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      $parentEl: util.getParentEl(this.parent),
      $popper: null,

      // 是否显示popper
      popperVisible: false,   
      popperWidth: 0,

      value: this.initValue, // copy
      // value: this.multiple ? [] : null,
      loading: false,
      page: new Page(),
      params: {
        pageSize: 10,
        pageNum: 1,
        keyword: '',
        onlyParent: true,
        //是否只查主团队，true时只查出主团队来，子团队附带在主团队的children里，同时搜索条件支持子团队查询；不传或false时主团队和子团队会在同一级返回
      },
      
      // 组件关闭
      onClose: event => {
        let target = event.target;
        let data = this.$data;

        if(target == data.$referenceEl) return;
        
        this.close()
      }
    }
  },
  computed: {
    isEmpty(){
      return null == this.value || this.value.length == 0;
    }
  },
  methods: {
    getValue(isArray = false){
      if(!isArray) return this.value;

      return Array.isArray(this.value) 
        ? this.value 
        : null != this.value ? [this.value] : [];
    },
    setValue(value){
      // 设置value
    },
    loadMore(e) {
      const dom = e.target;
      const clientHeight = dom.clientHeight;
      const scrollTop = dom.scrollTop;
      const scrollHeight = dom.scrollHeight;
    
      if (this.loading) return;
      if (scrollTop + clientHeight < scrollHeight) return;
      if (!this.page.hasNextPage) return;
      this.params.pageNum++;
  
      this.fetchTeam('merge');
    },
    handleInput(event) {
      this.params.keyword = event.target.value;
      this.params.pageNum = 1;
      this.fetchTeam('cover');
    },
    close(){
      if(!this.popperVisible) return;
      this.popperVisible = false;
    },
   
    choose(value){
      // 单选
      if(!this.multiple){
        this.value = this.value.every(s => s.id !== value.id) ? [value] : [];
        this.close();
        return this.$emit('input', this.value);
      }

      // 多选
      let index = this.value.findIndex(item => item.id === value.id);
      index >= 0 ? this.value.splice(index, 1) : this.value.push(value);

      this.$emit('input', this.value);
      this.updatePopper();
    },
    /** 删除选中项 */
    remove(event, item){
      event.stopPropagation();

      let index = this.value.findIndex(i => item == i);
      if(index >= 0) this.value.splice(index, 1)
      this.updatePopper();
    },
    /** 清空选中项 */
    clear(event){
      event.stopPropagation();

      this.value = [] ;
      this.$emit('input', this.value);
      this.close();
    },

    /** 获取团队数据 */
    async fetchTeam(action){
      this.loading = true;
      try {
        // let page = await TeamApi.list();
        let page = await TeamApi.tagList(this.params);
        if (!page) return;
        
        this.page[action](page)
      } catch(err) {
        console.error(err)
      }

      this.loading = false;
    },

    /** 显示popper */
    showPopper(event){
      event.stopPropagation();

      // 如果没创建popper，先创建
      if(this.$data.$popper == null){
        this.$data.$parentEl.appendChild(this.$refs.popper)
        this.$data.$popper = new Popper(this.$el, this.$refs.popper, {
          placement: 'bottom-start',
          removeOnDestroy: true,
          onUpdate: this.updatePopperWidth
        });
      }

      // 更新宽度
      this.popperWidth = this.$el.offsetWidth;
      this.popperVisible = true;
      this.$data.$popper.update();

      if(this.page.hasNextPage && !this.page.list.length ) {
        this.fetchTeam('merge');
      }
    },
    updatePopper(){
      if(this.$data.$popper) {
        this.$nextTick(this.$data.$popper.update)
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
    renderItem(h, item){
      let clazz = ['biz-team-select-item']
      if(this.getValue(true).findIndex(i => i.id == item.id) >= 0) clazz.push('biz-team-select-selected');

      return (
        <div class={clazz} onClick={e => this.choose(item)} key={item.id}>
          { this.renderPrefix(item) }
          <div class="biz-team-select-name">{ item.tagName || item.name}</div>
        </div>
      )
    },
    renderSubItem(h, items = []){
      return items.map((item, index) => {
        let clazz = ['biz-team-select-item biz-team-select-subItem']
        if(index == 0) clazz.push('biz-team-select-subItem-start')
        if(index == items.length - 1) clazz.push('biz-team-select-subItem-end')
        if(this.getValue(true).findIndex(i => i.id == item.id) >= 0) clazz.push('biz-team-select-selected');

        return (
          <div class={clazz} onClick={e => this.choose(item)} key={item.id}>
            <div class="biz-team-select-line"></div>
            <div class="biz-team-select-name">{ item.tagName || item.name }</div>
          </div>
        );
      })
    },
    /** 渲染团队树 */
    renderTree(h, items = []){
      let teamItems = [];

      for(let i = 0; i < items.length; i++){
        let item = items[i];
        teamItems.push(this.renderItem(h, item))

        if(item.children && item.children.length && item.expand !== false){
          teamItems = teamItems.concat(this.renderSubItem(h, item.children))
        }
      }

      return teamItems;
    },
    /** 渲染popper */
    renderPopper(h){
      let style = {
        display: this.popperVisible ? 'block' : 'none',
        width: `${this.popperWidth}px`
      }

      let content = (
        this.loading 
          ? <div class="biz-team-select-loading">正在加载...</div>
          : null
      )

      return (
        <div class="biz-team-select-popper" 
          style={style} ref="popper"
          onScroll={this.loadMore}
          onClick={e => e.stopPropagation()}>
          <input type="text" class="search-team-keyword" onInput={this.handleInput} placeholder=""/>
          { content }
          {this.renderTree(h, this.page.list)}
        </div>
      )
    },
    /** 清除按钮 */
    renderClear(){
      if(this.isEmpty) return null;

      return (
        <button type="button" class="biz-team-select-clear" onClick={e => this.clear(e)} key="clear">
          <i class="iconfont icon-fe-close"></i>
        </button>
      )
    },
    /** 渲染团队tag */
    renderTag(item){
      return (
        <span class="biz-team-select-tag">
          <i class="iconfont icon-fe-close" onClick={ e => this.remove(e, item)}></i>
          <span class="biz-team-select-tag-text">{item.tagName || item.name}</span>
        </span>
      );
    },
    /** 多选时需要渲染 */
    renderMultiple(){
      let inner = (
        this.isEmpty 
          ? <p class="biz-team-select-placeholer">{ this.placeholder }</p> 
          : this.value.map(item => this.renderTag(item))
      )

      return (
        <div class="biz-team-select-tags" onClick={e => this.showPopper(e)}>
          {inner}
        </div>
      );
    },
    /** 单选时渲染输入框即可 */
    renderSingle(h){
      let inner = this.isEmpty 
        ? <p class="biz-team-select-placeholer">{ this.placeholder }</p>
        : <p>{ this.value ? this.value.name : '' }</p>

      return <div class="biz-team-select-input-inner">{ inner }</div>
    }
  },
  render(h){
    let clazz = ['biz-team-select'];
    if(Array.isArray(this.className) && this.className.length > 0){
      clazz = clazz.concat(this.className)
    }

    if(this.popperVisible) clazz.push('biz-team-select-open');
    return (
      <div class={clazz} onClick={e => this.showPopper(e)}>
        <input id={this.id} type="text"/>
        { this.renderClear(h) }
        {/*{ this.multiple ? this.renderMultiple(h) : this.renderSingle(h) }*/}
        {this.renderMultiple(h)}
        { this.renderPopper(h) }
      </div>
    )
  },
  mounted(){
    document.addEventListener('click', this.onClose);
  },
  beforeDestroy(){
    // 销毁popper
    if(this.$data.$popper){
      this.$data.$popper.destroy();
      if(this.$refs.popper && this.$refs.popper.parentNode == this.$data.$parentEl) {
        this.$data.$parentEl.removeChild(this.$refs.popper);
      }
    }
  },
  destroyed(){
    document.removeEventListener('click', this.onClose);
  }
}

export default BizTeamSelect;