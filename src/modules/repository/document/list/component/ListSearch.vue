<template>
  <div class="document-list-search">
    <div class="search-top">
      <button class="base-button search-new" @click="create">新建</button>
      <div class="search-input-container" ref="searchInput">
        <el-input 
          class="search-input"
          placeholder="输入关键词搜索" 
          v-model="params.keyword"
          @keyup.enter.native="search"
          v-if="isSearch"
          clearable>
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <button class="search-btn" @click="toSearch" v-else>
          <i class="iconfont icon-search1 serach-icon"></i>
        </button>
      </div>
    </div>
    <div class="search-middle">
      <el-select v-model="params.type" class="search-type search-type-left" @change="search">
        <el-option value="" label="全部(1312)"></el-option>
        <el-option value="1" label="我发布的(1312)"></el-option>
        <el-option value="2" label="草稿箱(1312)"></el-option>
      </el-select>
      <el-cascader :options="options" clearable class="search-type search-type-right" @change="search"></el-cascader>
    </div>
    <div class="search-bottom">
      <el-select v-model="params.sort" class="search-sort" @change="search">
        <el-option value="1" label="按更新时间排序"></el-option>
        <el-option value="2" label="按访问量排序"></el-option>
      </el-select>
      <el-tag class="search-tag" closable @close="tag.show = false" v-if="tag.show">{{tag.name}}</el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list-search',
  props: {
    tag: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      options: [],
      typeOptions: [],
      isSearch: false,
      params: {
        keyword: '',
        type: '',
        sort: '1',
      }
    }
  },
  mounted () {
    // this.toggleInput();
  },
  methods: {
    create () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'wiki_create',
        title: '新建文档',
        url: '/document/create',
        reload: true,
        close: true,
        fromId
      });
    },
    toSearch () {
      this.isSearch = true;
      this.toggleInput();
    },
    search () {
      this.$emit('search', this.params);
    },
    toggleInput () {
      if (this.isSearch) {
        document.addEventListener('click', (e) => {
          if(!this.$refs.searchInput) return;
          if (this.params.keyword) return;
          if(!this.$refs.searchInput.contains(e.target)) {
            this.isSearch = false;
          }
        })
      } else {
        document.removeEventListener('click', (e) => {
          console.log('取消')
        })
      }
    }
  },
  watch: {
    'tag': {
      handler(newValue, oldValue) {
        this.search();
      },
      deep: true,
    }
  }
}
</script>

<style lang="scss">
.document-list-search {
  background: #fff;
  padding: 11px;
  
  .search-top {
    display: flex;
    justify-content: space-between;

    .search-input-container {
      position: relative;

      .search-input {
        height: 36px;
        width: 250px;
        // position: absolute;
        // right: 36px;
        // vertical-align: middle;

        .el-input__inner {
          height: 100%;
        }
      }

      .search-btn {
        // vertical-align: middle;
        margin: 0;
        border: 1px solid #E3E9EA;  //自定义边框
        outline: none;    //消除默认点击蓝色边框效果
        height: 36px;
        width: 36px;
        line-height: 30px;
        border-radius: 2px;

        .serach-icon {
          font-size: 18px;
          color: #55B7B4;
        }
      }
    }
  }

  .search-middle {
    padding: 11px 0;
    display: flex;

    .search-type {
      height: 36px;

      .el-cascader .el-input.is-focus .el-input__inner {
        border-color: #e0e1e2;
      }

      .el-input__inner:focus {
        border-color: #e0e1e2;
      }

      .el-input__inner:hover {
        border-color: #e0e1e2;
      }
    }

    .search-type-left {
      width: 140px;

      .el-input__inner {
        border-right: none;
        border-radius: 2px 0 0 2px;
      }
    }

    .search-type-right {
      flex: 1;

      .el-input__inner {
        border-radius: 0 2px 2px 0;
      }
    }
  }

  .search-bottom {
    font-size: 0;

    .search-sort {
      vertical-align: middle;

      .el-input__inner {
        height: 24px;
        border: none;
        background: #E8EFF0;
        width: 140px;
        color: #717C83 !important;
      }

      .el-input__icon {
        line-height: 24px;
      }
    }

    .search-tag {
      vertical-align: middle;
      margin-left: 5px;
      height: 24px;
      line-height: 24px;
      border: none;
      background: #E8EFF0;
      border-radius: 2px;
      color: #717C83;

      .el-icon-close {
        color: #333;

        &:hover {
          background: #999;
          color: #fff;
        }
      }
    }
  }
}
</style>