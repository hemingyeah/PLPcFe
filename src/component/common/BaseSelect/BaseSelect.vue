<template>
  <div class="base-select-container">
    <!--<div class="content" @focusin="initList" @focusout.prevent="closeList" v-clickoutside="closeList">-->
    <div class="content" v-clickoutside="closeList">
      <div class="base-select-main-content el-select" @click.stop="focusInput"
           :class="{'error': error, 'wrapper-is-focus': isFocus, }">
        <el-tag size="mini" closable v-for="tag in value" :key="tag.id" @close="removeTag(tag)" disable-transitions
                type="info">
          {{tag.name}}
        </el-tag>
        <input type="text" v-model="keyword" @input="searchByKeyword" ref="input" :style="{width: inputWidth, }">
      </div>
      <div class="list-wrapper" v-show="showList">
        <div class="arrow"></div>
        <ul class="option-list" @scroll="loadMore" ref="list" tabindex="-1">
          <li v-for="op in page.list" :key="op.id" @click="selectTag(op)"
              :class="{'selected': value.some(user => user.id ===op.id)}">
            {{op.name}}
          </li>
          <li class="list-message">{{message}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Clickoutside from '@src/util/clickoutside';

/**
 * Todo
 * 1. 列表出现在上部还是下部。
 * 2. 点击空白隐藏列表。✅
 * 3. 配置 key value 的name，还是整理好列表传进来
 * 4. 关闭弹窗没有重置联系人 ✅
 */
export default {
  name: "base-select",
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
    options: {
      type: Array,
      default: () => ([]),
    }
  },
  data() {
    return {
      showList: false,
      pending: false,
      isFocus: false,
      keyword: '',

      page: {
        list: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
      }
    }
  },
  watch: {
  },
  computed: {
    alreadyLoadedAll() {
      const {list, total} = this.page;
      return list.length === total;
    },
    message() {
      if (this.pending) {
        return '载入更多结果......';
      }
      if (this.page.total === 0) {
        return '未找到结果';
      }
      if (this.alreadyLoadedAll) {
        return '已加载全部结果';
      }
      return '载入更多结果......';
    },
    inputWidth() {
      if (!this.showList) return '0px';
      if (!this.keyword) return '10px';
      const arr = this.keyword.split('');
      let width = 4;
      arr.forEach(character => {

        if (/[\u4E00-\u9FA5]/g.test(character)) {
          width += 17;
        }
        if (/[A-Za-z0-9]/g.test(character)) {
          width += 10;
        }
      });
      return `${width}px`;
    }
  },
  mounted() {
  },
  methods: {
    focusInput() {
      this.$refs.input.focus();
      this.isFocus = true;
      this.initList();
    },
    closeList(e) {
      this.showList = false;
      this.isFocus = false;
      this.pending = true;
      this.resetStatus('');
    },
    removeTag(tag) {
      const newVal = this.value.filter(t => t.id !== tag.id);
      this.$emit('input', newVal);
    },
    selectTag(tag) {
      let newValue = this.value;
      if (this.value.every(t => t.id !== tag.id)) {
        newValue.push(tag);
      } else {
        newValue = newValue.filter(t => t.id !== tag.id);
      }

      this.$emit('input', newValue);
      this.showList = false;
      this.resetStatus();
    },
    search() {
      if (!this.remoteMethod) return;
      const {pageNum, pageSize,} = this.page;
      return this.remoteMethod({
        keyword: this.keyword,
        pageNum,
        pageSize,
      })
    },
    searchByKeyword(e) {
      this.resetStatus(e.target.value);
      this.pending = true;
      this.search()
        .then(res => {
          this.pending = false;
          if (!res || !res.list) return;
          this.$refs.list.scrollTop = 0;
          this.updatePageData(res);
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
          this.pending = false;
          if (!res || !res.list) return;
          this.updatePageData(res);
        })
        .catch(e => {
          console.log('initList catch e', e)
        });
    },
    loadMore(e) {
      const dom = e.target;
      const clientHeight = dom.clientHeight;
      const scrollTop = dom.scrollTop;
      const scrollHeight = dom.scrollHeight;

      if (this.pending) return;
      if (scrollTop + clientHeight < scrollHeight) return;
      if (this.alreadyLoadedAll) return;
      this.page.pageNum++;
      this.pending = true;
      this.search()
        .then(res => {
          this.pending = false;
          if (!res || !res.list) return;
          res.list = [...this.page.list, ...res.list];
          this.updatePageData(res);
        })
        .catch(e => {
          console.log('loadMore catch e', e)
        });
    },
    updatePageData(source) {
      const {list, pageSize, pageNum, total,} = source;
      this.page = {
        list,
        total,
        pageSize,
        pageNum,
      }
    },
    resetStatus(keyword) {
      this.keyword = keyword || '';
      this.page = {
        list: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
      }
    },
  },
  directives: { Clickoutside },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  .base-select-container {
    position: relative;

    .base-select-main-content {

      display: flex;
      flex-wrap: wrap;
      border: 1px solid #e0e1e2;
      border-radius: 2px;

      input {
        border: none;
        padding: 0 2px;
        margin: 0;
        line-height: 30px;
        flex-shrink: 1;
        flex-grow: 1;
      }

      .el-tag {
        margin: 5px 2px 0px;
      }
    }

    .wrapper-is-focus {
      border-color: $color-primary;
    }

    .error.base-select-main-content {
      border-color: red;
    }

    .list-wrapper {
      position: absolute;
      left: 0;
      top: calc(100% + 13px);
      width: 100%;

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
    }

    .option-list {
      background: #fff;
      max-height: 200px;
      overflow: auto;
      padding: 0;
      margin: 0;
      box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.15);

      &::-webkit-scrollbar-track {
        background-color: white;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(144, 147, 153, 0.3);
      }

      li {
        list-style: none;
        padding: 0 20px;
        line-height: 34px;
        &:hover {
          background: $color-primary-light-9;
        }
      }

      li:last-child {
        &:hover {
          background: white;
        }
      }

      li.selected {
        color: $color-primary;
        font-weight: 700;
      }

      .list-message {
        color: $text-color-secondary;
      }
    }
  }
</style>
