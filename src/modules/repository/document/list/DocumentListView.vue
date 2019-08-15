<template>
  <div class="document-list-view">
    <!-- 左侧列表 -->
    <div class="document-list-left">
      <!-- 搜索部分 -->
      <list-search class="list-search" :tag="params.tag" @search="search"></list-search>
      <!-- 列表部分 -->
      <list class="list" @tag="setTag" :keyword="params.keyword" @toDetail="toDetail"></list>
      <!-- 页脚部分 -->
      <list-footer class="list-footer" @search="search"></list-footer>
    </div>

    <!-- 右侧详情 -->
    <div class="document-list-right">
      <document-detail></document-detail>
    </div>
    
  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import DocumentDetailView from '../detail/DocumentDetailView'

export default {
  data () {
    return {
      params: {
        tag: {}, // 选中的标签
        keyword: '' // 搜索的关键词
      }
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [DocumentDetailView.name]: DocumentDetailView
  },
  methods: {
    search (params) {
      Object.assign(this.params, params);
      // TODO: 查询数据操作
    },
    
    // 给子组件传过来的tag加上show属性
    setTag (tag) {
      this.params.tag = {
        name: tag,
        show: true
      };
    },

    toDetail (item) {
      // TODO: 将id传入详情
    }
  }
}
</script>

<style lang="scss">
.document-list-view {
  padding: 10px;
  height: 100vh;
  display: flex;

  .document-list-left {
    width: 400px;
    display: flex;
    height: 100%;
    flex-direction: column;

    .list-search {
      position: relative;
      z-index: 99;
      box-shadow:0px 2px 4px 0px rgba(232,232,232,1);
    }

    .list {
      background: #fff;
      flex: 1
    }

    .list-footer {
      margin-top: 3px;
    }
  }

  .document-list-right {
    flex: 1;
    height: 100%;
    margin-left: 10px;
    background: #fff;
  }
}
</style>
