<template>
  <div class="bulletin-list-search" ref="search">
    <div class="search-top">
      <button class="base-button search-new" @click="create">新建</button>
      <!-- 关键词搜索框 -->
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
    <!-- 通知公告类型筛选 -->
    <div class="search-bottom">
      <el-select v-model="params.type" class="search-type" @change="search">
        <el-option v-for="(item, index) in typeOptions" :key="index" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list-search',
  data () {
    return {
      typeOptions: [], // 类型
      isSearch: false, // 搜索框显示标识
      params: {
        keyword: '',
        type: '',
      }
    }
  },
  methods: {
    // 跳转到新建页面
    create () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'bulletin_create',
        title: '新建文档',
        url: '/bulletin/create',
        reload: true,
        close: true,
        fromId
      });
    },
    // 显示搜索框
    toSearch () {
      this.isSearch = true;
      this.toggleInput();
    },
    // 输入关键词或选择条件时向父组件触发search事件
    search () {
      this.$emit('search', this.params);
    },
    toggleInput () {
      if (this.isSearch) {
        document.addEventListener('click', (e) => {
          if(!this.$refs.searchInput || !this.$refs.search) return;
          if (this.params.keyword) return;
          if(!this.$refs.searchInput.contains(e.target) && this.$refs.search.contains(e.target)) {
            this.isSearch = false;
          }
        })
      } else {
        document.removeEventListener('click', (e) => {
          console.log('取消')
        })
      }
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-search {
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

  .search-bottom {
    font-size: 0;
    padding-top: 11px;

    .search-type {
      vertical-align: middle;
      width: 100%;
    }
  }
}
</style>