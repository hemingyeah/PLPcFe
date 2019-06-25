<template>
  <div class="base-select-container">
    <div class="content" v-clickoutside="closeList">
      <div class="base-select-main-content multiple-layout el-select" @click.stop="focusInput" v-if="multiple"
           :class="{'error': error, 'wrapper-is-focus': isFocus, 'clearable-layout': clearable}">

        <el-tag size="mini" closable v-for="tag in value" :key="tag.value" @close="removeTag(tag)" disable-transitions type="info">
          {{tag.label}}
        </el-tag>
        <span v-if="value.length <= 0" class="placeholder-text">
          {{ placeholder }}
        </span>
      </div>

      <div class="base-select-main-content" @click.stop="focusInput" v-else
           :class="{'error': error, 'wrapper-is-focus': isFocus, 'clearable-layout': clearable,}">
        {{value.map(tag => tag.label).join('')}}
        <span v-if="value.length <= 0" class="placeholder-text">
          {{ placeholder }}
        </span>
      </div>

      <i v-if="clearable && value.length" class="iconfont icon-minus-fill clear-btn" @click="clearValue"></i>

      <div class="list-wrapper" v-show="showList">
        <div class="arrow"></div>
        <div class="input-container" v-if="!options.length">
          <input type="text" v-model="keyword" @input="searchByKeyword" ref="input" :placeholder="placeholder">
        </div>

        <ul class="option-list" v-loadmore="loadmoreOptions" ref="list">

          <li v-for="op in optionList" :key="op.value" @click="selectTag(op)" :class="{'selected': value.some(user => user.value ===op.value)}">
            <slot name="option" :option="op" v-if="optionSlot"> </slot>
            <template v-else>{{op.label}}</template>
            <div class="checked"></div>
          </li>

          <li class="list-message" v-if="message">{{message}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Clickoutside from '@src/util/clickoutside';
import Page from '@model/Page';

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
      page: new Page()
    }
  },
  computed: {
    optionList() {
      if (this.options.length) return this.options;
      return this.page.list;
    },
    optionSlot() {
      return !!this.$scopedSlots.option;
    },
    message() {
      const {total, hasNextPage, } = this.page;
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
    focusInput() {
      this.isFocus = true;
      this.initList();
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
      const newVal = this.value.filter(t => t.value !== tag.value);
      this.$emit('input', newVal);
    },
    selectTag(tag) {
      let newValue = this.value;

      if (!this.multiple) {
        newValue = [tag];
        this.showList = false;
        this.resetStatus();

      } else {
        if (this.value.every(t => t.value !== tag.value)) {
          newValue.push(tag);
        } else {
          newValue = newValue.filter(t => t.value !== tag.value);
        }
      }

      this.$emit('input', newValue);
    },
    async loadmore(){
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
      const {pageNum, pageSize, } = this.page;
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
    },
    searchByKeyword(e) {
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
    },
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
  },
  directives: { Clickoutside },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  .form-item.err :not(.is-success) input, .form-item.err :not(.is-success) .base-select-main-content {
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
        margin: 5px 2px 0px;
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
      position: absolute;
      left: 0;
      top: calc(100% + 13px);
      width: 100%;
      padding-top: 34px;
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

      .input-container {
        position: absolute;
        width: 100%;
        top: 0;
        left: 0;
        padding: 0 10px;
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
</style>
