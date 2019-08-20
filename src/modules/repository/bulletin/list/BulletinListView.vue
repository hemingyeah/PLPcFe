<template>
  <div class="bulletin-list-view">
    <!-- 左侧列表 -->
    <div class="bulletin-list-left">
      <!-- 搜索部分 -->
      <list-search class="list-search" @search="search"></list-search>
      <!-- 列表部分 -->
      <list class="list" :keyword="params.keyword" @toDetail="toDetail"></list>
      <!-- 页脚部分 -->
      <list-footer class="list-footer" @search="search"></list-footer>
    </div>

    <!-- 右侧详情 -->
    <div class="bulletin-list-right">
      <bullet-detail :noticeId="noticeId"></bullet-detail>
    </div>

  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import BulletinDetailView from '../detail/BulletinDetailView'

import * as RepositoryApi from '@src/api/Repository'

export default {
  data () {
    return {
      params: {
        keyword: '', // 搜索的关键词
      },
      listTotal: null,
      listMsg: {},
      noticeId: null
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [BulletinDetailView.name]: BulletinDetailView
  },
  methods: {
    async search (params) {
      if(params) Object.assign(this.params, params);
      try {
        let res = await RepositoryApi.getBulletinList(this.params);
        console.log(res.result);
        
        if(res.success) {
          this.listTotal = res.result.total;
          this.listMsg = res.result;
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }    
      // TODO: 查询数据操作
    },

    toDetail (item) {
      this.noticeId = item.id;
      // TODO: 将id传入详情
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-view {
  padding: 10px;
  height: 100vh;
  display: flex;

  .bulletin-list-left {
    width: 450px;
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

  .bulletin-list-right {
    flex: 1;
    height: 100%;
    margin-left: 10px;
    background: #fff;
  }
}
</style>
