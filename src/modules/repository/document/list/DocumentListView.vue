<template>
  <div class="document-list-view">
    <!-- 左侧列表 -->
    <div class="document-list-left">
      <!-- 搜索部分 -->
      <list-search class="list-search" v-model="params" :tag="tag" @search="search"></list-search>
      <!-- 列表部分 -->
      <list class="list" @tag="setTag" :keyword="params.keyword" @toDetail="toDetail" :value="listMsg"></list>
      <!-- 页脚部分 -->
      <list-footer class="list-footer" @search="search" :total="listTotal" v-model="params"></list-footer>
    </div>

    <!-- 右侧详情 -->
    <div class="document-list-right">
      <document-detail :info="info" ref="documentDetail"></document-detail>
    </div>
    
  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import DocumentDetailView from '../detail/DocumentDetailView'

import * as RepositoryApi from '@src/api/Repository'
import * as Lang from '@src/util/lang/index.js';

export default {
  data () {
    return {
      params: {
        // label: '',
        // keyword: '', // 搜索的关键词
        pageNum: 1,
        pageSize: 20,
        // orderDetail: {
        //   isSystem: 1,
        //   column: 'createTime',
        //   type: '',
        //   sequence: 'desc'
        // },
        // view: '',
      },
      tag: {}, // 选中的标签
      listTotal: null,
      listMsg: {},
      info: {}
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [DocumentDetailView.name]: DocumentDetailView
  },
  created () {
    this.search()
  },
  methods: {
    // 获取文档库列表，将ListSearch、ListFooter组件传递的参数合并
    async search (params) {
      if(params) Object.assign(this.params, params);
      try {
        let res = await RepositoryApi.getDocumentList(this.params);
        
        if(res.success) {
          this.listTotal = res.result.total;
          res.result.list.forEach(item => {
            item.createTime = Lang.fmt_gmt_time(item.createTime, 0);
          })
          this.listMsg = res.result;
          this.info = this.listMsg[0];
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }    
    },
    
    // 给子组件传过来的tag加上show属性
    setTag (tag) {
      this.tag = {
        name: tag,
        show: true
      };
    },

    toDetail (item) {
      // TODO: 将id、权限传入详情
      this.info = item;
    },
    
  }
}
</script>

<style lang="scss">
.document-list-view {
  padding: 10px;
  height: 100vh;
  display: flex;

  .document-list-left {
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

  .document-list-right {
    flex: 1;
    height: 100%;
    margin-left: 10px;
    background: #fff;
  }
}
</style>
