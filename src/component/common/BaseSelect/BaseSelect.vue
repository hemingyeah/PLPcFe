<template>
  <div class="base-select-container">
    <div class="content el-select el-input el-input--small el-input--suffix" v-clickoutside="closeList">
      <div class="base-select-main-content multiple-layout el-input el-input__inner" ref="normalInput"
           @click.stop="focusInput" v-if="multiple"
           :class="{'error': error, 'wrapper-is-focus': isFocus, 'clearable-layout': clearable}">

        <el-tag size="mini" closable v-for="tag in (collapsed ? value[0] ? [value[0]] : [] : value)"
                :key="getValueKey(tag)" @close="removeTag(tag)" disable-transitions type="info">
          {{tag.label || tag[valueKey]}}
        </el-tag>

        <div v-if="collapsed && value.length > 1" class='base-user-select-tag'>
          + {{value.length - 1}}
        </div>
        <span v-if="value.length <= 0" class="placeholder-text">
          {{ placeholder }}
        </span>

        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i class="el-select__caret el-input__icon el-icon-arrow-up" :class="showList && 'is-reverse'"></i>
          </span>
        </span>

      </div>
      
      <div 
        class="base-select-main-content" 
        @click.stop="focusInput" 
        ref="normalInput"
        v-else
        :class="{'error': error, 'wrapper-is-focus': isFocus, 'clearable-layout': clearable,}"
      >
        <slot name="label" :value="value" v-if="labelSlot"></slot>
        <template v-else>
          {{ value.map(tag => tag.label).join('') }}
        </template>

        <span v-if="value.length <= 0" class="placeholder-text">
          {{ placeholder }}
        </span>
      </div>

      <i v-if="clearable && value.length" class="iconfont icon-minus-fill clear-btn" @click="clearValue"></i>

      <div class="list-wrapper" ref="searchDom" v-show="showList"
           :style="selectCon ? `${topShow ? `top:${(selectCon.top - searchCon.height - 7)}px;` : `top:${(selectCon.top +selectCon.height +13)}px;`}left:${ selectCon.left}px;width:${selectCon.width}px` : ''">

        <template v-if="!topShow">
          <div class="arrow"></div>
          <div class="input-container" v-if="!options.length">
            <input type="text" v-model="keyword" @input="searchByKeyword" ref="input" :placeholder="placeholder">
          </div>
        </template>

        <ul class="option-list" v-loadmore="loadmoreOptions" ref="list">


          <li v-for="(op, index) in optionList" :key="index" @click="selectTag(op)"
              :class="{'selected': value.some(user => user[valueKey] ===op[valueKey])}">
            <slot name="option" :option="op" v-if="optionSlot"> </slot>
            <template v-else>{{op.label}}</template>
            <div class="checked"></div>
          </li>

          <li class="list-message" v-if="message">{{message}}</li>
        </ul>
        <template v-if="topShow">
          <div class="input-container" v-if="!options.length">
            <input type="text" v-model="keyword" @input="searchByKeyword" ref="input" :placeholder="placeholder">
          </div>

          <div class="arrow-bottom"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Clickoutside from '@src/util/clickoutside';
let timeInterval;
import Page from '@model/Page';
import _ from 'lodash';

/**
   * Todo
   * 1. 列表出现在上部还是下部。
   * 2. 点击空白隐藏列表。✅
   * 3. 配置 key value 的name，还是整理好列表传进来
   * 4. 关闭弹窗没有重置联系人 ✅
   * 5. 配置多选单选
   * 6. 配置可一键清空
   * 7. 配置是否远程搜索
   * 8. option的自定义
   * 9. 布局调整，搜索框和列表在一起
   * 10.
   */
export default {
  name: 'base-select',
  props: {
    remoteMethod: Function,
    value: {
      type: Array,
      default: () => ([]),
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    error: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
    },
    options: {
      type: Array,
      default: () => ([]),
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showList: false,
      pending: false,
      isFocus: false,
      keyword: '',
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore,
        distance: 10,
      },
      page: new Page(),
      selectCon: null,
      searchCon:null,
      topShow: false
    }
  },
  watch: {
    showList(newV, oldV) {
      if (newV == true) {
        timeInterval = setInterval(() => {
          let search_dom = this.$refs['searchDom'].getBoundingClientRect()
          let res_ = this.$refs['normalInput'].getBoundingClientRect()
          if(this.selectCon && this.selectCon.top == res_.top && this.selectCon.width == res_.width && this.selectCon.left == res_.left && this.selectCon.height == res_.height  ) return
          let bottomH = window.innerHeight
              - res_.y
              - res_.height;
          if (bottomH - 7 < search_dom.height) {
            this.topShow = true;
          }else{
            this.topShow = false;
          }
          this.selectCon = res_;
          this.searchCon = search_dom;
        }, 300)
      } else {
        clearInterval(timeInterval)
      }
    }
  },
  beforeDestroy() {
    clearInterval(timeInterval)
  },
  computed: {
    optionList() {
      if (this.options.length) return this.options;
      return this.page.list;
    },
    optionSlot() {
      return !!this.$scopedSlots.option;
    },
    labelSlot() {
      return !!this.$scopedSlots.label;
    },
    message() {
      const {
        total,
        hasNextPage,
      } = this.page;
      if (this.pending) {
        return '载入更多结果......';
      }
      if (!total) {
        return '未找到结果';
      }
      if (!hasNextPage) {
        return '已加载全部结果';
      }
      return '载入更多结果......';
    },
  },
  methods: {
    getValueKey(op) {
      return `${op[this.valueKey]}`;
    },
    focusInput() {
      if (this.disabled) return
      if (this.showList) return this.close()
      
      this.$emit('focus', this.$el)
      
      this.isFocus = true
      this.initList()
    },
    closeList(e) {
      this.showList = false;
      this.isFocus = false;
      this.pending = true;
      this.resetStatus('');
    },
    clearValue() {
      this.$emit('input', []);
    },
    removeTag(tag) {
      const newVal = this.value.filter(t => t[this.valueKey] !== tag[this.valueKey]);
      this.$emit('input', newVal);
    },
    selectTag(tag) {
      let newValue = this.value;

      if (!this.multiple) {
        newValue = [tag];
        this.showList = false;
        this.resetStatus();

      } else {
        if (this.value.every(t => t[this.valueKey] !== tag[this.valueKey])) {
          newValue.push(tag);
        } else {
          newValue = newValue.filter(t => t[this.valueKey] !== tag[this.valueKey]);
        }
      }

      this.$emit('input', newValue);
    },
    async loadmore() {
      this.loadmoreOptions.disabled = true;
      this.loading = true;

      try {
        this.page.pageNum += 1;
        const res = await this.search();
        this.page.merge(res);
      } catch (e) {
        console.error('e', e);
      }
    },
    search() {
      if (!this.remoteMethod) return;
      const {
        pageNum,
        pageSize,
      } = this.page;
      return this.remoteMethod({
        keyword: this.keyword,
        pageNum,
        pageSize,
      })
        .then(res => {
          this.pending = false;
          this.loadmoreOptions.disabled = res ? !res.hasNextPage : false;
          return res;
        })
        .catch(err => console.error(err))
    },
    searchByKeyword: _.debounce(function (e) {
      this.resetStatus(e.target.value);
      this.pending = true;
      this.search()
        .then(res => {
          if (!res || !res.list) return;
          this.$refs.list.scrollTop = 0;
          this.page = Page.as(res);
        })
        .catch(e => {
          console.log('searchByKeyword catch e', e)
        });
    }, 800),
    initList() {
      this.pending = true;
      this.showList = true;

      this.search()
        .then(res => {
          if (!res || !res.list) return;
          this.$refs.input.focus();

          this.page = Page.as(res);
        })
        .catch(e => {
          console.log('initList catch e', e)
        });
    },
    resetStatus(keyword) {
      this.keyword = keyword || '';
      this.page = new Page();
    },
    close() {
      this.showList = false;
    }
  },
  directives: {
    Clickoutside
  },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  .form-item.err :not(.is-success) input,
  .form-item.err :not(.is-success) .base-select-main-content {
    border-color: #f56c6c !important;
  }

  .base-select-container {
    position: relative;

    .content {
      position: relative;

      &:hover {
        .clear-btn {
          display: block;
        }
      }

      .clear-btn {
        position: absolute;
        display: none;
        top: 50%;
        right: 4px;
        transform: translateY(-50%);
        font-size: 12px;
        color: #c0c4cc;

        &:hover {
          cursor: pointer;
          color: #909399;
        }
      }
    }

    .base-select-main-content {

      display: flex;
      flex-wrap: wrap;
      border: 1px solid #e0e1e2;
      border-radius: 2px;
      padding: 0 10px;
      min-height: 32px;
      line-height: 30px;

      .placeholder-text {
        color: #9e9e9e;
        font-size: 14px;
        line-height: 20px;
        margin-top: 5px;
      }

      .el-tag {
        margin: 5px 3px 0px;
      }
    }

    .wrapper-is-focus {
      border-color: $color-primary;
    }

    .multiple-layout {
      padding-bottom: 5px;
    }

    .clearable-layout {
      padding-right: 20px;
    }

    .error.base-select-main-content {
      border-color: red;
    }

    .list-wrapper {
      border-radius: 4px;
      position: fixed;
      left: 0;
      top: calc(100% + 13px);
      width: 100%;
      // padding-top: 34px;
      box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.15);
      background: #fff;
      z-index: 99999;

      .arrow {
        position: absolute;
        width: 0;
        height: 0;
        top: -7px;
        left: 37px;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 7px solid white;
      }

      .arrow-bottom {
        position: absolute;
        width: 0;
        height: 0;
        bottom: -7px;
        transform: rotateZ(180deg);
        left: 37px;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 7px solid white;
      }

      .input-container {
        // position: absolute;
        width: 100%;
        // top: 0;
        // left: 0;
        padding: 4px 10px;
        line-height: 34px;


        input {
          width: 100%;
          margin: 2px 0;
          padding: 0 5px;
          height: 26px;
          line-height: 26px;
        }
      }

    }

    .option-list {
      max-height: 200px;
      overflow: auto;
      padding: 0;
      margin: 0;

      &::-webkit-scrollbar-track {
        background-color: white;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(144, 147, 153, 0.3);
      }


      li {
        list-style: none;
        padding: 0 10px;
        line-height: 34px;
        position: relative;

        &:hover {
          background: $color-primary-light-9;
        }

        .checked {
          display: none;
          position: absolute;
          right: 5px;
          top: calc(50% - 4px);
          width: 10px;
          height: 5px;
          border-left: 1px solid $color-primary;
          border-bottom: 1px solid $color-primary;
          transform: rotateZ(-45deg);
        }
      }

      li:last-child {
        &:hover {
          background: white;
        }
      }

      li.selected {
        background-color: #eef8f7;
        color: $color-primary;
        /*font-weight: 700;*/

        .checked {
          display: block;
        }
      }

      .list-message {
        color: $text-color-secondary;
      }
    }
  }

  .base-user-select-tag {
    background-color: #f0f2f5;
    height: 22px;
    margin: 3px;
    padding: 0 5px;
    color: #909399;
    border-radius: 4px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
</style>

<style lang="scss">
  .base-select-container {
    .el-select {
      width: 100%;
    }

    .el-select .el-input .el-select__caret.is-reverse {
      transform: rotateZ(0deg);
    }
  }

  
.base-select-main-content {
  &:hover {
    border-color: $color-primary;
    cursor: pointer;
  }
  height: 100% !important;
}
</style>