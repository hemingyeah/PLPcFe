<template>
  <div class="base-select-container">
    <div class="content">
      <div class="base-select-main-content" @click.stop="focusInput" :class="{'error': error}">
        <el-tag size="mini" closable v-for="tag in value" :key="tag.id" @close="removeTag(tag)">
          {{tag.name}}
        </el-tag>
        <input type="text" @focus="initList" :value="keyword" @input="searchByKeyword" ref="input" :style="{width: inputWidth, }">
      </div>
      <ul class="option-list" @scroll="loadMore" ref="list" v-show="showList" tabindex="-1" @blur="showList = false">
        <li v-for="op in options" :key="op.id" @click.stop="selectTag(op)"
            :class="{'selected': value.some(user => user.id ===op.id)}">
          {{op.name}}
        </li>
        <li class="list-message">{{message}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
/**
   * Todo
   * 1. 列表出现在上部还是下部。
   * 2. 点击空白隐藏列表。✅
   * 3. 配置 key value 的name，还是整理好列表传进来
   * 4.
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
    keyName: '',
    valueName: '',
  },
  data() {
    return {
      options: [],
      keyword: '',
      pageNum: 1,
      pageSize: 10,
      showList: false,
      pending: false,
      total: null,
    }
  },
  computed: {
    message() {
      if (this.pending) {
        return '载入更多结果......';
      }
      if (this.total === 0) {
        return '未找到结果';
      }
      if (this.total === this.options.length) {
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

        if(/[\u4E00-\u9FA5]/g.test(character)) {
          width += 17;
        }
        if (/[A-Za-z0-9]/g.test(character)) {
          width += 10;
        }
      });
      return `${width}px`;
    }
  },
  // watch: {
  //   value: {
  //     deep: true,
  //     handler(val) {
  //       console.log('val111111111111s', val);
  //     }
  //   }
  // },
  mounted() {
    document.addEventListener('click', () => {
      this.showList = false;
    }, false);
  },
  methods: {
    focusInput() {
      // console.log('focusInput');
      this.$refs.input.focus();
    },
    removeTag(tag) {
      const newVal = this.value.filter(t => t.id !== tag.id);
      this.$emit('input', newVal);
      this.$emit('update', newVal);
    },
    selectTag(tag) {
      let newValue = this.value;
      if (this.value.every(t => t.id !== tag.id)) {
        newValue.push(tag);
      } else {
        newValue = newValue.filter(t => t.id !== tag.id);
      }

      this.$emit('input', newValue);
      this.$emit('update', newValue);
      this.showList = false;
      if (this.keyword) {
        this.pageNum = 1;
        this.keyword = '';
        this.options = [];
        this.total = null;
      }
    },
    searchByKeyword(e) {
      this.keyword = e.target.value;
      this.pageNum = 1;
      this.search()
        .then(res => {
          this.$refs.list.scrollTop = 0;
          this.options = res.list;
          this.total = res.total;
          // console.log('searchByKeyword')
        })
        .catch(e => console.error('e', e));
    },
    search() {
      if (!this.remoteMethod) return;
      return this.remoteMethod({
        keyword: this.keyword,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      })
    },
    initList() {
      this.showList = true;
      // this.$refs.list.focus();
      if (this.options.length) return;
      this.pending = true;
      this.search()
        .then(res => {
          this.options = res.list;
          this.pending = false;
          this.total = res.total;
          // console.log('initList')
        })
        .catch(e => console.error('e', e));
    },
    loadMore(e) {

      const dom = e.target;
      const clientHeight = dom.clientHeight;
      const scrollTop = dom.scrollTop;
      const scrollHeight = dom.scrollHeight;

      if (this.pending) return;
      if (scrollTop + clientHeight < scrollHeight) return;
      this.pageNum++;
      this.search()
        .then(res => {
          // console.log('loadMore')
          this.options = [...this.options, ...res.list];
          this.total = res.total;
        })
        .catch(e => console.error('e', e));
    }
  },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  .base-select-container {
    position: relative;

    .error.base-select-main-content {
      border-color: red;
    }

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
        /*max-width: 100%;*/
        /*min-width: 10px;*/
      }

      .el-tag {
        margin: 5px 2px 0px;
      }
    }

    .option-list {
      position: absolute;
      left: 0;
      top: 100%;
      width: 100%;
      background: #fff;
      max-height: 200px;
      overflow: auto;
      padding: 0;
      margin: 0;

      li {
        list-style: none;
        padding: 0 5px;
        &:hover {
          /*cursor: pointer;*/
          background: $color-primary-light-9;
        }
      }

      li.selected {
        color: $color-primary;
      }

      .list-message {
        color: $text-color-regular;
      }
    }
  }

</style>