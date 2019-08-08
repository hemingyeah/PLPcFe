<template>
  <div class="document-list-view">
    <!-- 左侧列表 -->
    <div class="document-list-left">
      <!-- 搜索部分 -->
      <list-search class="list-search" :tag="params.tag" @search="search"></list-search>
      <!-- 列表部分 -->
      <list class="list" @tag="setTag" :keyword="params.keyword"></list>
      <!-- 页脚部分 -->
      <list-footer class="list-footer" @search="search"></list-footer>
    </div>

    <!-- 右侧详情 -->
    <div class="document-list-right">
      <list-detail></list-detail>
    </div>
    <!-- <div @click="jumpPage">新建</div> -->
  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import ListDetail from './component/ListDetail'

export default {
  data () {
    return {
      params: {
        tag: {},
        keyword: ''
      }
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [ListDetail.name]: ListDetail
  },
  methods: {
    search (params) {
      Object.assign(this.params, params);
      console.log(this.params);
    },
    setTag (tag) {
      this.params.tag = {
        name: tag,
        show: true
      };
    },
    jumpPage () {
      // window.TDAPP.onEvent('pc：文档库-新建文档');

      // window.location = '/document/create';
      // window.open('/document/create')
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'wiki_create',
        title: '新建文档',
        url: '/document/create',
        reload: true,
        close: true,
        fromId
      });
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
