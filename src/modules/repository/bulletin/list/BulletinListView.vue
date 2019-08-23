<template>
  <div class="bulletin-list-view">
    <!-- 左侧列表 -->
    <div class="bulletin-list-left">
      <!-- 搜索部分 -->
      <list-search class="list-search" @search="search"></list-search>
      <!-- 列表部分 -->
      <list class="list" :keyword="params.keyword" @toDetail="toDetail" :value="listMsg" :id.sync="chosenId" ref="list"></list>
      <!-- 页脚部分 -->
      <list-footer class="list-footer" @search="search" :total="listTotal" v-model="params"></list-footer>
    </div>

    <!-- 右侧详情 -->
    <div class="bulletin-list-right">
      <bullet-detail :info="info" @search="search" ref="bulletinDetail"></bullet-detail>
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
        typeId: null,
        pageNum: 1,
        pageSize: 20,
      },
      listTotal: null,
      listMsg: {},
      noticeId: null,
      info: {
        id: null
      },
      chosenId: null
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [BulletinDetailView.name]: BulletinDetailView
  },
  created () {
    this.search()
  },
  methods: {
    async search (params) {
      if(params) Object.assign(this.params, params);
      try {
        let res = await RepositoryApi.getBulletinList(this.params);
        
        if(res.success) {
          this.listTotal = res.result.total;

          this.listMsg = res.result;
          this.toDetail(this.listMsg.list[0]);

          if(this.params.keyword) {
            this.$refs.list.highlight();
          }
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }    
    },

    toDetail (item) {
      this.info.id = item.id;
      this.chosenId = this.info.id;
      // this.info.allowShare = item.allowShare;
      this.$refs.bulletinDetail.getBulletinDetail();
      this.$refs.bulletinDetail.getReadPerson();
      this.$refs.bulletinDetail.getUnreadPerson();
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
